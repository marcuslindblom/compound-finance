---
name: cf:compound
description: Extract learnings from closed trades and portfolio performance. Updates patterns, refines scoring weights, and generates insights. Use weekly or after closing a position.
argument-hint: "[position to review, or empty for weekly]"
---

# Compound

The most important skill. This is where knowledge compounds.

## Instructions

1. If `$ARGUMENTS` contains a position → review that specific closed trade
2. If `$ARGUMENTS` is empty or "weekly" → run weekly portfolio review
3. Read closed trades from `knowledge/archive/` and `knowledge/portfolio/sim-portfolio.json`

### For a closed trade:

1. Compare outcome vs thesis prediction
2. What was the signal? Did the scoring correctly predict the outcome?
3. Were there red flags the reviewer missed?
4. Extract pattern → save to `knowledge/patterns/`
5. Update the thesis status to `closed` with outcome data

### For weekly review:

1. Portfolio performance vs OMXS30
2. Open positions: still on track? Any stop-losses approaching?
3. Score accuracy this week: high-score trades vs low-score trades
4. New patterns observed
5. Save review to `knowledge/reviews/YYYY-WXX-weekly.md`

## Pattern format

```markdown
argument-hint: "[position to review, or empty for weekly]"
---
date: 2026-04-15
type: pattern
confidence: high  # low | medium | high
sample_size: 5
win_rate: 0.80
avg_return: 12.3
tags: [contra-trend, cfo-buy, small-cap]
argument-hint: "[position to review, or empty for weekly]"
---

# Contra-trend CFO Buy in Small Caps

## Pattern
When a CFO buys >500k SEK while the stock is down >10% in 30 days,
and the company is a small cap (<5B SEK market cap):

## Expected outcome
+10-15% in 60-90 days (4 of 5 instances)

## Exceptions
Doesn't work when: sector in structural decline, company burning cash

## Evidence
- [[archive/2026-03-pandox-cfo]] → +12% in 72 days ✅
- [[archive/2025-11-balder-cfo]] → +8% in 55 days ✅
- [[archive/2025-09-xyz-cfo]] → -4% (sector headwind) ❌
```

## Scoring feedback loop

After 10+ closed trades, analyze:
- Average return by score bucket (5-6, 7-8, 9-10)
- If score 5-6 trades outperform 9-10, the weights need adjustment
- Propose specific weight changes to the scoring engine
