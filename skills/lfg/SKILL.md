---
name: lfg
description: "Let's Fucking Go — fully autonomous daily trading pipeline. Delegates to researcher, analyst, and reviewer sub-agents for independent analysis. Designed to run unattended on a schedule."
---

# LFG — Autonomous Daily Pipeline

Run the full compound finance pipeline end-to-end. Delegates to specialized sub-agents for each phase.

## Instructions

### Step 1: Research (delegate to `researcher` agent)

Delegate to the **researcher** sub-agent with this task:
> Scan FI's insider trading register for notable trades from the last 7 days. Use `scan_notable_trades` with minScore 6. For each trade found, also fetch stock quote and price history. Report all findings structured with: issuer, person, role, transaction details, score, price trend, and market cap estimate.

Save the researcher's findings to `knowledge/research/YYYY-MM-DD-daily-scan.md` using the template.

### Step 2: Thesis (delegate to `analyst` agent)

For each research finding with score >= 7, delegate to the **analyst** sub-agent:
> Given this research data: [paste researcher findings]. Check knowledge/patterns/ for historical precedent. Formulate an investment thesis with entry price, target, stop-loss, time horizon, position size (max 10%), and conviction level. If no similar pattern exists, set conviction to LOW.

Save each thesis to `knowledge/theses/YYYY-MM-DD-{company}-{signal}.md` using the template.

### Step 3: Review (delegate to `reviewer` agent)

For each new thesis, delegate to the **reviewer** sub-agent:
> Review this investment thesis: [paste thesis]. Challenge the bull case. Find the strongest bear case. Check for cognitive biases. Check knowledge/archive/ for similar trades that failed. Give verdict: PROCEED, CAUTION, or REJECT.

Append the review to the thesis document under a `## Review` section.

### Step 4: Execute

For each thesis with verdict PROCEED or CAUTION (do NOT delegate — handle directly):
1. Read portfolio via `get_portfolio`
2. PROCEED: use thesis position size (max 10%)
3. CAUTION: halve the position size (max 5%)
4. Check sector exposure (max 30% per sector)
5. Execute via `execute_sim_trade`
6. Write decision document to `knowledge/decisions/`

### Step 5: Position Check

For each open position in the portfolio:
1. Get current price via `get_stock_quote`
2. **Stop-loss hit?** → sell via `execute_sim_trade`, archive
3. **Target hit?** → sell, archive
4. **Time horizon expired?** → review thesis, consider closing

### Step 6: Report

Generate a daily summary:
```
📊 Compound Finance — YYYY-MM-DD

Portfolio: X SEK (±Y.Z% since start)
Cash: X SEK | Positions: N

New signals: X (score >= 6)
New theses: X  
Bought: X | Sold: X | Skipped: X

Top signal: {company} — {person} ({role}), score X/10
Portfolio today: ±X.Z% | OMXS30: ±X.Z%
```

### Step 7: Compound (Fridays only)

If today is Friday or `$ARGUMENTS` contains "compound":
1. Review closed trades vs thesis predictions
2. Extract patterns → `knowledge/patterns/`
3. Save review to `knowledge/reviews/`
4. Check score accuracy

## Safety

- ALL trades execute in simulation mode — no exceptions
- Live trading requires manual `/cf:decide --live`
