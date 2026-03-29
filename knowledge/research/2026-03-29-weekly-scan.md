---
date: 2026-03-29
type: weekly-scan
period: 2026-03-22 to 2026-03-29
source: FI insynsregister
minScore: 6 (scan), 0 (fallback — no trades cleared threshold)
---

# Weekly Insider Scan — 2026-03-29

## Scan Parameters
- Period: 2026-03-22 to 2026-03-29
- Source: FI insynsregister via scan_notable_trades
- minScore requested: 6
- minValueSEK: 100 000

## Summary
- Total trades in register (period): 3
- Trades clearing minScore 6: 0
- Trades reported below (full register, scores 3.5–5.5): 3

Note: No trade reached the minScore 6 threshold this week. All three trades are documented as reference data. The highest-scoring trade (Pandox, 5.5) narrowly missed the threshold and carries a contra-trend signal worth monitoring.

---

## Trade 1 — Pandox AB

### Transaction
| Field | Value |
|---|---|
| Issuer | Pandox Aktiebolag |
| Ticker | PNDX-B.ST |
| Person | Anneli Lindblom |
| Role | Ekonomichef / finanschef / finansdirektör (CFO) |
| Transaction type | Förvärv (purchase) |
| Date | 2026-03-27 |
| Volume | 650 shares |
| Price | 176.20 SEK |
| Total value | 114 530 SEK |
| Score | 5.5 / 10 |

### Score Breakdown
| Signal | Points |
|---|---|
| Role weight (CFO — high operational insight) | 2.5 |
| Size signal (moderate trade) | 0.5 |
| Cluster signal (no cluster) | 0 |
| Contra-trend (buying while stock down >10%) | 2.0 |
| Company size bonus (mid cap) | 0.5 |

### Stock Data (source: Yahoo Finance via get_stock_quote, get_stock_price_history)
| Field | Value |
|---|---|
| Market price (2026-03-27) | 173.40 SEK |
| Trade price vs market | +1.6% premium |
| 52-week high | 205.00 SEK |
| 52-week low | 145.20 SEK |
| Price vs 52w high | -15.4% |
| Price vs 52w low | +19.4% |
| Change 30d | -13.04% |
| Change 90d | -13.73% |
| Day change (2026-03-27) | -1.37% (-2.40 SEK) |

### Recent Price Trend (last 10 trading days)
| Date | Close (SEK) |
|---|---|
| 2026-03-16 | 187.40 |
| 2026-03-17 | 189.20 |
| 2026-03-18 | 188.60 |
| 2026-03-19 | 184.60 |
| 2026-03-20 | 180.00 |
| 2026-03-23 | 177.20 |
| 2026-03-24 | 177.00 |
| 2026-03-25 | 177.80 |
| 2026-03-26 | 175.80 |
| 2026-03-27 | 173.40 |

### Market Cap Estimate (source: estimate_market_cap)
| Field | Value |
|---|---|
| Estimated market cap | 9.42 GSEK (9 421 190 819 SEK) |
| Category | Mid cap |
| Confidence | Medium (±50%) |
| Method | Estimated from avg daily volume |

---

## Trade 2 — Pierce Group AB

### Transaction
| Field | Value |
|---|---|
| Issuer | Pierce Group AB (publ) |
| Ticker | PIERCE.ST |
| Person | Lottie Saks |
| Role | Styrelseledamot (board member) |
| Transaction type | Förvärv (purchase) |
| Date | 2026-03-27 |
| Volume | 27 007 shares |
| Price | 8.55 SEK |
| Total value | 230 910 SEK |
| Score | 5.0 / 10 |

### Score Breakdown
| Signal | Points |
|---|---|
| Role weight (board member — moderate insight) | 1.5 |
| Size signal (moderate trade) | 0.5 |
| Cluster signal (no cluster) | 0 |
| Contra-trend (buying while stock down >10%) | 2.0 |
| Company size bonus (small/micro cap) | 1.0 |

### Stock Data (source: Yahoo Finance via get_stock_quote, get_stock_price_history)
| Field | Value |
|---|---|
| Market price (2026-03-27) | 8.52 SEK |
| Trade price vs market | +0.4% premium |
| 52-week high | 15.00 SEK |
| 52-week low | 7.74 SEK |
| Price vs 52w high | -43.2% |
| Price vs 52w low | +10.1% |
| Change 30d | -12.35% |
| Change 90d | -41.24% |
| Day change (2026-03-27) | -0.93% (-0.08 SEK) |

### Recent Price Trend (last 10 trading days)
| Date | Close (SEK) |
|---|---|
| 2026-03-16 | 8.92 |
| 2026-03-17 | 8.84 |
| 2026-03-18 | 8.70 |
| 2026-03-19 | 8.32 |
| 2026-03-20 | 8.34 |
| 2026-03-23 | 8.38 |
| 2026-03-24 | 8.20 |
| 2026-03-25 | 8.76 |
| 2026-03-26 | 8.60 |
| 2026-03-27 | 8.52 |

### Market Cap Estimate (source: estimate_market_cap)
| Field | Value |
|---|---|
| Estimated market cap | 0.80 GSEK (796 317 202 SEK) |
| Category | Micro cap |
| Confidence | Medium (±50%) |
| Method | Estimated from avg daily volume |

---

## Trade 3 — Hamlet BioPharma AB

### Transaction
| Field | Value |
|---|---|
| Issuer | Hamlet BioPharma AB |
| Ticker | Not resolved (Yahoo Finance 404 — ticker unknown) |
| Person | Marianne Catharina Svanborg |
| Role | Styrelseordförande (chairman of the board) |
| Transaction type | Förvärv (purchase) |
| Date | 2026-03-26 |
| Volume | 25 000 shares |
| Price | 6.98 SEK |
| Total value | 174 500 SEK |
| Score | 3.5 / 10 |

### Score Breakdown
| Signal | Points |
|---|---|
| Role weight (chairman — moderate insight) | 2.0 |
| Size signal (moderate trade) | 0.5 |
| Cluster signal (no cluster) | 0 |
| Contra-trend (none detected) | 0 |
| Company size bonus (small/micro cap) | 1.0 |

### Stock Data
- Quote: not available (Yahoo Finance ticker not resolved)
- Price history: not available
- Market cap estimate: not available

---

## Data Sources
- FI insynsregister: scan_notable_trades (2026-03-22 to 2026-03-29)
- Stock quotes: get_stock_quote (Yahoo Finance)
- Price history: get_stock_price_history (Yahoo Finance, 3mo range)
- Market cap estimates: estimate_market_cap (volume-based estimate)
- Benchmark: not fetched (no trades cleared threshold for thesis pipeline)

## Related
- [[2026-03-28-daily-scan]]
