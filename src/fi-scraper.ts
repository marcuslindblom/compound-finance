/**
 * Scraper for Finansinspektionen's insider trading register (insynsregistret).
 *
 * FI's register at marknadssok.fi.se returns server-rendered HTML tables.
 * No JS rendering needed — plain HTTP GET with HTML parsing via cheerio.
 *
 * Decision: NOT using Cloudflare Browser Rendering for FI because:
 * 1. FI returns server-rendered HTML — no JS needed
 * 2. Plain fetch is faster and free (no CF billing)
 * 3. FI rate-limits aggressively — CF wouldn't help with that
 *
 * CF Browser Rendering reserved for future use cases that need JS rendering
 * (e.g., scraping news sites, Börsdata if we go that route).
 */

import * as cheerio from "cheerio";
import type { InsiderTrade } from "./types.js";

const FI_BASE_URL = "https://marknadssok.fi.se/Publiceringsklient";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function parseSwedishNumber(str: string): number {
  // FI uses non-breaking spaces (&#160;) as thousand separators and comma as decimal
  const cleaned = str
    .replace(/\u00a0/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
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

  const url = `${FI_BASE_URL}/sv-SE/Search/Search?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "InsiderTradeScanner/1.0 (research tool; contact: marcus@nimble.se)",
      Accept: "text/html",
      "Accept-Language": "sv-SE,sv;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(
      `FI request failed: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  return parseTradeTable(html);
}

function parseTradeTable(html: string): InsiderTrade[] {
  const $ = cheerio.load(html);
  const trades: InsiderTrade[] = [];

  // FI renders results as table rows — each row has ~15 td cells
  // Structure: publication date, issuer, person, role, close associate (Ja/Nej),
  //            transaction type, instrument, instrument type, ISIN,
  //            transaction date, volume, unit, price, currency, details link
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

    // Get details link if present
    const detailsLink = $(row).find("a").attr("href");
    if (detailsLink) {
      trade.detailsUrl = `${FI_BASE_URL}${detailsLink}`;
    }

    trades.push(trade);
  });

  return trades;
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

  const minValue = options.minValueSEK || 100000; // Default: 100k SEK minimum

  return trades
    .filter((t) => t.volume * t.price >= minValue)
    .sort((a, b) => b.volume * b.price - a.volume * a.price);
}
