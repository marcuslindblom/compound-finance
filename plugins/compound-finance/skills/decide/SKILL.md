---
name: cf:decide
description: Execute a trade decision (buy/sell/skip) in the simulation portfolio. Documents the decision with full context. Use after a thesis has been evaluated.
---

# Decide

Make and document a trade decision.

## Instructions

1. `$ARGUMENTS` should reference a thesis + action: "buy PNDX-B" or "skip pandox"
2. Read the thesis and its review from `knowledge/theses/`
3. Check current portfolio state via `get_portfolio` MCP tool
4. Determine action:
   - **BUY** → calculate shares based on thesis position size + portfolio cash
   - **SELL** → close or reduce existing position
   - **SKIP** → document why we're passing
5. Execute via `execute_sim_trade` MCP tool (simulation mode by default)
6. Save decision to `knowledge/decisions/YYYY-MM-DD-{action}-{company}.md`
7. Update `knowledge/portfolio/sim-portfolio.json`

## Decision document must include

- Action taken and why
- Links to: `[[theses/...]]`, `[[research/...]]`
- Portfolio impact (cash remaining, position %, sector exposure)
- Follow-up plan (when to check back, what would trigger exit)

## Safety

- Default mode: `--sim` (paper trading)
- `--live` flag: shows warning, requires explicit "yes" confirmation
- Max 10% of portfolio per position
- Max 30% in one sector
- Always set stop-loss
