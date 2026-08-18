# SIAMANG — Frontend

**Sistem Peringatan Dini Banjir Bandang** — a flash-flood early warning system for pilot river
basins in Aceh, West Sumatra, and North Sumatra, Indonesia.

> ⚠️ **This is a clickable visual mockup built for a proposal, not a production application.**
> All data is hardcoded in `src/data/mockData.js`. There is no backend, no API, and no real
> authentication. Every number on screen is illustrative.

## Quick start

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR on port 5173 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built output |
| `npm run lint` | oxlint |

## What's in here

The landing page at `/` switches between the two apps this system comprises:

**Operator / Admin Console** (`/operator`) — desktop-first, for BNPB / BPBD / BMKG staff at the
operational service center. Dashboard, map of monitoring sites, site detail with sensor charts,
warning management, device health, and user administration.

**Public Platform** (`/public`) — mobile-first, for at-risk communities. Site status browsing,
map, alerts feed, and saved favorites. Demonstrates both logged-out and logged-in states; the
"Masuk" button fakes a session so both can be shown.

Both apps are bilingual (Bahasa Indonesia / English) via the toggle in the header. Indonesian is
the default.

### The risk-level system

Five statuses drive nearly every screen: **Aman/Normal**, **Waspada/Watch**, **Siaga/Alert**,
**Awas/Danger**, and **Tidak Ada Sinyal/No Signal**.

The last one is not "worse than danger" — it means a sensor node has gone silent, possibly
destroyed by the flood, possibly just a flat battery. It is an *unknown* state, so it is rendered
categorically differently and never ranked above Danger. Status is never conveyed by color alone;
every badge, map marker, and list row pairs color with a distinct icon shape and a text label.

## Documentation

| Doc | For |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Working in this codebase — architecture, conventions, gotchas. Read this first. |
| [`docs/BACKEND.md`](docs/BACKEND.md) | Building the backend — data contract, endpoints, migration path. |
| [`CLAUDE.md`](CLAUDE.md) · [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | Tool-specific pointers to `AGENTS.md`. |

## Tech

Vite 8 · React 19 (plain JS) · react-router-dom 7 · Leaflet · Chart.js · plain CSS with custom
properties.
