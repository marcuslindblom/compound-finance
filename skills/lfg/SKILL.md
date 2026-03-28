---
name: lfg
description: "Let's Fucking Go — fully autonomous daily trading pipeline. Scans insider trades, formulates theses, reviews them, executes simulation trades, checks existing positions, and compounds learnings. Designed to run unattended on a schedule."
---

# LFG — Autonomous Daily Pipeline

Run the full compound finance pipeline end-to-end. Zero human input required.

## Instructions

Execute these steps in order. Log everything. If any step fails, continue with the next — don't abort the pipeline.

### Step 1: Scan (Researcher)

1. Use `scan_notable_trades` with default date range (last 7 days)
2. Filter to trades with score >= 6
3. For each notable trade, check if research already exists in `knowledge/research/`
4. If new: write a research document using the template at `templates/research.md`
5. Summary: "Found X trades, Y new signals"

### Step 2: Thesis (Analyst)

1. For each new research document with score >= 7:
   - Check `knowledge/patterns/` for similar historical patterns
   - Formulate a thesis using the template at `templates/thesis.md`
   - Set conviction based on score + pattern match
2. Skip if score 6 — not enough conviction for autonomous trading
3. Summary: "Created X new theses"

### Step 3: Review (Reviewer)

1. For each new thesis:
   - Run the reviewer's red flag checklist
   - Check `knowledge/archive/` for similar failed trades
   - Run cognitive bias check
   - Append `## Review` section to the thesis document
   - Set verdict: PROCEED / CAUTION / REJECT
2. Summary: "X proceed, Y caution, Z rejected"

### Step 4: Execute (Decide)

1. For each thesis with verdict PROCEED or CAUTION:
   - Read portfolio via `get_portfolio`
   - PROCEED: use thesis position size (max 10%)
   - CAUTION: halve the position size (max 5%)
   - Check sector exposure (max 30% per sector)
   - Execute via `execute_sim_trade` with stop-loss and target from thesis
   - Write decision document using the template at `templates/decision.md`
2. Summary: "Executed X sim trades, invested Y SEK"

### Step 5: Position Check

1. Read current portfolio via `get_portfolio`
2. For each open position:
   - Get current price via `get_stock_quote`
   - **Stop-loss hit?** → sell, move to archive, log loss
   - **Target hit?** → sell, move to archive, log win
   - **Time horizon expired?** → review thesis, consider closing
   - **New insider activity?** → note in thesis
3. Summary: "X positions checked, Y closed (W wins, L losses)"

### Step 6: Portfolio Update

1. Update `knowledge/portfolio/sim-portfolio.json` with current prices
2. Calculate total portfolio value
3. Update stats: return %, win rate, avg return

### Step 7: Report

Generate a concise daily report:

```
📊 Compound Finance — YYYY-MM-DD

Portfölj: X SEK (±Y.Z% sedan start)
Cash: X SEK | Positioner: N st

Nya signaler: X (score >= 6)
Nya theses: X
Köpta: X | Sålda: X | Skippade: X

Bästa signal: {company} — {person} ({role}), score X/10
Portfölj idag: ±X.Z% | OMXS30: ±X.Z%
```

### Step 8: Compound (if Friday)

If today is Friday (or `$ARGUMENTS` contains "compound"):
1. Run weekly review
2. Compare week's trades vs thesis predictions
3. Extract any new patterns → `knowledge/patterns/`
4. Save review to `knowledge/reviews/YYYY-WXX-weekly.md`
5. Check score accuracy: do high-score trades outperform?

## Scheduling

This skill is designed to run as a Claude Code scheduled task:
- Daily at 07:30 CET (after market data is refreshed)
- Friday run includes the compound step automatically

## Safety

- ALL trades execute in simulation mode only
- No `--live` flag support in LFG — autonomous = sim only
- Human must explicitly use `/cf:decide --live` for real trades
