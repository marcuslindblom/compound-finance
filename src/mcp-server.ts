#!/usr/bin/env node

/**
 * MCP Server for insider trading signals.
 *
 * Exposes tools that Claude Code can call:
 * - search_insider_trades: Query FI's insynsregister
 * - score_insider_trade: Score a specific trade
 * - scan_notable_trades: Get top-scored trades for a period
 * - manage_watchlist: Add/remove/list watched companies
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchInsiderTrades, getNotableBuys } from "./fi-scraper.js";
import { scoreTrade, scoreAndRank } from "./scoring.js";
import { searchTicker, getQuote, getPriceHistory } from "./yahoo-finance.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import type { Watchlist, WatchlistEntry } from "./types.js";

const WATCHLIST_DIR = join(homedir(), ".compound-finance");
const WATCHLIST_PATH = join(WATCHLIST_DIR, "watchlist.json");

// Portfolio path — relative to where the plugin is run from
const PORTFOLIO_PATH = join(
  process.cwd(),
  "knowledge/portfolio/sim-portfolio.json"
);

// --- Watchlist helpers ---

function loadWatchlist(): Watchlist {
  try {
    if (existsSync(WATCHLIST_PATH)) {
      return JSON.parse(readFileSync(WATCHLIST_PATH, "utf-8"));
    }
  } catch {
    // Corrupted file, start fresh
  }
  return { companies: [] };
}

function saveWatchlist(wl: Watchlist): void {
  mkdirSync(WATCHLIST_DIR, { recursive: true });
  writeFileSync(WATCHLIST_PATH, JSON.stringify(wl, null, 2));
}

// --- MCP Server ---

const server = new McpServer({
  name: "insider-trading",
  version: "0.1.0",
});

server.tool(
  "search_insider_trades",
  "Search the Swedish Financial Supervisory Authority (Finansinspektionen) insider trading register. Returns all reported insider transactions matching the criteria.",
  {
    issuer: z
      .string()
      .optional()
      .describe("Company name to filter by (e.g., 'Volvo', 'Hexatronic')"),
    person: z
      .string()
      .optional()
      .describe("Insider person name to filter by"),
    fromDate: z
      .string()
      .optional()
      .describe("Start date in YYYY-MM-DD format (default: 7 days ago)"),
    toDate: z
      .string()
      .optional()
      .describe("End date in YYYY-MM-DD format (default: today)"),
    transactionType: z
      .enum(["Förvärv", "Avyttring"])
      .optional()
      .describe("Filter by transaction type: Förvärv (buy) or Avyttring (sell)"),
  },
  async (params) => {
    try {
      const trades = await searchInsiderTrades(params);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                totalTrades: trades.length,
                trades: trades.slice(0, 50), // Limit response size
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error searching insider trades: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "scan_notable_trades",
  "Scan for notable insider buys, scored and ranked by signal strength. Returns trades sorted by score (highest first). Best for daily scanning.",
  {
    fromDate: z
      .string()
      .optional()
      .describe("Start date in YYYY-MM-DD format (default: 7 days ago)"),
    toDate: z
      .string()
      .optional()
      .describe("End date in YYYY-MM-DD format (default: today)"),
    minScore: z
      .number()
      .optional()
      .describe("Minimum score to include (0-10, default: 5)"),
    minValueSEK: z
      .number()
      .optional()
      .describe(
        "Minimum trade value in SEK to include (default: 100000)"
      ),
  },
  async (params) => {
    try {
      const trades = await getNotableBuys({
        fromDate: params.fromDate,
        toDate: params.toDate,
        minValueSEK: params.minValueSEK,
      });

      const scored = scoreAndRank(trades);
      const minScore = params.minScore ?? 5;
      const notable = scored.filter((s) => s.totalScore >= minScore);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                totalScanned: trades.length,
                notableCount: notable.length,
                trades: notable.map((s) => ({
                  issuer: s.trade.issuer,
                  person: s.trade.person,
                  role: s.trade.role,
                  type: s.trade.transactionType,
                  date: s.trade.transactionDate,
                  volume: s.trade.volume,
                  price: s.trade.price,
                  currency: s.trade.currency,
                  totalValue: Math.round(s.trade.volume * s.trade.price),
                  score: s.totalScore,
                  scoreBreakdown: s.breakdown,
                  reasoning: s.reasoning,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error scanning trades: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "manage_watchlist",
  "Manage your insider trading watchlist. Add, remove, or list companies you want to monitor for insider activity.",
  {
    action: z
      .enum(["list", "add", "remove", "check"])
      .describe(
        "Action: list (show watchlist), add (add company), remove (remove company), check (scan watchlist companies)"
      ),
    company: z
      .string()
      .optional()
      .describe("Company name (required for add/remove)"),
    reason: z
      .string()
      .optional()
      .describe("Reason for adding to watchlist (optional, for add)"),
  },
  async (params) => {
    try {
      const wl = loadWatchlist();

      switch (params.action) {
        case "list": {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    count: wl.companies.length,
                    companies: wl.companies,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "add": {
          if (!params.company) {
            return {
              content: [
                { type: "text" as const, text: "Company name is required for add action" },
              ],
              isError: true,
            };
          }
          const entry: WatchlistEntry = {
            name: params.company,
            addedAt: new Date().toISOString().split("T")[0],
            reason: params.reason,
          };
          wl.companies.push(entry);
          saveWatchlist(wl);
          return {
            content: [
              {
                type: "text" as const,
                text: `Added "${params.company}" to watchlist. Total: ${wl.companies.length} companies.`,
              },
            ],
          };
        }

        case "remove": {
          if (!params.company) {
            return {
              content: [
                { type: "text" as const, text: "Company name is required for remove action" },
              ],
              isError: true,
            };
          }
          const before = wl.companies.length;
          wl.companies = wl.companies.filter(
            (c) => c.name.toLowerCase() !== params.company!.toLowerCase()
          );
          saveWatchlist(wl);
          return {
            content: [
              {
                type: "text" as const,
                text:
                  before === wl.companies.length
                    ? `"${params.company}" not found in watchlist.`
                    : `Removed "${params.company}" from watchlist. Remaining: ${wl.companies.length}.`,
              },
            ],
          };
        }

        case "check": {
          if (wl.companies.length === 0) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: "Watchlist is empty. Add companies first with action='add'.",
                },
              ],
            };
          }

          const results = [];
          for (const company of wl.companies) {
            const trades = await searchInsiderTrades({
              issuer: company.name,
              fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            });
            const scored = scoreAndRank(trades);
            results.push({
              company: company.name,
              tradesLast30Days: trades.length,
              topScore: scored.length > 0 ? scored[0].totalScore : null,
              topTrade: scored.length > 0
                ? {
                    person: scored[0].trade.person,
                    role: scored[0].trade.role,
                    type: scored[0].trade.transactionType,
                    date: scored[0].trade.transactionDate,
                    value: Math.round(
                      scored[0].trade.volume * scored[0].trade.price
                    ),
                    reasoning: scored[0].reasoning,
                  }
                : null,
            });
          }

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ watchlistCheck: results }, null, 2),
              },
            ],
          };
        }
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error managing watchlist: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "search_stock",
  "Search for a Swedish stock ticker by company name. Returns matching tickers on the Stockholm exchange.",
  {
    query: z.string().describe("Company name to search for (e.g., 'Hexatronic', 'Volvo')"),
  },
  async (params) => {
    try {
      const results = await searchTicker(params.query);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ results: results.slice(0, 10) }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error searching stocks: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_stock_quote",
  "Get current quote data for a Swedish stock including price, market cap, P/E, and 52-week range.",
  {
    symbol: z
      .string()
      .describe(
        "Yahoo Finance ticker symbol (e.g., 'HTRO.ST' for Hexatronic, 'VOLV-B.ST' for Volvo B)"
      ),
  },
  async (params) => {
    try {
      const quote = await getQuote(params.symbol);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(quote, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error getting quote: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_stock_price_history",
  "Get historical price data for a stock. Used for trend analysis and contra-trend detection.",
  {
    symbol: z.string().describe("Yahoo Finance ticker symbol (e.g., 'HTRO.ST')"),
    range: z
      .enum(["1mo", "3mo", "6mo", "1y"])
      .optional()
      .describe("Time range (default: 3mo)"),
  },
  async (params) => {
    try {
      const history = await getPriceHistory(
        params.symbol,
        params.range ?? "3mo"
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                symbol: history.symbol,
                dataPoints: history.prices.length,
                changePercent30d: Math.round(history.changePercent30d * 100) / 100,
                changePercent90d: Math.round(history.changePercent90d * 100) / 100,
                latestPrice: history.prices[history.prices.length - 1],
                // Only include last 10 prices to keep response compact
                recentPrices: history.prices.slice(-10),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error getting price history: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// --- Portfolio tools ---

interface SimPosition {
  symbol: string;
  shares: number;
  entryPrice: number;
  entryDate: string;
  thesis: string;
  stopLoss: number;
  target: number;
}

interface SimPortfolio {
  mode: string;
  startDate: string;
  startCapital: number;
  cash: number;
  positions: SimPosition[];
  closedTrades: Array<SimPosition & { exitPrice: number; exitDate: string; returnPercent: number }>;
  stats: {
    totalValue: number;
    returnPercent: number;
    totalTrades: number;
    winRate: number | null;
    avgReturn: number | null;
    maxDrawdown: number;
    sharpeRatio: number | null;
    benchmarkReturn: number;
  };
}

function loadPortfolio(): SimPortfolio {
  try {
    if (existsSync(PORTFOLIO_PATH)) {
      return JSON.parse(readFileSync(PORTFOLIO_PATH, "utf-8"));
    }
  } catch { /* fresh start */ }
  return {
    mode: "simulation",
    startDate: new Date().toISOString().split("T")[0],
    startCapital: 1000000,
    cash: 1000000,
    positions: [],
    closedTrades: [],
    stats: { totalValue: 1000000, returnPercent: 0, totalTrades: 0, winRate: null, avgReturn: null, maxDrawdown: 0, sharpeRatio: null, benchmarkReturn: 0 },
  };
}

function savePortfolio(p: SimPortfolio): void {
  writeFileSync(PORTFOLIO_PATH, JSON.stringify(p, null, 2));
}

server.tool(
  "get_portfolio",
  "Get the current simulation portfolio state including cash, positions, closed trades, and performance stats.",
  {},
  async () => {
    const portfolio = loadPortfolio();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(portfolio, null, 2) }],
    };
  }
);

server.tool(
  "execute_sim_trade",
  "Execute a simulated trade (buy or sell) in the paper trading portfolio. Updates portfolio state and stats.",
  {
    action: z.enum(["buy", "sell"]).describe("Trade action"),
    symbol: z.string().describe("Yahoo Finance ticker (e.g., PNDX-B.ST)"),
    shares: z.number().optional().describe("Number of shares (for buy: calculated from amount if not specified)"),
    amount: z.number().optional().describe("SEK amount to invest (for buy: used to calculate shares if shares not specified)"),
    price: z.number().optional().describe("Execution price (default: current market price)"),
    thesis: z.string().optional().describe("Wiki link to thesis document"),
    stopLoss: z.number().optional().describe("Stop-loss price"),
    target: z.number().optional().describe("Target price"),
  },
  async (params) => {
    try {
      const portfolio = loadPortfolio();
      
      // Get current price if not specified
      let price = params.price;
      if (!price) {
        const quote = await getQuote(params.symbol);
        price = quote.regularMarketPrice;
      }

      if (params.action === "buy") {
        let shares = params.shares;
        if (!shares && params.amount) {
          shares = Math.floor(params.amount / price);
        }
        if (!shares) {
          return { content: [{ type: "text" as const, text: "Specify either shares or amount for buy orders" }], isError: true };
        }

        const cost = shares * price;
        if (cost > portfolio.cash) {
          return { content: [{ type: "text" as const, text: `Insufficient cash. Need ${cost.toFixed(0)} SEK, have ${portfolio.cash.toFixed(0)} SEK` }], isError: true };
        }

        portfolio.cash -= cost;
        portfolio.positions.push({
          symbol: params.symbol,
          shares,
          entryPrice: price,
          entryDate: new Date().toISOString().split("T")[0],
          thesis: params.thesis || "",
          stopLoss: params.stopLoss || 0,
          target: params.target || 0,
        });
        portfolio.stats.totalTrades++;

        savePortfolio(portfolio);
        return {
          content: [{
            type: "text" as const,
            text: `✅ SIM BUY: ${shares} x ${params.symbol} @ ${price} SEK = ${cost.toFixed(0)} SEK\nCash remaining: ${portfolio.cash.toFixed(0)} SEK`,
          }],
        };

      } else {
        // Sell
        const posIdx = portfolio.positions.findIndex((p) => p.symbol === params.symbol);
        if (posIdx === -1) {
          return { content: [{ type: "text" as const, text: `No position found for ${params.symbol}` }], isError: true };
        }

        const pos = portfolio.positions[posIdx];
        const shares = params.shares || pos.shares;
        const proceeds = shares * price;
        const returnPct = ((price - pos.entryPrice) / pos.entryPrice) * 100;

        portfolio.cash += proceeds;

        if (shares >= pos.shares) {
          // Close entire position
          portfolio.positions.splice(posIdx, 1);
          portfolio.closedTrades.push({
            ...pos,
            exitPrice: price,
            exitDate: new Date().toISOString().split("T")[0],
            returnPercent: Math.round(returnPct * 100) / 100,
          });
        } else {
          // Partial sell
          portfolio.positions[posIdx].shares -= shares;
        }

        // Update stats
        if (portfolio.closedTrades.length > 0) {
          const wins = portfolio.closedTrades.filter((t) => t.returnPercent > 0).length;
          portfolio.stats.winRate = Math.round((wins / portfolio.closedTrades.length) * 100) / 100;
          portfolio.stats.avgReturn = Math.round(
            portfolio.closedTrades.reduce((sum, t) => sum + t.returnPercent, 0) / portfolio.closedTrades.length * 100
          ) / 100;
        }

        savePortfolio(portfolio);
        return {
          content: [{
            type: "text" as const,
            text: `✅ SIM SELL: ${shares} x ${params.symbol} @ ${price} SEK = ${proceeds.toFixed(0)} SEK\nReturn: ${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(1)}%\nCash: ${portfolio.cash.toFixed(0)} SEK`,
          }],
        };
      }
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error executing trade: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- Start server ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Insider Trading MCP server running on stdio");
}

main().catch(console.error);
