# 📈 Compound Finance

A Claude Code plugin for AI-powered investment research and paper trading. Each trade makes the next one smarter.

## Philosophy

> Each unit of investment research should make subsequent decisions easier — not harder.

Inspired by [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin), this plugin applies the same compounding principles to investing: plan thoroughly, review critically, codify learnings.

## Workflow

```
/cf:research → /cf:thesis → /cf:evaluate → /cf:decide → /cf:compound
     ↑                                                        |
     └────────── patterns feed back ───────────────────────────┘
```

| Skill | Purpose |
|---|---|
| `/cf:research` | Scan insider trades, gather stock data, write research notes |
| `/cf:thesis` | Formulate investment hypothesis with entry/exit criteria |
| `/cf:evaluate` | Multi-agent review — devil's advocate challenges the thesis |
| `/cf:decide` | Execute trade in simulation portfolio |
| `/cf:compound` | Extract learnings, update patterns, refine scoring |

## Agents

| Agent | Role |
|---|---|
| **Researcher** | Gathers data. No opinions. Facts and sources only. |
| **Analyst** | Formulates theses. Compares with patterns. Assigns conviction. |
| **Reviewer** | Devil's advocate. Finds holes. Checks biases. Red flags. |

## Data Sources

| Source | Data | Cost |
|---|---|---|
| FI Insynsregistret | Swedish insider transactions | Free |
| Yahoo Finance | Stock prices, history, 52w range | Free |

## Simulation

Default mode is paper trading with 1M SEK starting capital:

```
Portfolio: 1,000,000 SEK
├── Cash: 847,200 SEK
├── PNDX-B.ST: 500 shares @ 176.2 (+2.3%)
└── Stats: Win rate 60%, Avg return +8.2%, Sharpe 1.4
```

All trades tracked in `knowledge/portfolio/sim-portfolio.json` with full audit trail.

## Knowledge Base

Obsidian-compatible with `[[wiki-links]]`:

```
knowledge/
├── research/      ← Raw data and signals
├── theses/        ← Investment hypotheses
├── decisions/     ← Trade decisions with context
├── patterns/      ← Extracted learnings (the compound part)
├── portfolio/     ← Simulation portfolio state
├── reviews/       ← Weekly reflections
└── archive/       ← Closed positions
```

## Installation

```bash
git clone https://github.com/marcuslindblom/compound-finance.git
cd compound-finance
npm install
claude --plugin-dir .
```

## License

MIT
