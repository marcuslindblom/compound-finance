---
name: cf:research
description: Scan for insider trading signals and gather stock data. Creates structured research documents. Use when you want to discover new investment opportunities or investigate a specific company.
argument-hint: "[company name, or empty for daily scan]"
---

# Research

Gather financial data and create a structured research note.

## Instructions

1. If `$ARGUMENTS` contains a company name → research that specific company
2. If `$ARGUMENTS` is empty or "scan" → scan recent insider trades for notable signals
3. Delegate to the **researcher** agent for data gathering
4. Use MCP tools: `scan_notable_trades`, `search_insider_trades`, `get_stock_quote`, `get_stock_price_history`
5. Save output to `knowledge/research/YYYY-MM-DD-{company}-{signal}.md` using the template
6. Add `[[wiki-links]]` to related theses, patterns, and decisions

## Output

A research document saved to `knowledge/research/` with all data, sources, and cross-references.
