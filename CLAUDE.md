# CLAUDE.md

Project instructions live in **[AGENTS.md](AGENTS.md)** — a single source of truth shared by every
AI coding tool used on this repo. Read it before making changes.

@AGENTS.md

Backend work: **[docs/BACKEND.md](docs/BACKEND.md)**.

## Quick reminders

- This repo is a **visual mockup for a proposal**, not production. All data is hardcoded in
  `src/data/mockData.js`. No backend, no real auth — that is deliberate. See AGENTS.md §1.
- `npm run build` must pass before you call work done. There are **no tests** — never claim
  tests pass. Verify by building and clicking through the affected screens.
- Don't break the risk-level system (AGENTS.md §5). In particular: `black` means "no signal /
  unknown", **not** "worse than red", and status is never conveyed by color alone.
- Keep edits scoped. Don't add TypeScript, Tailwind, a state manager, or a test harness unless
  explicitly asked.
