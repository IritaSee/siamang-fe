# GitHub Copilot instructions — SIAMANG frontend

Full project instructions are in [`AGENTS.md`](../AGENTS.md); backend work is in
[`docs/BACKEND.md`](../docs/BACKEND.md). Read those for anything non-trivial. The essentials:

## Context

SIAMANG is a flash-flood early warning system for pilot river basins in Aceh, West Sumatra, and
North Sumatra, Indonesia. **This repo is a visual mockup built to win a proposal, not a production
app.** All data is hardcoded in `src/data/mockData.js` — there is no backend, no API, and no real
authentication, and that is deliberate.

## Stack

Vite 8, React 19 with **plain JS + JSX (no TypeScript)**, react-router-dom 7, Leaflet +
react-leaflet for maps, Chart.js + react-chartjs-2 for charts, and **plain CSS with custom
properties** (no Tailwind, no CSS-in-JS).

## Rules

- Don't introduce TypeScript, Tailwind, a state manager, a data-fetching library, or a test
  harness unless explicitly asked.
- Never hardcode a color — use the CSS custom properties defined in `src/index.css`.
- Import risk-status labels and colors from `src/theme/riskLevels.js`; never re-declare them.
- **`black` status means "no signal / unknown", not "worse than red."** Render it categorically
  differently (hollow, dashed) and keep it out of severity orderings.
- **Never convey status by color alone** — always pair color with a distinct icon shape and a text
  label. Use `<StatusBadge>` / `<RiskIcon>`.
- All user-visible strings must be bilingual via `useLanguage()`:
  `locale === "id" ? "…" : "…"`. Default locale is Indonesian.
- Never use `Math.random()` or live `Date.now()` in mock data — the fixtures use a seeded PRNG and
  a frozen `NOW` so the demo is reproducible.
- Never nest `<Link>` inside `<button>` or vice versa.
- Match existing style: double quotes, semicolons, 2-space indent.

## Verifying

`npm run dev` (port 5173), `npm run build`, `npm run lint`. There are **no tests** — do not claim
tests pass. Verify by building successfully and checking the affected screens at both desktop and
mobile widths.
