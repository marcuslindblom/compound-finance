---
type: research
date: 2026-04-07
source: FI Insynsregistret
scan_params: "minScore: 6, days: 7"
signals_found: 0
---

# Daily Insider Scan — 2026-04-07

## Summary

Scanned FI insynsregistret for notable insider trades (2026-03-31 to 2026-04-07).
**0 trades cleared minScore 6.** Quiet week with only 2 trades in the register.

Extended scan (14 days, minScore 1) found 2 low-scoring trades:

| # | Issuer | Person | Role | Type | Date | Volume | Price (SEK) | Value (SEK) | Score |
|---|--------|--------|------|------|------|--------|-------------|-------------|-------|
| 1 | Scandi Standard AB | Paulo Gaspar | Styrelseledamot | Förvärv | 2026-03-30 | 838 | 139.91 | 117 245 | 2.8 |
| 2 | Wästbygg Gruppen AB | Jakob Mörndal | Styrelseledamot | Teckning | 2026-04-01 | 528 000 | 1.55 | 818 400 | 2.5 |

Neither trade qualifies for thesis formulation (threshold: score >= 7).

**Scandi Standard:** Board member buy at 139.91 SEK. Moderate size (117k SEK). No cluster signal, no contra-trend bonus.

**Wästbygg Gruppen:** Board member subscription (Teckning) at 1.55 SEK — rights issue participation, not open-market conviction buy. Scores lower per protocol.

## Benchmark

| Index  | Value     | 30d Change |
|--------|-----------|------------|
| OMXS30 | 2 992.24  | -2.76%     |

Recent OMXS30 closes:
- 2026-03-30: 2 890.29
- 2026-03-31: 2 929.33
- 2026-04-01: 3 006.37
- 2026-04-02: 2 965.69
- 2026-04-07: 2 992.24

## Open Position Check

### LINC.ST — Linc AB

| Field | Value |
|-------|-------|
| Current price | 72.30 SEK |
| Entry price | 71.00 SEK |
| P&L | +1.83% (+274 SEK) |
| Stop-loss | 61.50 SEK — not triggered |
| Target | 79.00 SEK — not triggered |
| Time horizon | 3-6 months (entered 2026-03-31) |

LINC.ST +0.84% today vs OMXS30 -1.68% — continued relative outperformance.

## Actions Taken

- No new theses formulated
- No new trades executed
- LINC.ST position maintained (within parameters)

Sources:
- `scan_notable_trades` (minScore: 6, days: 7) — 0 results
- `scan_notable_trades` (minScore: 1, days: 14) — 2 results
- `get_stock_quote` (LINC.ST) — 72.30 SEK
- `get_benchmark` (OMXS30, 1mo) — 2 992.24
