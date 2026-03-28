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

export interface StockQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  marketCap: number;
  trailingPE: number | null;
  priceToBook: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface PriceHistory {
  symbol: string;
  prices: { date: string; close: number }[];
  changePercent30d: number;
  changePercent90d: number;
}

/**
 * Search for a stock ticker by company name.
 * Returns matching tickers on the Stockholm exchange.
 */
export async function searchTicker(
  query: string
): Promise<{ symbol: string; name: string; exchange: string }[]> {
  const url = `${YF_BASE}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&lang=sv`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance search failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    quotes: { symbol: string; shortname: string; exchange: string; quoteType: string }[];
  };

  return data.quotes
    .filter(
      (q) =>
        q.exchange === "STO" ||
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
export async function getQuote(symbol: string): Promise<StockQuote> {
  const sym = symbol.includes(".") ? symbol : `${symbol}.ST`;

  const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1d`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance chart failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    chart: {
      result: Array<{
        meta: {
          symbol: string;
          shortName: string;
          longName?: string;
          currency: string;
          regularMarketPrice: number;
          chartPreviousClose: number;
          fiftyTwoWeekHigh: number;
          fiftyTwoWeekLow: number;
          regularMarketVolume?: number;
        };
      }>;
    };
  };

  const meta = data.chart?.result?.[0]?.meta;
  if (!meta) {
    throw new Error(`No chart data for ${sym}`);
  }

  const change = meta.regularMarketPrice - meta.chartPreviousClose;
  const changePercent =
    meta.chartPreviousClose > 0
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
export async function getPriceHistory(
  symbol: string,
  range: "1mo" | "3mo" | "6mo" | "1y" = "3mo"
): Promise<PriceHistory> {
  const sym = symbol.includes(".") ? symbol : `${symbol}.ST`;

  const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(sym)}?range=${range}&interval=1d`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance chart failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    chart: {
      result: Array<{
        timestamp: number[];
        indicators: {
          quote: Array<{ close: (number | null)[] }>;
        };
      }>;
    };
  };

  const result = data.chart?.result?.[0];
  if (!result) {
    throw new Error(`No chart data for ${sym}`);
  }

  const timestamps = result.timestamp;
  const closes = result.indicators.quote[0].close;

  const prices: { date: string; close: number }[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (closes[i] != null) {
      prices.push({
        date: new Date(timestamps[i] * 1000).toISOString().split("T")[0],
        close: closes[i]!,
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
    changePercent30d:
      price30dAgo > 0
        ? ((currentPrice - price30dAgo) / price30dAgo) * 100
        : 0,
    changePercent90d:
      price90dAgo > 0
        ? ((currentPrice - price90dAgo) / price90dAgo) * 100
        : 0,
  };
}

/**
 * Determine company size category based on market cap (SEK).
 */
export function getCompanySizeCategory(
  marketCapSEK: number
): "micro" | "small" | "mid" | "large" {
  if (marketCapSEK < 1_000_000_000) return "micro"; // <1B SEK
  if (marketCapSEK < 5_000_000_000) return "small"; // 1-5B SEK
  if (marketCapSEK < 50_000_000_000) return "mid"; // 5-50B SEK
  return "large"; // >50B SEK
}
