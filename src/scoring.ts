/**
 * Insider trade scoring engine.
 *
 * Scores each trade 0-10 based on research-backed signals:
 * - Role of the insider (VD > CFO > Styrelse > Närstående)
 * - Trade size relative to typical compensation
 * - Cluster buying (multiple insiders same company/week)
 * - Buying against the trend (price dropping)
 * - Company size (small caps = stronger signal)
 */

import type { InsiderTrade, TradeScore } from "./types.js";
import {
  searchTicker,
  getPriceHistory,
  getQuote,
  getCompanySizeCategory,
} from "./yahoo-finance.js";

const ROLE_SCORES: Record<string, number> = {
  "Verkställande direktör": 3,
  VD: 3,
  CEO: 3,
  CFO: 2.5,
  "Ekonomichef": 2.5,
  Styrelseordförande: 2,
  "Vice verkställande direktör": 2,
  Styrelseledamot: 1.5,
  "Ledande befattningshavare": 1.5,
};

function getRoleScore(role: string): number {
  // Check for exact match first
  if (ROLE_SCORES[role]) return ROLE_SCORES[role];

  // Partial match
  const roleLower = role.toLowerCase();
  if (roleLower.includes("verkställande direktör") || roleLower.includes("vd"))
    return 3;
  if (roleLower.includes("ekonomichef") || roleLower.includes("cfo"))
    return 2.5;
  if (roleLower.includes("ordförande")) return 2;
  if (roleLower.includes("styrelseledamot")) return 1.5;
  if (roleLower.includes("ledande")) return 1.5;

  // Close associate or unknown role
  return 0.5;
}

function getSizeSignal(trade: InsiderTrade): number {
  const totalValue = trade.volume * trade.price;

  // Rough heuristic based on Swedish executive compensation
  // Average VD salary ~3-5M SEK, board member ~200-500k
  if (totalValue >= 5_000_000) return 2; // Huge — very strong signal
  if (totalValue >= 2_000_000) return 1.5;
  if (totalValue >= 500_000) return 1;
  if (totalValue >= 100_000) return 0.5;
  return 0;
}

/**
 * Detect cluster buying: multiple insiders at the same company within a time window.
 * Pass all trades for the same issuer.
 */
function getClusterSignal(
  trade: InsiderTrade,
  allTradesForIssuer: InsiderTrade[]
): number {
  const tradeDate = new Date(trade.transactionDate);
  const windowMs = 7 * 24 * 60 * 60 * 1000; // 7 days

  const uniqueBuyers = new Set<string>();
  for (const t of allTradesForIssuer) {
    if (t.transactionType !== "Förvärv") continue;
    const tDate = new Date(t.transactionDate);
    if (Math.abs(tDate.getTime() - tradeDate.getTime()) <= windowMs) {
      uniqueBuyers.add(t.person);
    }
  }

  if (uniqueBuyers.size >= 3) return 2; // Strong cluster
  if (uniqueBuyers.size >= 2) return 1; // Moderate cluster
  return 0;
}

/**
 * Score a single insider trade with stock data enrichment.
 * Optionally pass all trades for the same issuer for cluster detection.
 */
export async function scoreTrade(
  trade: InsiderTrade,
  allTradesForIssuer: InsiderTrade[] = [],
  options: { enrichWithStockData?: boolean } = {}
): Promise<TradeScore> {
  // Only score buys — sells are much weaker signals
  const isBuy = trade.transactionType === "Förvärv";

  const roleWeight = getRoleScore(trade.role);
  const sizeSignal = getSizeSignal(trade);
  const clusterSignal = getClusterSignal(
    trade,
    allTradesForIssuer.length > 0 ? allTradesForIssuer : [trade]
  );

  let contraTrend = 0;
  let companySizeBonus = 0;

  if (options.enrichWithStockData !== false) {
    try {
      const enrichment = await enrichWithStockData(trade);
      contraTrend = enrichment.contraTrend;
      companySizeBonus = enrichment.companySizeBonus;
    } catch {
      // Stock data unavailable — score without it
    }
  }

  let totalScore = isBuy
    ? roleWeight + sizeSignal + clusterSignal + contraTrend + companySizeBonus
    : Math.min(roleWeight + sizeSignal, 3); // Cap sell signals at 3

  totalScore = Math.min(Math.round(totalScore * 10) / 10, 10);

  const totalValue = trade.volume * trade.price;
  const reasoning = buildReasoning(trade, {
    roleWeight,
    sizeSignal,
    clusterSignal,
    contraTrend,
    companySizeBonus,
    totalValue,
    isBuy,
  });

  return {
    trade,
    totalScore,
    breakdown: {
      roleWeight,
      sizeSignal,
      clusterSignal,
      contraTrend,
      companySizeBonus,
    },
    reasoning,
  };
}

function buildReasoning(
  trade: InsiderTrade,
  ctx: {
    roleWeight: number;
    sizeSignal: number;
    clusterSignal: number;
    contraTrend: number;
    companySizeBonus: number;
    totalValue: number;
    isBuy: boolean;
  }
): string {
  const parts: string[] = [];

  if (!ctx.isBuy) {
    parts.push(
      `⚠️ Sell signal — generally weaker (people sell for many reasons)`
    );
  }

  if (ctx.roleWeight >= 2.5) {
    parts.push(`✅ ${trade.role} — high operational insight`);
  } else if (ctx.roleWeight >= 1.5) {
    parts.push(`📋 ${trade.role} — moderate insight`);
  } else {
    parts.push(`ℹ️ ${trade.role} — limited operational insight`);
  }

  const formattedValue = new Intl.NumberFormat("sv-SE").format(ctx.totalValue);
  if (ctx.sizeSignal >= 1.5) {
    parts.push(`💰 Large trade: ${formattedValue} ${trade.currency}`);
  } else if (ctx.sizeSignal >= 0.5) {
    parts.push(`💵 Moderate trade: ${formattedValue} ${trade.currency}`);
  }

  if (ctx.clusterSignal >= 2) {
    parts.push(`🔥 Cluster buying detected — multiple insiders this week`);
  } else if (ctx.clusterSignal >= 1) {
    parts.push(`👥 Two insiders buying — mild cluster signal`);
  }

  return parts.join("\n");
}

/**
 * Enrich a trade with stock data from Yahoo Finance.
 * Resolves ticker from ISIN or company name, then fetches price + market cap.
 */
async function enrichWithStockData(
  trade: InsiderTrade
): Promise<{ contraTrend: number; companySizeBonus: number }> {
  // Try to find ticker — search by company name
  const issuerClean = trade.issuer
    .replace(/\s*(AB|Aktiebolag|\(publ\))\s*/gi, "")
    .trim();
  const tickers = await searchTicker(issuerClean);

  if (tickers.length === 0) {
    return { contraTrend: 0, companySizeBonus: 0 };
  }

  const symbol = tickers[0].symbol;

  // Get price history for contra-trend
  const history = await getPriceHistory(symbol, "3mo");
  let contraTrend = 0;
  if (history.changePercent30d < -10) contraTrend = 2;
  else if (history.changePercent30d < -5) contraTrend = 1;

  // Get quote for market cap
  let companySizeBonus = 0;
  try {
    const quote = await getQuote(symbol);
    const size = getCompanySizeCategory(quote.marketCap);
    if (size === "micro") companySizeBonus = 1;
    else if (size === "small") companySizeBonus = 0.75;
    else if (size === "mid") companySizeBonus = 0.5;
    // large = 0
  } catch {
    // Quote failed, skip market cap scoring
  }

  return { contraTrend, companySizeBonus };
}

/**
 * Score and rank multiple trades with stock data enrichment.
 * Batches stock lookups per issuer to avoid redundant API calls.
 */
export async function scoreAndRank(
  trades: InsiderTrade[],
  options: { enrichWithStockData?: boolean } = {}
): Promise<TradeScore[]> {
  // Group trades by issuer for cluster detection
  const byIssuer = new Map<string, InsiderTrade[]>();
  for (const t of trades) {
    const existing = byIssuer.get(t.issuer) || [];
    existing.push(t);
    byIssuer.set(t.issuer, existing);
  }

  const scored = await Promise.all(
    trades.map((t) =>
      scoreTrade(t, byIssuer.get(t.issuer) || [], options)
    )
  );

  return scored.sort((a, b) => b.totalScore - a.totalScore);
}
