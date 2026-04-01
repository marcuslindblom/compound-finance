---
date: 2026-04-01
type: daily-scan
period: 2026-03-25 to 2026-04-01
signals_found: 5
signals_above_threshold: 0
threshold: 6
---

# Daily Insider Scan — 2026-04-01

## Summary

Scanned FI insynsregistret for notable insider trades (2026-03-25 to 2026-04-01).
**0 trades cleared minScore 6.** The highest-scoring trade was C-RAD AB at score 5 (VD köpoption).

5 trades total in the register for the period. Activity was concentrated on 2026-03-31 with one cluster of Fasadgruppen subscription transactions (Teckning, BTA) — these are rights-issue subscriptions, not open-market buys, and score lower accordingly.

Market context: OMXS30 at 2 929.33, down -7.55% over 30 days — continued broad market drawdown.

Sources:
- `scan_notable_trades` (fromDate: 2026-03-25, toDate: 2026-04-01, minScore: 0)
- `search_insider_trades` (full register, cross-reference)
- `get_stock_quote`, `get_stock_price_history`, `estimate_market_cap` per issuer
- `get_benchmark` (OMXS30, 1mo)

---

## Benchmark

| Index  | Value     | 30d Change |
|--------|-----------|------------|
| OMXS30 | 2 929.33  | -7.55%     |

Recent OMXS30 closes:
- 2026-03-25: 2 943.35
- 2026-03-26: 2 889.81
- 2026-03-27: 2 863.92
- 2026-03-30: 2 890.29
- 2026-03-31: 2 929.33

---

## All Trades Scanned

### 1. C-RAD AB — Score 5/10

- **Issuer:** C-RAD AB
- **Person:** C-Rad AB (company entity)
- **Role:** Verkställande direktör (VD)
- **Transaction type:** Förvärv
- **Instrument:** C-RAD AB ser. B — Köpoption (call option)
- **ISIN:** SE0002016352
- **Transaction date:** 2026-03-31
- **Publication date:** 2026-03-31
- **Volume:** 330 000 options @ 3.93 SEK
- **Total value:** 1 296 900 SEK
- **Close associate:** No
- **Score breakdown:** roleWeight 3 + sizeSignal 1 + companySizeBonus 1

**Stock data (CRAD-B.ST):**
- Current price: 25.85 SEK
- 30d change: -0.96%
- 90d change: -18.97%
- 52-week range: 25.00–37.40 SEK
- Market cap (estimated): ~164 MSEK (micro cap, medium confidence ±50%)

**Note:** Instrument is a köpoption (call option), not a direct equity purchase. The buyer is listed as the company entity itself. Price of 3.93 SEK is option premium, not underlying share price. Stock is trading near its 52-week low (25.00), down ~19% over 90 days.

---

### 2. Precomp Solutions Aktiebolag (publ) — Score 4/10

- **Issuer:** Precomp Solutions Aktiebolag (publ)
- **Person:** Tomas Bergdahl
- **Role:** Styrelseledamot
- **Transaction type:** Förvärv
- **Instrument:** PCOM B — Aktie
- **ISIN:** SE0006091724
- **Transaction date:** 2026-03-27
- **Publication date:** 2026-03-31
- **Volume:** 3 211 137 aktier @ 0.88 SEK
- **Total value:** 2 825 801 SEK
- **Close associate:** Yes
- **Score breakdown:** roleWeight 1.5 + sizeSignal 1.5 + companySizeBonus 1

**Stock data (PCOM-B.ST):**
- Current price: 0.895 SEK
- 30d change: +2.87%
- 90d change: -10.50%
- 52-week range: 0.70–1.60 SEK
- Market cap (estimated): ~23 MSEK (micro cap, medium confidence ±50%)

**Note:** Large volume in absolute share count (3.2M shares) but this is a penny stock. Trade was via close associate. Board member role carries lower operational insight weight. Stock in lower half of 52-week range.

---

### 3. Fasadgruppen Group AB (publ) — Score 3/10 (Mikael Karlsson)

- **Issuer:** Fasadgruppen Group AB (publ)
- **Person:** Mikael Karlsson
- **Role:** Styrelseordförande
- **Transaction type:** Teckning (rights issue subscription)
- **Instrument:** Fasadgruppen Group AB — BTA (betald tecknad aktie)
- **ISIN:** SE0015195771
- **Transaction date:** 2026-03-31
- **Publication date:** 2026-03-31
- **Volume:** 2 187 225 aktier @ 15.00 SEK
- **Total value:** 32 808 375 SEK
- **Close associate:** Yes
- **Score breakdown:** roleWeight 2 + sizeSignal 2 + companySizeBonus 1

**Stock data (Fasadgruppen):**
- Yahoo Finance ticker not resolvable (404 on FGRU.ST, FASAD.ST, FASADGR.ST, FGRU-B.ST)
- No price history or market cap data available

**Note:** Transaction type is Teckning (subscription in a rights issue), not an open-market purchase. Scored as weak signal. Close associate. Large absolute SEK value (32.8 MSEK) reflects rights issue participation, not discretionary buying conviction.

---

### 4. Fasadgruppen Group AB (publ) — Score 3/10 (Casper Tamm)

- **Issuer:** Fasadgruppen Group AB (publ)
- **Person:** Casper Tamm
- **Role:** Ekonomichef/finanschef/finansdirektör (CFO)
- **Transaction type:** Teckning (rights issue subscription)
- **Instrument:** Fasadgruppen Group AB (publ) — BTA (betald tecknad aktie)
- **ISIN:** SE0015195771
- **Transaction date:** 2026-03-31
- **Publication date:** 2026-03-31
- **Volume:** 31 250 aktier @ 15.00 SEK
- **Total value:** 468 750 SEK
- **Close associate:** No
- **Score breakdown:** roleWeight 2.5 + sizeSignal 0.5 + companySizeBonus 1

**Note:** Same rights issue as Mikael Karlsson above. CFO role carries higher operational insight weight (2.5 vs 2.0 for chairman). Smaller value. Teckning context limits signal strength — see note above.

---

### 5. Isofol Medical AB (publ) — Score 3/10

- **Issuer:** Isofol Medical AB (publ)
- **Person:** Petter Segelman Lindqvist
- **Role:** Verkställande direktör (VD)
- **Transaction type:** Teckning (subscription)
- **Instrument:** Isofol Medical AB — Aktie
- **ISIN:** SE0009581051
- **Transaction date:** 2026-03-30
- **Publication date:** 2026-03-31
- **Volume:** 209 648 aktier @ 0.48 SEK
- **Total value:** 100 631 SEK
- **Close associate:** No
- **Score breakdown:** roleWeight 3 + sizeSignal 0.5 + contraTrend 1 + companySizeBonus 1 (penalized for Teckning)

**Stock data (ISOFOL.ST):**
- Current price: 0.65 SEK
- 30d change: -9.72%
- 90d change: -12.87%
- 52-week range: 0.5515–2.44 SEK
- Market cap (estimated): ~175 MSEK (micro cap, medium confidence ±50%)

**Note:** Transaction type is Teckning (subscription). VD role and mild contra-trend (buying into a declining stock) add minor weight. Subscription price of 0.48 SEK is below current market price of 0.65 SEK. Very small absolute value (100k SEK). Stock near 52-week low.

---

## Trades Not in scan_notable_trades (from full register — same period)

The full register via `search_insider_trades` revealed additional trades not captured in the scan:

| Issuer | Person | Role | Type | Volume | Value SEK | Note |
|---|---|---|---|---|---|---|
| Fasadgruppen Group AB | Johan Fägerlind | Annan ledande befattningshavare | Teckning (Aktie) | 5 885 @ 15.00 | 88 275 | Same rights issue; small value |
| NCC AKTIEBOLAG | Harald Stjernström | Arbetstagarrepresentant i styrelsen | Förvärv | 30 @ 193.90 | 5 817 | Employee rep; negligible value |
| Xer Tech Holding AB | Thomas Lundin | Styrelseledamot | Förvärv (Renewable Ventures Nordic) | 4 164 @ 2.81 | 11 701 | Cross-company instrument; very small |
| Cantargia AB | Antonius Franciscus Berkien | Annan admin/ledning/kontroll | Förvärv | 19 276 @ 4.08 | 78 647 | Close associate; value < 100k SEK |
| Siljansvik | Bengt Torkel Östling | VD | Förvärv | 100 @ 115.00 | 11 500 | Negligible value |

All excluded: below 100 000 SEK value threshold, close associate status, or negligible signal weight.

---

## Data Sources

| Tool | Parameters |
|---|---|
| `scan_notable_trades` | fromDate: 2026-03-25, toDate: 2026-04-01, minScore: 0 |
| `search_insider_trades` | query: "C-RAD", "Precomp Solutions", "Fasadgruppen" |
| `get_stock_quote` | CRAD-B.ST, PCOM-B.ST, ISOFOL.ST |
| `get_stock_price_history` | CRAD-B.ST (3mo), PCOM-B.ST (3mo), ISOFOL.ST (3mo) |
| `estimate_market_cap` | CRAD-B.ST, PCOM-B.ST, ISOFOL.ST |
| `get_benchmark` | OMXS30, 1mo |
| FI insynsregistret | marknadssok.fi.se (via API) |
