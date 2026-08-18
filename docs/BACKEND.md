# SIAMANG — Backend Contract & Build Guide

For the agent (or human) who picks up backend work. Read [`../AGENTS.md`](../AGENTS.md) first for
frontend context.

**Status: no backend exists yet.** The frontend runs entirely off `src/data/mockData.js`.
This document defines the contract the backend should satisfy and the order to build it in.

---

## 1. Guiding principle

**The frontend already defines the data contract.** The shapes in `src/data/mockData.js` were
designed against real screens, so they are the specification — match them field-for-field rather
than inventing a new schema and forcing the UI to adapt. Where you genuinely need to change a
shape, change it in the mock fixture *and* the consuming screens in the same commit, so the two
never drift.

Corollary: `mockData.js` does not get deleted when the API lands. It becomes the fixture set for
local dev, offline demos, and seeding — see §3.

---

## 2. Domain model (read before designing tables)

Four concepts, in dependency order.

**Site** — a monitoring point on a river. Has a fixed position in the basin (`upstream` /
`midstream` / `downstream`) and a *current* risk status. A basin has multiple sites; upstream
readings are leading indicators for downstream ones, which is the whole point of the system.

**Device (node)** — physical hardware at a site: water-level sensor (AWLR), rain gauge (ARR), or
EWS siren. Reports readings and a heartbeat. Has its own status and battery level.

**Reading** — a timestamped sensor measurement (rainfall mm/h, water level cm, flow m³/s).
High volume, append-only, time-series shaped. This is the table that will dominate storage.

**Warning** — a risk event at a site. Has a trigger source, a lifecycle (active → resolved),
a dissemination fan-out (which loudspeakers/channels were notified and whether delivery was
confirmed), and an audit history of every manual action taken on it.

### Status derivation is a backend responsibility

The frontend renders `status`; it never computes it. The backend owns that logic:

| Status | Derived from |
|---|---|
| `green` / `yellow` / `orange` / `red` | Sensor thresholds and/or the central forecast model |
| `black` | **Absence of a heartbeat** — a liveness monitor, not a reading |

`black` deserves special care architecturally. A silent node cannot report that it is silent, so
nothing will ever POST you a `black` status. It must be **inferred by a scheduled job** that scans
for nodes whose `lastContact` exceeds a threshold, and it means *unknown*, not *severe*. A node
can go dark because the flood destroyed it or because a battery died in clear weather — the system
must not conflate the two, and must not rank `black` above `red` in any severity ordering.
See `src/theme/riskLevels.js` and §5 of `AGENTS.md`.

Site status vs. device status: a site aggregates its devices. Current mock behavior — worth
keeping unless product says otherwise — is that a site shows `black` when its primary sensor is
silent, while sibling devices at that site stay on their own last-known status.

---

## 3. Migration strategy — how to land an API without a rewrite

Do this in the order below. Each step leaves the demo working.

**Step 1 — introduce a seam.** Create `src/api/` exposing async functions that mirror today's
exports, and change screens to call those instead of importing `mockData` directly:

```js
// src/api/sites.js
import { SITES, siteById } from "../data/mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export async function fetchSites({ basin } = {}) {
  if (USE_MOCK) {
    return basin ? SITES.filter((s) => s.basin === basin) : SITES;
  }
  const qs = basin ? `?basin=${encodeURIComponent(basin)}` : "";
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sites${qs}`);
  if (!res.ok) throw new Error(`fetchSites failed: ${res.status}`);
  return res.json();
}
```

This is the highest-value step and it is worth doing *before* any server code exists. It converts
the frontend to async data flow while the mock still answers, so when the real API arrives the
switch is one env var.

**Step 2 — handle async UI states.** Once screens `await`, they need loading and error states.
The mockup has none today because data was synchronous. Add them at this step, not before.

**Step 3 — build the API** per §4/§6, seeded from `mockData.js` (§7).

**Step 4 — flip `VITE_USE_MOCK=false`.** Keep the mock path alive permanently; it is how you demo
on a plane and how you develop without standing up a database.

**On data fetching:** once more than a couple of screens are async, adopt TanStack Query rather
than hand-rolling `useEffect` fetches — you get caching, refetch-on-focus, and request
deduplication, which this app wants because several screens poll the same site list. Introduce it
at Step 2, not before; it is unnecessary while everything is mock.

---

## 4. Data contract

Field names and value domains below are **binding** — they are what the components already read.
Timestamps are ISO 8601 UTC strings. IDs are opaque strings.

### Site

```jsonc
{
  "id": "site-08",
  "name": "Batang Anai - Hilir",
  "basin": "Batang Anai",
  "province": "West Sumatra",
  "position": "downstream",        // "upstream" | "midstream" | "downstream"
  "lat": -0.468,
  "lng": 100.323,
  "status": "red",                 // green|yellow|orange|red|black
  "lastUpdated": "2026-08-12T03:27:00Z"
}
```

### Device

```jsonc
{
  "id": "dev-site-02-1",
  "siteId": "site-02",
  "site": "Krueng Aceh - Tengah",  // denormalized site name, used in tables
  "serial": "SMG-AC-021",
  "type": "Water Level Sensor (AWLR)",  // | "Rain Gauge (ARR)" | "EWS Siren"
  "status": "black",
  "lastContact": "2026-08-12T00:54:00Z",
  "battery": 9                     // integer percent 0-100
}
```

### Sensor series (per site)

Powers the Now/Forecast toggle on Site Detail. `now` = last 24h actual, hourly.
`forecast` = next 12h modeled, hourly.

```jsonc
{
  "now":      [{ "t": "2026-08-12T03:00:00Z", "rainfall": 12.4, "waterLevel": 68.2, "flow": 24.1 }],
  "forecast": [{ "t": "2026-08-12T04:00:00Z", "rainfall": 9.1,  "waterLevel": 70.5, "flow": 25.8 }]
}
```

Units: `rainfall` mm/h, `waterLevel` cm, `flow` m³/s. Keep them — axis labels depend on it.

### Device health (per device)

14-day daily history for the Device Detail charts.

```jsonc
[{ "t": "2026-08-12T03:30:00Z", "battery": 9, "signal": 0 }]   // both integer percent
```

### Warning

```jsonc
{
  "id": "w-01",
  "siteId": "site-08",
  "status": "red",
  "source": "central_forecast",   // sensor_threshold | central_forecast | manual | liveness_monitor
  "triggeredAt": "2026-08-12T02:36:00Z",
  "resolved": false,
  "resolvedAt": null,             // set when resolved
  "dissemination": [
    {
      "point": "Masjid Al-Ikhlas, Ketaping",
      "channel": "UHF/AM-FM Siren",   // | "SMS Blast" | "Radio Komunikasi"
      "status": "confirmed"           // confirmed | pending | failed
    }
  ],
  "history": [
    {
      "action": "Escalated to RED by duty operator",
      "by": "Rian Saputra (BPBD Sumbar)",   // display name, or "system"
      "at": "2026-08-12T02:54:00Z"
    }
  ]
}
```

`history` is an append-only audit log — every manual Trigger/Escalate/Downgrade/Cancel appends an
entry. Never rewrite or delete entries; this is the record of who ordered an evacuation.

### User (operator console)

```jsonc
{
  "id": "u-1",
  "name": "Rian Saputra",
  "email": "rian.saputra@bpba.go.id",
  "role": "Operator",             // Admin | Operator | Forecaster | Viewer
  "agency": "BPBD Sumatera Barat",
  "lastActive": "2026-08-12T03:18:00Z"
}
```

### Public alert

Citizen-facing message, distinct from the operator `Warning` — plain language, no internals.

```jsonc
{
  "id": "pa-1",
  "siteId": "site-08",
  "status": "red",
  "title": "Status AWAS di Batang Anai - Hilir",
  "message": "Ketinggian air naik cepat. Warga di sekitar bantaran sungai diminta segera menuju titik evakuasi terdekat.",
  "time": "2026-08-12T02:36:00Z"
}
```

Localization decision to make: the frontend is bilingual (ID/EN) but these strings are stored
Indonesian-only. Either return `{ title_id, title_en, message_id, message_en }` and let the client
pick by locale, or return pre-localized text based on an `Accept-Language` / `?locale=` parameter.
Prefer the former — it lets one cached response serve both locales. Whichever you choose, decide
before seeding production data; retrofitting translations onto existing rows is painful.

---

## 5. Endpoints

Suggested REST surface. Everything under `/api`.

### Public (unauthenticated, cacheable)

| Method | Path | Returns |
|---|---|---|
| GET | `/api/public/sites` | `Site[]` — supports `?basin=`, `?province=` |
| GET | `/api/public/sites/:id` | `Site` |
| GET | `/api/public/sites/:id/series` | sensor series (now + forecast) |
| GET | `/api/public/alerts` | `PublicAlert[]` — supports `?siteIds=a,b,c` |

Cache aggressively (30–60s). During a flood this is the traffic that spikes and it must not fall
over — it is the path citizens depend on. Put it behind a CDN and make sure a cache miss storm
can't take the origin down.

### Public (authenticated citizen)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/me/favorites` | `string[]` of site IDs |
| PUT | `/api/me/favorites/:siteId` | add favorite |
| DELETE | `/api/me/favorites/:siteId` | remove favorite |
| PATCH | `/api/me/notifications/:siteId` | per-favorite notification preference |

### Operator (authenticated staff)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/sites` | `Site[]`, `?basin=` |
| GET | `/api/sites/:id` | `Site` |
| GET | `/api/sites/:id/series` | sensor series |
| GET | `/api/sites/:id/devices` | `Device[]` |
| GET | `/api/sites/:id/warnings` | `Warning[]`, newest first |
| GET | `/api/dashboard` | status counts + active warnings + silent nodes (one call) |
| GET | `/api/warnings` | `Warning[]`, `?status=`, `?resolved=` |
| GET | `/api/warnings/:id` | `Warning` incl. dissemination + history |
| POST | `/api/warnings` | manual trigger → `{ siteId, status, note }` |
| POST | `/api/warnings/:id/escalate` | → `{ status, note }` |
| POST | `/api/warnings/:id/downgrade` | → `{ status, note }` |
| POST | `/api/warnings/:id/cancel` | → `{ note }` |
| GET | `/api/devices` | `Device[]`, `?status=`, `?q=` |
| GET | `/api/devices/:id` | `Device` |
| GET | `/api/devices/:id/health` | 14-day battery/signal history |
| GET | `/api/users` | `User[]` — **Admin only** |

`/api/dashboard` exists because the Dashboard needs counts, active warnings, and silent nodes
together; three round-trips on the screen operators stare at all day is the wrong trade.

### Ingest (device-facing, separate auth)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/ingest/readings` | batched sensor readings from a node |
| POST | `/api/ingest/heartbeat` | liveness ping |

Keep this on a **separate path, separate credentials, and ideally a separate service** from the
human-facing API. Field devices authenticate with long-lived per-device keys, are on untrusted
networks, and have a completely different threat model and traffic shape. Do not let a device
credential reach an operator endpoint.

---

## 6. Real-time

Operators need warnings to appear without a manual refresh. Options, in order of preference:

1. **SSE** (`GET /api/stream`) — one-way server→client, which is all this needs. Works through
   most proxies, auto-reconnects, far simpler than WebSockets.
2. **Polling** every 15–30s — perfectly acceptable for v1; the mock already implies this cadence.
   Ship this first if SSE would delay the release.
3. **WebSockets** — only if bidirectional messaging becomes a real requirement.

Public app: polling is fine. Do not open a socket per citizen during a flood.

---

## 7. Seeding

Port `src/data/mockData.js` into a seed script. Preserve the properties that make it a *good*
fixture set, because they were chosen deliberately:

- 15 sites across 6 basins in 3 provinces, with upstream/midstream/downstream trios
- At least one site per status, including **two `black` sites** (silent-node handling is the
  easiest thing to get wrong and the most important to demo)
- Warnings covering all four `source` values, both resolved and active
- Dissemination rows in mixed `confirmed` / `pending` states
- A device whose signal collapses to ~0 over the final 2 days, matching its `black` status

The generator uses a seeded PRNG (`mulberry32`) specifically so runs are reproducible. Keep that
in the seed script — reproducible seed data makes bug reports reproducible too.

---

## 8. Auth

Two distinct audiences; do not merge them into one user table with a role flag.

**Citizens** (public app) — self-registered, own only favorites and notification preferences.
Low-value accounts, high volume. Email/phone OTP is a good fit; avoid passwords if you can.

**Staff** (operator console) — BNPB/BPBD/BMKG personnel, provisioned by an admin, never
self-registered. Roles already modeled in the UI: `Admin`, `Operator`, `Forecaster`, `Viewer`.

Authorization rules the UI already assumes:

- `/api/users` is Admin-only.
- Warning actions (trigger/escalate/downgrade/cancel) require `Operator` or above — `Viewer` must
  not be able to call them. **Enforce this server-side**; the current frontend hides buttons by
  role at best, which is not a control.
- Every warning action records the acting user into `history.by`. This is an audit trail for
  evacuation orders — treat it as compliance-grade: append-only, attributable, never silently
  editable.

Staff auth should support SSO against government identity providers eventually. Don't build that
in v1, but don't design something that makes it impossible either.

---

## 9. Stack suggestion

No backend decision has been made yet. Two reasonable defaults:

- **Node + Fastify + PostgreSQL + Prisma** — one language across the stack, fastest path for a
  team already in JS, easy to share the risk-status constants with the frontend.
- **Python + FastAPI + PostgreSQL** — better if the forecasting/model work is Python (likely
  here), so the API sits next to the models rather than calling across a boundary.

Given SIAMANG's forecasting core, **FastAPI is probably the better fit** — but confirm with
whoever owns the model before committing.

Either way: **PostgreSQL + TimescaleDB** (or native partitioning) for readings. Sensor data is
the one genuinely high-volume table, it is append-only and time-ordered, and retention/downsampling
policies you skip now become a painful migration later. Decide retention up front.

---

## 10. Deliberately out of scope for v1

Listed so nobody rediscovers these as "missing": actual SMS/push delivery integration, offline
support, the forecasting model itself (assume it exists and publishes to the API), hardware
provisioning flows, and multi-tenancy across regencies. Confirm before building any of them.

---

## 11. Definition of done for the backend v1

- [ ] All §4 shapes served exactly as specified; frontend runs with `VITE_USE_MOCK=false` and no
      component changes needed
- [ ] Ingest accepts readings + heartbeats on separate credentials
- [ ] Liveness job flips silent nodes to `black` and opens a `liveness_monitor` warning
- [ ] Threshold + forecast evaluation produces green→red statuses
- [ ] Warning lifecycle with append-only, attributable history
- [ ] Role enforcement server-side, especially Viewer vs Operator on warning actions
- [ ] Public read endpoints cached and load-tested at flood-event traffic
- [ ] Seed script reproduces the demo dataset
