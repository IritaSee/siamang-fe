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

Five concepts, in dependency order.

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

**Citizen Report** — an unauthenticated-or-optionally-authenticated incident report submitted by
the public, distinct from both `Warning` (system/operator-originated, verified) and `PublicAlert`
(system-to-citizen, plain language). May reference a `Site` via a computed nearest-match, or none
at all — the latter is itself a signal of a monitoring coverage gap, not a data-quality problem to
paper over. Carries a triage workflow (`new → reviewed/verified/dismissed/escalated`) separate
from flood risk status, plus device-reported metadata (location, connection, battery) that gives
an operator reliability context on the report, not a computed severity score — the backend should
resist the temptation to auto-derive "how bad is this" from that metadata; that's a human triage
call.

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

**Flood-impact overlay is a frontend mockup illustration, not a real contract.** The Operator
Console's map (`src/theme/impactOverlay.js`) draws one irregular polygon per site — sized from
`status` + the existing forecast trend, and elongated toward the basin's real downhill direction
(derived from `SITES[].elevationMeters`, see below) — meant to represent a vendor's AI flood-impact
prediction. This is a placeholder for a real integration, not something to productionize as-is. A
real vendor model would return actual geometry (GeoJSON `Polygon`/`MultiPolygon`) or a raster/
heatmap tile URL per forecast run, keyed to a site or an arbitrary area — not a computed, jittered
shape. When that integration exists, the frontend's polygon math should be discarded wholesale,
not incrementally adapted.

`SITES[].elevationMeters` (real SRTM elevation, via opentopodata.org's public API, fetched once
and baked into the mock fixtures rather than queried live) **is** a `Site` field worth carrying
forward, unlike the polygon math — it's real data, not mockup illustration. If a real backend
seeds from this same fixture set, keep the field; if it seeds from something else, populate it the
same way (a one-time elevation lookup per site) rather than dropping it, since a few consumers
outside the impact-overlay computation could reasonably use it too (e.g., displaying a site's
elevation as context). Worth knowing: this data revealed that one site's `position` label
("downstream") doesn't match its real elevation relative to its basin-mates — see the comment on
`SITES` in `mockData.js`. That's a mockup coordinate quirk, not a backend concern, but don't be
surprised if it resurfaces if real coordinates are ever swapped in.

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
  "source": "central_forecast",   // sensor_threshold | central_forecast | manual | liveness_monitor | citizen_report
  "originReportId": null,         // set only when source is "citizen_report" — the Citizen Report id
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

Localization note: the frontend is bilingual but this shape is Indonesian-only. Prefer returning
`{ title_id, title_en, message_id, message_en }` (or resolving server-side by `?locale=`) before
production data exists — retrofitting translations onto live rows later is painful.

### Citizen report

```jsonc
{
  "id": "cr-01",
  "reporter": { "name": "...", "email": "..." },  // null if anonymous — reporting never requires login
  "locationDetail": "Dekat jembatan gantung, RT03 Ketaping, sekitar 500m dari Balai Desa",
  "nearestSiteId": "site-08",           // computed server-side via nearest-match at submission time
  "nearestSiteDistanceKm": 1.1,          // null if no site is nearby, or geolocation wasn't available
  "description": "Air sungai naik cepat dalam 30 menit terakhir...",
  "photos": [{ "id": "cr-01-photo-0", "url": "https://cdn.example/..." }],
  "deviceMeta": {
    "geolocation": { "status": "granted", "lat": -0.4706, "lng": 100.3301, "accuracyMeters": 15 },
    // status: granted | denied | unavailable | not_requested — lat/lng/accuracyMeters null unless "granted"
    "connection": { "supported": true, "effectiveType": "4g", "downlinkMbps": 7.1, "saveData": false },
    // supported: false on browsers with no Network Information API (Safari/Firefox) — never faked
    "battery": { "simulated": true, "levelPercent": 54 }
    // always simulated from the web client — see the mockup note above; a native app could report real values
  },
  "workflowStatus": "new",              // new | reviewed | verified | dismissed | escalated
  "escalatedWarningId": null,           // set when workflowStatus is "escalated" and a Warning was created
  "reviewedBy": null,                   // display name of the staff member who last acted on this report
  "reviewedAt": null,
  "reviewNote": null,
  "submittedAt": "2026-08-12T03:12:00Z"
}
```

`reviewedBy`/`reviewedAt`/`reviewNote` are single last-action fields, not an append-only history
array like `Warning.history` — a citizen report triage isn't a compliance-grade evacuation-order
record the way a Warning is, so one "last review" is enough for v1. Confirm with product before
launch whether that's still true once reports carry legal/liability weight.

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

### Public (report submission — auth optional)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/public/reports` | submit a citizen report — bearer token optional, never required |

Accepts a `multipart/form-data` body (photos + fields) or JSON + a separate signed photo-upload
step, your call. Whichever you pick, submission must succeed with only `description` present —
every other field, including location, is optional by design (see §2's Citizen Report note). Do
not add server-side validation that makes location or photos mandatory; that reintroduces exactly
the login-wall friction the anonymous-reporting requirement exists to avoid.

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
| GET | `/api/reports` | `CitizenReport[]`, `?status=`, `?q=` |
| GET | `/api/reports/:id` | `CitizenReport` |
| PATCH | `/api/reports/:id/status` | → `{ status, note }` — Operator role or above (see §8) |
| POST | `/api/reports/:id/escalate` | creates a `Warning` with `source: "citizen_report"` + `originReportId`, sets the report's `escalatedWarningId` |
| GET | `/api/users` | `User[]` — **Admin only** |

`/api/dashboard` exists because the Dashboard needs counts, active warnings, and silent nodes
together; three round-trips on the screen operators stare at all day is the wrong trade.

Note the frontend mockup's Escalate action does **not** exercise `/api/reports/:id/escalate`
live — it only updates the report's own status, matching every other warning action in the mockup
being toast-only rather than a real write (see AGENTS.md §9). This endpoint description is the
real spec to build against, not something already proven out by the frontend.

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
- Warnings covering all five `source` values (including `citizen_report`), both resolved and active
- Dissemination rows in mixed `confirmed` / `pending` states
- A device whose signal collapses to ~0 over the final 2 days, matching its `black` status
- Citizen reports covering the full triage lifecycle, including at least one report with no nearby
  site (a coverage gap) and one already escalated into a real Warning (the `originReportId` /
  `escalatedWarningId` pair) — this is what proves the escalation flow actually round-trips

The generator uses a seeded PRNG (`mulberry32`) specifically so runs are reproducible. Keep that
in the seed script — reproducible seed data makes bug reports reproducible too.

---

## 8. Auth

Two distinct audiences; do not merge them into one user table with a role flag.

**Citizens** (public app) — self-registered, own only favorites and notification preferences.
Low-value accounts, high volume. Email/phone OTP is a good fit; avoid passwords if you can.
Reporting an incident is deliberately **not** gated behind this account system — anonymous
submission must keep working even if the auth service is degraded during an actual flood.

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
- Citizen report triage (`PATCH /api/reports/:id/status`, `POST /api/reports/:id/escalate`)
  follows the same `Operator`-or-above rule as warning actions. `Viewer` should be able to read
  reports, not act on them.

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
support, the forecasting model itself (assume it exists and publishes to the API), the real
vendor flood-impact/AI-prediction integration (assume it doesn't exist yet — the frontend's
polygon overlay is an illustrative placeholder, not something to wire a real feed into),
hardware provisioning flows, multi-tenancy across regencies, photo storage/CDN for citizen report
attachments, abuse/spam moderation for public submissions, and push notifications back to a
reporter about their own report's status. Confirm before building any of them.

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
- [ ] Citizen report ingest, triage status transitions, and escalate-to-Warning wired per §4/§5
