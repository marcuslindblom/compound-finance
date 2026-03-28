---
name: thesis
description: Formulate an investment thesis from research data. Defines entry/exit criteria, position sizing, and conviction level. Use after research is complete.
---

# Thesis

Build an investment thesis from existing research.

## Instructions

1. `$ARGUMENTS` should reference a research document or company name
2. Read the relevant research from `knowledge/research/`
3. Check `knowledge/patterns/` for historical precedent
4. Delegate to the **analyst** agent for thesis formulation
5. Save to `knowledge/theses/YYYY-MM-DD-{company}-{signal}.md` using the template
6. Link back to research: `[[research/...]]`
7. Link to relevant patterns: `[[patterns/...]]`

## Required fields in thesis

- Entry price + current price
- Target price (with reasoning)
- Stop-loss level (with reasoning)
- Time horizon
- Position size (% of portfolio, max 10%)
- Conviction: Low / Medium / High
- Falsification criteria (what kills this thesis?)
