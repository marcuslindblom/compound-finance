---
name: evaluate
description: Multi-agent evaluation of an investment thesis. The reviewer agent challenges the thesis, checks for biases, and looks for red flags. Use before making any trade decision.
---

# Evaluate

Run a critical review of an investment thesis before deciding to trade.

## Instructions

1. `$ARGUMENTS` should reference a thesis document
2. Read the thesis from `knowledge/theses/`
3. Read linked research and patterns
4. Delegate to the **reviewer** agent for critical analysis
5. The reviewer will:
   - Challenge the bull case
   - Present the bear case
   - Check for cognitive biases
   - Look for red flags
   - Search `knowledge/archive/` for similar failed trades
6. Append the review to the thesis document under a `## Review` section
7. Verdict: PROCEED / CAUTION / REJECT

## After evaluation

- PROCEED → ready for `/cf:decide`
- CAUTION → consider smaller position size, tighter stop-loss
- REJECT → archive thesis with rejection reason
