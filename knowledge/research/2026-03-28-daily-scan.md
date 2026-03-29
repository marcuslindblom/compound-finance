---
date: 2026-03-28
type: daily-scan
source: FI insider register
---

# Daily Scan — 2026-03-28

## Summary
- Trades scanned: 2
- Notable (score >= 6): 0
- Top signal: N/A — no trades met the minScore 6 threshold
- Below-threshold trades documented: 2 (scores 5.5 and 5.0)
- OMXS30 context: 2863.92 (-10.65% over 30d) — broad market under pressure

> Note: Both trades found this week scored below the 6/10 threshold. They are documented here for completeness. Both exhibit contra-trend buying patterns against a falling market.

---

## Findings

### Pandox Aktiebolag (PNDX-B.ST)
- **Person**: Anneli Lindblom (Ekonomichef/finanschef/finansdirektör)
- **Transaction**: Förvärv — 650 shares @ 176.20 SEK = 114,530 SEK
- **Trade date**: 2026-03-27
- **Score**: 5.5/10
- **Score breakdown**:
  - Role weight: 2.5 (CFO-level — high operational insight)
  - Size signal: 0.5 (moderate trade value)
  - Cluster signal: 0 (no clustering with other insiders)
  - Contra-trend: 2.0 (buying while stock down >10%)
  - Company size bonus: 0.5 (mid cap)
- **Current price**: 173.40 SEK (as of 2026-03-27, -1.37% day)
- **Market cap**: ~9.4 BSEK (estimated, medium confidence, ±50%)
- **3mo trend**: down (-13.73%)
- **30d trend**: down (-13.04%)
- **52w range**: 145.20 — 205.00 SEK
- **P/E**: N/A (not reported)
- **Price at trade vs. current**: 176.20 SEK vs. 173.40 SEK (-1.59% since trade)
- **OMXS30 3mo**: -10.65% (stock underperforming index by ~3pp over 3mo)

---

### Pierce Group AB (PIERCE.ST)
- **Person**: Lottie Saks (Styrelseledamot)
- **Transaction**: Förvärv — 27,007 shares @ 8.55 SEK = 230,910 SEK
- **Trade date**: 2026-03-27
- **Score**: 5.0/10
- **Score breakdown**:
  - Role weight: 1.5 (board member — moderate insight)
  - Size signal: 0.5 (moderate trade value)
  - Cluster signal: 0 (no clustering with other insiders)
  - Contra-trend: 2.0 (buying while stock down >10%)
  - Company size bonus: 1.0 (small/micro cap — insider signals stronger in this segment)
- **Current price**: 8.52 SEK (as of 2026-03-27, -0.93% day)
- **Market cap**: ~796 MSEK (estimated, medium confidence, ±50%)
- **3mo trend**: down (-41.24%)
- **30d trend**: down (-12.35%)
- **52w range**: 7.74 — 15.00 SEK
- **P/E**: N/A (not reported)
- **Price at trade vs. current**: 8.55 SEK vs. 8.52 SEK (-0.35% since trade)
- **OMXS30 3mo**: -10.65% (stock heavily underperforming index by ~31pp over 3mo)

---

## Benchmark Context

| Metric | Value |
|--------|-------|
| Index | OMXS30 |
| Current level | 2,863.92 |
| Day change | +0.01% |
| 30d change | -10.65% |
| Data points (3mo) | 62 |

---

## Data Sources
- FI Insynsregister (via `scan_notable_trades`, period 2026-03-21 to 2026-03-28)
- Yahoo Finance quotes: PNDX-B.ST, PIERCE.ST (via `get_stock_quote`)
- Yahoo Finance price history 3mo: PNDX-B.ST, PIERCE.ST (via `get_stock_price_history`)
- Market cap estimates: PNDX-B.ST, PIERCE.ST (via `estimate_market_cap`)
- Benchmark: OMXS30 3mo (via `get_benchmark`)
