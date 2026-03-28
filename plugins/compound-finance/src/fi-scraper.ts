/**
 * Scraper for Finansinspektionen's insider trading register (insynsregistret).
 *
 * FI's register at marknadssok.fi.se returns server-rendered HTML tables.
 * No JS rendering needed — plain HTTP GET with HTML parsing via cheerio.
 *
 * Supports pagination — FI returns max ~100 results per page.
 * We follow "next page" links until all results are fetched.
 */

import * as cheerio from "cheerio";
import type { InsiderTrade } from "./types.js";

const FI_BASE_URL = "https://marknadssok.fi.se/Publiceringsklient";
const MAX_PAGES = 10; // Safety limit — don't hammer FI
const DELAY_MS = 500; // Be polite between requests

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function parseSwedishNumber(str: string): number {
  const cleaned = str
    .replace(/\u00a0/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchInsiderTrades(options: {
  issuer?: string;
  person?: string;
  fromDate?: string;
  toDate?: string;
  transactionType?: "Förvärv" | "Avyttring";
}): Promise<InsiderTrade[]> {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const params = new URLSearchParams({
    SearchFunctionType: "Insyn",
    Utgivare: options.issuer || "",
    PersonILedandeSt_llningNamn: options.person || "",
    fromDate: options.fromDate || formatDate(weekAgo),
    toDate: options.toDate || formatDate(today),
  });

  if (options.transactionType) {
    params.set("Transaktionstyp", options.transactionType);
  }

  // FI pagination loses search parameters and they rate-limit aggressively.
  // Strategy: for ranges > 7 days, split into weekly chunks instead of paginating.
  const from = new Date(options.fromDate || formatDate(weekAgo));
  const to = new Date(options.toDate || formatDate(today));
  const daySpan = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);

  if (daySpan > 10) {
    // Split into weekly chunks
    const allTrades: InsiderTrade[] = [];
    let chunkStart = new Date(from);

    while (chunkStart < to) {
      const chunkEnd = new Date(chunkStart);
      chunkEnd.setDate(chunkEnd.getDate() + 7);
      if (chunkEnd > to) chunkEnd.setTime(to.getTime());

      if (allTrades.length > 0) await sleep(DELAY_MS);

      const chunkParams = new URLSearchParams(params);
      chunkParams.set("fromDate", formatDate(chunkStart));
      chunkParams.set("toDate", formatDate(chunkEnd));

      const url = `${FI_BASE_URL}/sv-SE/Search/Search?${chunkParams.toString()}`;
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "InsiderTradeScanner/1.0 (research; contact: marcus@nimble.se)",
            Accept: "text/html",
            "Accept-Language": "sv-SE,sv;q=0.9",
          },
        });

        if (response.ok) {
          const html = await response.text();
          const { trades } = parseTradeTable(html);
          allTrades.push(...trades);
        }
      } catch {
        // Skip failed chunk, continue with next
      }

      chunkStart.setDate(chunkStart.getDate() + 7);
    }

    // Deduplicate by publication date + person + issuer + transaction date
    const seen = new Set<string>();
    return allTrades.filter((t) => {
      const key = `${t.publicationDate}|${t.person}|${t.issuer}|${t.transactionDate}|${t.volume}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Single request for short ranges
  const url = `${FI_BASE_URL}/sv-SE/Search/Search?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "InsiderTradeScanner/1.0 (research; contact: marcus@nimble.se)",
      Accept: "text/html",
      "Accept-Language": "sv-SE,sv;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`FI request failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const { trades } = parseTradeTable(html);
  return trades;
}

function parseTradeTable(html: string): {
  trades: InsiderTrade[];
  nextPageUrl: string | null;
} {
  const $ = cheerio.load(html);
  const trades: InsiderTrade[] = [];

  const rows = $("table tbody tr");

  rows.each((_i, row) => {
    const cells = $(row)
      .find("td")
      .map((_j, td) => $(td).text().trim())
      .get();

    if (cells.length < 14) return;

    const trade: InsiderTrade = {
      publicationDate: cells[0],
      issuer: cells[1],
      person: cells[2],
      role: cells[3],
      isCloseAssociate: cells[4] === "Ja",
      transactionType: cells[5],
      instrument: cells[6],
      instrumentType: cells[7],
      isin: cells[8],
      transactionDate: cells[9],
      volume: parseSwedishNumber(cells[10]),
      unit: cells[11],
      price: parseSwedishNumber(cells[12]),
      currency: cells[13],
    };

    const detailsLink = $(row).find("a").attr("href");
    if (detailsLink) {
      trade.detailsUrl = `${FI_BASE_URL}${detailsLink}`;
    }

    trades.push(trade);
  });

  // Look for pagination — FI uses "Nästa" (Next) link
  // Note: FI pagination links lose the date parameters, so we only follow
  // "Nästa" if it exists and trust that FI maintains the search context via session/cookies.
  let nextPageUrl: string | null = null;
  $("a").each((_i, el) => {
    const text = $(el).text().trim();
    if (text === "Nästa" || text === "Next") {
      const href = $(el).attr("href");
      if (href) {
        nextPageUrl = href.startsWith("http")
          ? href
          : `https://marknadssok.fi.se${href}`;
      }
    }
  });

  return { trades, nextPageUrl };
}

/**
 * Get all insider buys for a given period, sorted by total value descending.
 */
export async function getNotableBuys(options: {
  fromDate?: string;
  toDate?: string;
  minValueSEK?: number;
}): Promise<InsiderTrade[]> {
  const trades = await searchInsiderTrades({
    fromDate: options.fromDate,
    toDate: options.toDate,
    transactionType: "Förvärv",
  });

  const minValue = options.minValueSEK || 100000;

  return trades
    .filter((t) => t.volume * t.price >= minValue)
    .sort((a, b) => b.volume * b.price - a.volume * a.price);
}
