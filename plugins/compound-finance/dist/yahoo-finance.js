/**
 * Yahoo Finance client for Swedish stock data.
 *
 * Uses the unofficial v8 chart API and v6 quote API.
 * Swedish stocks use .ST suffix (Stockholm exchange).
 *
 * Known quirks:
 * - No API key needed, but can get rate-limited
 * - Ticker symbols don't always match company names (need search endpoint)
 * - Some tickers use dash (HEXA-B.ST), some don't (VOLV-B.ST)
 */
const YF_BASE = "https://query1.finance.yahoo.com";
const USER_AGENT = "InsiderTradeScanner/1.0";
/**
 * Search for a stock ticker by company name.
 * Returns matching tickers on the Stockholm exchange.
 */
export async function searchTicker(query) {
    const url = `${YF_BASE}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&lang=sv`;
    const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) {
        throw new Error(`Yahoo Finance search failed: ${res.status}`);
    }
    const data = (await res.json());
    return data.quotes
        .filter((q) => q.exchange === "STO" ||
        q.symbol.endsWith(".ST") ||
        q.exchange === "NGM" // Nordic Growth Market
    )
        .map((q) => ({
        symbol: q.symbol,
        name: q.shortname,
        exchange: q.exchange,
    }));
}
/**
 * Get current quote data for a stock.
 *
 * Uses the v8 chart endpoint (meta field) since v6/v7/v10 quote endpoints
 * now require authentication. The chart meta contains price, 52-week range,
 * and basic info. Market cap is NOT available here — we estimate it from
 * price * shares outstanding if available, or skip it.
 */
export async function getQuote(symbol) {
    const sym = symbol.includes(".") ? symbol : `${symbol}.ST`;
    const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1d`;
    const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) {
        throw new Error(`Yahoo Finance chart failed: ${res.status}`);
    }
    const data = (await res.json());
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) {
        throw new Error(`No chart data for ${sym}`);
    }
    const change = meta.regularMarketPrice - meta.chartPreviousClose;
    const changePercent = meta.chartPreviousClose > 0
        ? (change / meta.chartPreviousClose) * 100
        : 0;
    return {
        symbol: meta.symbol,
        shortName: meta.shortName,
        longName: meta.longName || meta.shortName,
        currency: meta.currency,
        regularMarketPrice: meta.regularMarketPrice,
        regularMarketChange: Math.round(change * 100) / 100,
        regularMarketChangePercent: Math.round(changePercent * 100) / 100,
        marketCap: 0, // Not available in chart meta — enriched separately if needed
        trailingPE: null, // Not available in chart meta
        priceToBook: null, // Not available in chart meta
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    };
}
/**
 * Get price history for a stock.
 * Used for contra-trend detection (is the insider buying while price drops?).
 */
export async function getPriceHistory(symbol, range = "3mo") {
    const sym = symbol.includes(".") ? symbol : `${symbol}.ST`;
    const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(sym)}?range=${range}&interval=1d`;
    const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) {
        throw new Error(`Yahoo Finance chart failed: ${res.status}`);
    }
    const data = (await res.json());
    const result = data.chart?.result?.[0];
    if (!result) {
        throw new Error(`No chart data for ${sym}`);
    }
    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;
    const prices = [];
    for (let i = 0; i < timestamps.length; i++) {
        if (closes[i] != null) {
            prices.push({
                date: new Date(timestamps[i] * 1000).toISOString().split("T")[0],
                close: closes[i],
            });
        }
    }
    // Calculate change percentages
    const currentPrice = prices[prices.length - 1]?.close ?? 0;
    const price30dAgo = prices[Math.max(0, prices.length - 22)]?.close ?? currentPrice;
    const price90dAgo = prices[0]?.close ?? currentPrice;
    return {
        symbol: sym,
        prices,
        changePercent30d: price30dAgo > 0
            ? ((currentPrice - price30dAgo) / price30dAgo) * 100
            : 0,
        changePercent90d: price90dAgo > 0
            ? ((currentPrice - price90dAgo) / price90dAgo) * 100
            : 0,
    };
}
/**
 * Determine company size category based on market cap (SEK).
 */
export function getCompanySizeCategory(marketCapSEK) {
    if (marketCapSEK < 1_000_000_000)
        return "micro"; // <1B SEK
    if (marketCapSEK < 5_000_000_000)
        return "small"; // 1-5B SEK
    if (marketCapSEK < 50_000_000_000)
        return "mid"; // 5-50B SEK
    return "large"; // >50B SEK
}
/**
 * Estimate market cap from 52-week range and average daily volume.
 * Heuristic: mid-point of 52w range × estimated shares outstanding.
 *
 * More reliable approach: use the daily volume * price to infer float size.
 * Average Swedish large cap trades ~0.5-1% of float daily.
 * Small cap trades ~0.1-0.3% daily.
 * We use 0.3% as a middle estimate → shares_outstanding ≈ avg_volume / 0.003
 */
export async function estimateMarketCap(symbol) {
    const sym = symbol.includes(".") ? symbol : `${symbol}.ST`;
    const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(sym)}?range=1mo&interval=1d`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok)
        throw new Error(`Chart failed: ${res.status}`);
    const data = (await res.json());
    const result = data.chart?.result?.[0];
    if (!result)
        throw new Error(`No data for ${sym}`);
    const price = result.meta.regularMarketPrice;
    const volumes = result.indicators.quote[0].volume.filter((v) => v != null && v > 0);
    if (volumes.length === 0) {
        return { marketCapSEK: 0, confidence: "low" };
    }
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    // Estimate: avg daily volume ≈ 0.3% of total shares
    const estShares = avgVolume / 0.003;
    const marketCapSEK = Math.round(estShares * price);
    return { marketCapSEK, confidence: "medium" };
}
/**
 * Get OMXS30 index performance for benchmarking.
 * Symbol: ^OMX (Yahoo Finance).
 */
export async function getOMXS30Performance(range = "3mo") {
    const url = `${YF_BASE}/v8/finance/chart/%5EOMX?range=${range}&interval=1d`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) {
        throw new Error(`OMXS30 fetch failed: ${res.status}`);
    }
    const data = (await res.json());
    const result = data.chart?.result?.[0];
    if (!result)
        throw new Error("No OMXS30 data");
    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;
    const prices = [];
    for (let i = 0; i < timestamps.length; i++) {
        if (closes[i] != null) {
            prices.push({
                date: new Date(timestamps[i] * 1000).toISOString().split("T")[0],
                close: closes[i],
            });
        }
    }
    const current = prices[prices.length - 1]?.close ?? 0;
    const first = prices[0]?.close ?? current;
    const price30dAgo = prices[Math.max(0, prices.length - 22)]?.close ?? current;
    return {
        currentValue: current,
        changePercent: first > 0 ? Math.round(((current - first) / first) * 10000) / 100 : 0,
        changePercent30d: price30dAgo > 0
            ? Math.round(((current - price30dAgo) / price30dAgo) * 10000) / 100
            : 0,
        prices,
    };
}
