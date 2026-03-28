# Compound Finance

An AI-powered investment research and paper trading system. Each trade makes the next one smarter.

## Philosophy

80% planning and review, 20% execution. Every decision is documented, every outcome feeds back into the system. Compounding knowledge, not just capital.

## Workflow

```
/cf:research → /cf:thesis → /cf:evaluate → /cf:decide → /cf:compound
     ↑                                                        |
     └────────── patterns feed back ───────────────────────────┘
```

## Directory Map

- `knowledge/research/` — Raw research: insider signals, news, data pulls. One file per research item.
- `knowledge/theses/` — Investment hypotheses with entry/exit criteria. Status: draft → active → closed.
- `knowledge/decisions/` — Buy/sell/skip decisions with full context and links to thesis + research.
- `knowledge/patterns/` — Extracted learnings. "When X happens, Y follows Z% of the time."
- `knowledge/portfolio/` — Active portfolio state. `sim-portfolio.json` is the source of truth.
- `knowledge/reviews/` — Weekly and monthly reflections. What worked, what didn't, why.
- `knowledge/archive/` — Closed positions and outdated theses. Never delete, always archive.
- `templates/` — Markdown templates for research, thesis, and decision documents.
- `agents/` — AI agent definitions: researcher, analyst, reviewer.
- `skills/` — Plugin skills for the compound workflow.
- `src/` — MCP server: FI scraper, Yahoo Finance, scoring engine.

## Conventions

### File naming
`YYYY-MM-DD-company-signal-type.md` — e.g., `2026-03-28-pandox-cfo-buy.md`

### Wiki links
Use `[[double-bracket]]` links to connect documents:
```markdown
Based on [[research/2026-03-28-pandox-cfo-buy]].
Consistent with [[patterns/contra-trend-cfo]].
Previous similar: [[archive/2025-11-balder-cfo-buy]].
```

### Frontmatter
All documents use YAML frontmatter:
```yaml
---
date: 2026-03-28
status: active  # draft | active | closed
type: thesis    # research | thesis | decision | pattern | review
tags: [insider, cfo-buy, hospitality, contra-trend]
related:
  - research/2026-03-28-pandox-cfo-buy
  - patterns/contra-trend-cfo
---
```

### Document format
All documents are Markdown. Use frontmatter for metadata. Cross-reference with wiki links. Archive, never delete.

## Simulation Mode

Default mode is simulation (paper trading). Portfolio state lives in `knowledge/portfolio/sim-portfolio.json`.

- All `/cf:decide` commands default to `--sim`
- Use `--live` flag for real trades (requires explicit confirmation)
- Simulation tracks: returns vs OMXS30, win rate, avg return, max drawdown, Sharpe ratio
- Score accuracy tracking validates the scoring engine over time

## Agents

- **Researcher** — Gathers data. No opinions. Sources: FI, Yahoo Finance, news.
- **Analyst** — Formulates theses. Compares with patterns. Assigns conviction level.
- **Reviewer** — Devil's advocate. Actively looks for reasons NOT to buy. Checks bias.

## MCP Tools

The plugin exposes tools via MCP that agents use automatically:
- `search_insider_trades` — FI insynsregistret
- `scan_notable_trades` — Scored insider buys
- `search_stock` / `get_stock_quote` / `get_stock_price_history` — Yahoo Finance
- `manage_watchlist` — Track companies
- `get_portfolio` — Current simulation portfolio state
- `execute_sim_trade` — Buy/sell in simulation
