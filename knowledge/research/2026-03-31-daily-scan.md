---
date: 2026-03-31
type: daily-scan
period: 2026-03-24 to 2026-03-31
signals_found: 7
signals_above_threshold: 2
threshold: 6
---

# Daily Insider Scan — 2026-03-31

## Summary

Scanned FI insynsregistret for notable insider trades (2026-03-24 to 2026-03-31).
**2 trades cleared minScore 6**, with 1 at score 8 (Linc AB — VD köp).

Market context: OMXS30 at 2 890.29, down -10.32% over 30 days — continued drawdown.

Note: `scan_notable_trades` returned network error; trades sourced via `search_insider_trades` and scored manually.

## Signals Above Threshold

### Linc AB (LINC.ST) — Score 8/10

- **Person:** Karl Tobieson (VD)
- **Type:** Förvärv (köp)
- **Date:** 2026-03-27 (published 2026-03-30)
- **Volume:** 5 000 aktier @ 70.30 SEK = 351 500 SEK
- **ISIN:** SE0015949433
- **Current price:** 68.70 SEK
- **30d change:** +1.93% (vs OMXS30 -10.32% — outperforming by ~12pp)
- **52-week range:** 58.90–83.60 SEK
- **Market cap:** ~950 MSEK (micro cap, medium confidence ±50%)
- **Signal:** CEO buying open market during broad market selloff. Stock outperforming index significantly. Bought slightly above market (70.30 vs 68.70 close).

### Freja eID Group AB (FREJAE.ST) — Score 6/10

- **Person:** Morgan Sellén (Styrelseledamot)
- **Type:** Förvärv (köp) — two separate transactions
- **Dates:** 2026-03-25 (408 aktier) and 2026-03-26 (4 900 aktier)
- **Volume:** 5 308 aktier @ 15.00 SEK = 79 620 SEK
- **ISIN:** SE0015950308
- **Current price:** 14.95 SEK
- **30d change:** -6.85% (roughly in line with OMXS30)
- **52-week range:** 8.00–19.85 SEK
- **Market cap:** ~163 MSEK (micro cap, medium confidence ±50%)
- **Signal:** Board member accumulating over two days. Lower absolute value. Two-tranche pattern adds modest weight.

## Below Threshold / Excluded

| Issuer | Person | Role | Volume | Value SEK | Reason |
|---|---|---|---|---|---|
| Nodebis Applications AB | Lars Save | Styrelseordförande | 2 000 | ~50 420 | No price data; value < 100k |
| Wall to Wall Group AB | André Strömgren | VD | 945 | 30 136 | No price data; value < 100k |
| Creturner Group AB | Daniel Moström | VD (close associate) | 7 729 542 | 309 182 | Close associate; penny stock (0.04 SEK) |
| Navigo Invest AB | Jool Invest AB | VD | 2 062 502 | 0 | Zero price — gift/transfer |
| Diadrom Holding AB | Viktor Eliasson | VD | 256 821 | — | Internal transaction, not open market |
