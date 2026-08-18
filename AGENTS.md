# AGENTS.md — SIAMANG Frontend

Instructions for AI coding agents working in this repo. Read this before making changes.
Backend work has its own doc: **[docs/BACKEND.md](docs/BACKEND.md)**.

---

## 1. What this project is (read this first)

SIAMANG is a flash-flood early warning system for pilot river basins in **Aceh, West Sumatra,
and North Sumatra, Indonesia**. Sensors upstream/midstream/downstream feed a forecasting system
that produces a risk status per monitoring site.

**This repo is currently a visual mockup built to win a proposal, not a production app.**
That is the single most important thing to know, because it changes what "correct" means here:

- All data is hardcoded in `src/data/mockData.js`. There is no backend, no API, no database, no
  real auth. This is deliberate.
- Screens must look right and be clickable end-to-end. Stakeholders click through this.
- Do **not** add a state manager, data-fetching library, test harness, or design system "to do
  it properly" unless explicitly asked. Extra machinery slows the demo down and buys nothing yet.

**When the project graduates to a real build**, that transition is designed for and documented in
`docs/BACKEND.md`. Follow that doc rather than improvising a data layer.

If you are asked for something that conflicts with "this is a mockup" (e.g. "add real login"),
ask which mode you are in before building it.

---

## 2. Commands

```bash
npm install        # first time
npm run dev        # dev server on http://localhost:5173
npm run build      # production build (must pass before you call work done)
npm run lint       # oxlint
npm run preview    # serve the built output
```

There are **no tests** in this repo, by design for the mockup phase. Do not claim tests pass.
Verification = `npm run build` succeeds + you clicked through the affected screens in a browser.

The build prints a >500 kB chunk-size warning (Leaflet + Chart.js + React). That is **expected
and accepted** for a mockup. Do not "fix" it with code-splitting unless asked.

---

## 3. Stack

| Concern | Choice | Notes |
|---|---|---|
| Build | Vite 8 | |
| UI | React 19, **plain JS + JSX** | No TypeScript. Don't introduce it unprompted. |
| Routing | react-router-dom 7 | `BrowserRouter`, routes all in `src/App.jsx` |
| Maps | Leaflet 1.9 + react-leaflet 5 | OpenStreetMap raster tiles |
| Charts | Chart.js 4 + react-chartjs-2 | Registered once in `src/chartSetup.js` |
| Styling | **Plain CSS + CSS custom properties** | No Tailwind, no CSS-in-JS |
| Lint | oxlint | |

Styling rule: colors, radii, shadows, and fonts come from CSS variables defined in
`src/index.css`. Never hardcode a hex value in a component — add or reuse a token.

---

## 4. Architecture

Two separate apps behind one router, plus a landing page that switches between them.

```
/                     Landing — choose which app to demo
/operator/*           Operator Console — desktop-first, data-dense, dark sidebar
/public/*             Public Platform — mobile-first, phone frame on desktop
```

```
src/
  App.jsx                  route tree (all routes live here)
  main.jsx                 mounts LanguageProvider -> App
  Landing.jsx              app switcher
  chartSetup.js            Chart.js registration (import for side effect)

  theme/riskLevels.js      ** the risk-status source of truth — see §5 **
  i18n/LanguageContext.jsx global ID/EN locale state (see §6)
  reports/ReportsContext.jsx cross-app citizen-report state (see §9)
  data/mockData.js         ALL mock data (see §7)

  components/              shared across both apps
    RiskIcon, StatusBadge, MapLegend    status vocabulary
    SiteMap, mapIcons.js                Leaflet wrapper + status markers
    SensorChart, MiniLineChart          Chart.js wrappers
    Card, StatCard, Icon, LanguageToggle
    ui.css                              shared atoms (.btn, .card, .data-table, .pill-tabs,
                                         .textarea, .meta-flag)

  layouts/
    OperatorLayout.jsx/.css  sidebar + topbar shell
    PublicLayout.jsx/.css    phone frame + bottom tab bar (incl. the raised
                             center "report" button — not a TABS entry, see §9)

  operator/   Dashboard, OperatorMap, SiteDetail, Warnings, WarningDetail,
              Devices, DeviceDetail, Users, CitizenReports, CitizenReportDetail,
              operator.css
  public/     PublicHome, PublicMap, PublicSiteDetail, PublicAlerts,
              PublicSettings, PublicReport, LoginPromptModal,
              PublicAuthContext.jsx, public.css
```

CSS convention: shared atoms in `components/ui.css`; app-specific styles in
`operator/operator.css` and `public/public.css`, each imported once by its layout.
Class prefixes: `op-` for operator, `pub-` for public.

---

## 5. The risk-level system — the one thing you must not break

Five statuses drive nearly every screen: `green`, `yellow`, `orange`, `red`, `black`.
Defined once in **`src/theme/riskLevels.js`**. Always import from there; never re-declare
labels or colors in a component.

| Value | EN (operator) | ID (public) | Color | Icon shape |
|---|---|---|---|---|
| `green` | Normal | Aman | `#16A34A` | filled circle |
| `yellow` | Watch | Waspada | `#EAB308` | filled triangle |
| `orange` | Alert | Siaga | `#F97316` | heavier triangle |
| `red` | Danger | Awas | `#DC2626` | filled diamond |
| `black` | No Signal | Tidak Ada Sinyal | `#111827` | hollow dashed "signal-off" glyph |

Three invariants, all load-bearing:

1. **`black` is NOT "worse than red."** It means a node went silent — possibly destroyed by the
   flood, possibly a flat battery. It is an *unknown* state, not a confirmed severe reading.
   It must always render categorically differently (hollow/dashed, never a filled shape in the
   same gradient), and it is excluded from `FLOOD_SEVERITY_ORDER` so severity sorts push it to
   the end rather than to the top. On the operator Dashboard it gets its own panel instead of
   being folded into the severity counts.
2. **Never use color alone.** Every place a status appears — badge, map marker, list row, legend
   — pairs color with a distinct icon shape *and* a text label. Use `<StatusBadge>` / `<RiskIcon>`
   rather than styling a colored dot yourself.
3. **Risk colors are reserved.** `--risk-*` tokens mean status and nothing else. Brand chrome uses
   `--brand-*`. Never use the risk red for a "delete" button or the risk green for a success toast.

---

## 6. Internationalization

Global locale lives in `src/i18n/LanguageContext.jsx`, mounted in `main.jsx` above the router.
It persists to `localStorage` (`siamang-locale`) and syncs `document.documentElement.lang`.
Default is `id`. `<LanguageToggle>` flips it.

```jsx
import { useLanguage } from "../i18n/LanguageContext";
const { locale } = useLanguage();          // "id" | "en"
<h1>{locale === "id" ? "Peringatan" : "Alerts"}</h1>
```

Components that render status text take a `locale` prop and pass it down:
`<StatusBadge level={s.status} locale={locale} />`, same for `SiteMap`, `MapLegend`,
`SensorChart`, and `timeAgo(iso, locale)`.

**Known tradeoff, deliberate for now:** translations are inline `locale === "id" ? … : …`
ternaries rather than a message catalog. Fine at mockup scale, and it keeps copy visible next to
the markup while the wording is still churning. If the project graduates to production, lifting
these into a `src/i18n/messages.{id,en}.js` catalog is a worthwhile refactor — but do it as one
deliberate pass, not opportunistically file-by-file, or the codebase ends up half-migrated.

Note the original brief called for an English-only operator console and Indonesian-only public
app. That has since been superseded: **both apps are bilingual** and the toggle is global.

---

## 7. Mock data conventions

Everything lives in `src/data/mockData.js`. Two conventions matter:

- **Time is frozen.** `const NOW = new Date("2026-08-12T03:30:00Z")` anchors every timestamp.
  Helpers `isoHoursAgo()` / `isoHoursAhead()` build relative times from it, and `timeAgo()` /
  `formatClock()` render them. Never use live `Date.now()` in a screen — relative labels like
  "54m ago" would drift away from the story the fixtures tell.
- **Random data is seeded.** `mulberry32` + `seedFromString(id)` generate sensor series and device
  health, so charts are byte-identical on every reload. Never use bare `Math.random()`; a chart
  that reshuffles mid-demo reads as a bug.

Sensor series are shaped by status: `INTENSITY_BY_STATUS` makes red/orange sites visibly trend
worse than green ones, and silent (`black`) devices show signal collapsing to ~0 over the last
2 days. Keep that coupling — fixtures that contradict their own status badge undermine the demo.

Current fixture size: 15 sites / 6 basins / 33 devices / 9 warnings / 6 users / 5 citizen reports.

Exports: `SITES`, `BASINS`, `PROVINCES`, `SITE_SERIES`, `DEVICES`, `DEVICE_HEALTH`, `WARNINGS`,
`USERS`, `PUBLIC_ALERTS`, `PUBLIC_FAVORITES`, `CITIZEN_REPORTS`, `NOW_ISO`, and helpers `siteById`,
`devicesForSite`, `warningsForSite`, `nearestSite`, `timeAgo`, `formatClock`, `formatDateTime`.

`nearestSite(lat, lng)` returns the closest `SITES` entry by haversine distance, or `null` if no
coordinates were given — used to give a citizen report context without requiring the reporter to
know which official monitoring site they're near (see §9).

**Timestamp gotcha for live-created data:** anything created at runtime (not a build-time fixture)
must still stamp its timestamp from the frozen clock, not the real one — use `NOW_ISO`, not
`new Date().toISOString()`. `ReportsContext.addReport()` does this for `submittedAt`; if you add
another live-write path, do the same, or `timeAgo()`/`formatDateTime()` will render nonsense
relative to `NOW`.

---

## 8. Mock auth (public app only)

`src/public/PublicAuthContext.jsx` fakes a logged-in/out session so the demo can show both states.
There is no real credential check and no token — do not add one in mockup mode.

The logged-out and logged-in states must stay **visibly different** (that distinction is a
requirement, not a detail):

- Logged out: no personalization on Home, a "sign in to save favorites" CTA, Settings replaced by
  a login prompt, and tapping ★ opens `LoginPromptModal` instead of saving.
- Logged in: greeting by name, favorite site cards with trend prediction, Alerts scoped to
  favorites with an "all sites" toggle, full Settings.

Implementation note worth preserving: saved favorites live in `savedFavorites` state but the
exported `favorites` is `isLoggedIn ? savedFavorites : []`, and `isFavorite()` gates on
`isLoggedIn`. That way an account's favorites survive a logout/login round-trip in the demo
without ever leaking into the logged-out UI. A previous bug showed sites as already-favorited
while logged out; don't reintroduce it by reading `savedFavorites` directly.

---

## 9. Citizen reports & cross-app live state

`src/reports/ReportsContext.jsx` is the third context (alongside `LanguageContext` and
`PublicAuthContext`) and the only one mounted around the **whole** route tree in `App.jsx`
(`PublicAuthProvider` deliberately still wraps only `/public`). It has to be visible to both
`/operator/*` and `/public/*`: a citizen report submitted on the Public Platform must appear on
the Operator Console's Citizen Reports screen within the same session, with no page reload — that
live hand-off is the point of the feature, not an incidental detail.

State shape: `reports` (seed `CITIZEN_REPORTS` plus anything submitted this session, newest
first), `addReport(draft)`, `updateReportStatus(id, status, { reviewedBy, reviewNote })`,
`reportById(id)`. The seed data is loaded straight into the same mutable state as live
submissions — there's no separate "read-only fixtures" layer — so triage actions work identically
on seeded and freshly-submitted reports.

**Entry point**: a raised circular button embedded in the middle of the public bottom tab bar
(`PublicLayout.jsx`), not a `TABS` entry and not a floating button elsewhere. `TABS` still holds
only the four real destinations; the report button is hardcoded between `TABS.slice(0, 2)` and
`TABS.slice(2)` in the render, with its own CSS in `PublicLayout.css`
(`.pub-tab-raised-wrap`/`.pub-tab-raised`) rather than sharing `.pub-tab`.

**Report workflow status** (`new | reviewed | verified | dismissed | escalated`) is a separate
vocabulary from the flood risk levels in §5 — it describes triage progress on an unverified public
submission, not a flood status. It's rendered with the existing `badge-neutral` classes and a
local label/tone map in `CitizenReports.jsx` (exported for `CitizenReportDetail.jsx` to reuse —
the one deliberate exception to the "each file keeps its own local label map" pattern the four
`SOURCE_LABEL` maps otherwise follow, because these two screens are a tightly-coupled pair authored
together). Never reach for `StatusBadge`/`RISK_LEVELS` for this status.

**Escalate is mock-confirm only**, matching the existing toast pattern in `SiteDetail.jsx`'s
warning actions exactly — it updates the report's own `workflowStatus` live, but does **not**
create a real `WARNINGS` entry. `WARNINGS` is read directly by four files; turning it into shared
mutable state to support one button would be disproportionate for a mockup, and every other
warning action already behaves the same way. The one seeded exception, `cr-05` → `w-09`
(`WARNINGS`, `source: "citizen_report"`, `originReportId: "cr-05"`), exists specifically to show a
stakeholder the fully-wired before/after outcome without the app needing a live cross-entity write
pipeline. Don't wire more of these — one worked example is the point.

**Metadata capture is real where the browser allows it, and honestly labeled where it can't be**:
`navigator.geolocation` is requested on an explicit tap (never on mount) and gets a genuine denial
path — a report must stay submittable without location. The Network Information API
(`navigator.connection`) has no permission gate at all, so it's read passively on mount; Safari/
Firefox simply don't expose it, and that's shown as "unavailable," never faked. Battery is always
simulated (`Math.random()` in `PublicReport.jsx`, the one deliberate exception to the mockData.js
"no bare Math.random()" rule — that rule protects reload-stable fixtures, this is live ephemeral UI
state) and always carries a visible "Simulated" tag, since the real Battery Status API was removed
from browsers. See `.meta-flag--real` / `--simulated` / `--unavailable` in `ui.css`.

---

## 10. Gotchas

- **Never nest `<Link>` inside `<button>`** (or vice versa). Invalid HTML, and click handling
  breaks unpredictably. Fixed once already in the operator map list — the row is now a flex `<li>`
  containing a `<button>` (select) and a separate `<Link>` (navigate).
- **Leaflet CSS must be imported** before use — done once in `main.jsx`
  (`import "leaflet/dist/leaflet.css"`).
- **Leaflet needs an explicit pixel height** on its container or the map renders 0px tall.
  `SiteMap` takes a `height` prop; keep passing it.
- **Status markers are `L.divIcon` with inline SVG**, in `components/mapIcons.js`. If you change a
  shape in `RiskIcon.jsx`, mirror it there or map and badge will disagree.
- **`chartSetup.js` must be imported** by any file rendering a chart (side-effect import
  registering Chart.js components), else Chart.js throws at runtime.
- Screenshots of long pages taken mid-scroll can show a phantom gap because of `position: sticky`
  headers. That is a capture artifact, not a CSS bug — verify with a tall viewport before "fixing".
- **Geolocation must be triggered by an explicit user action**, never requested on mount — browsers
  discourage silent permission prompts, and it's bad practice regardless.
- **The Network Information API has no permission dialog at all**, unlike geolocation — it's fine
  to read `navigator.connection` passively. It's Chromium/Android-only; there is no polyfill or
  fallback value for Safari/Firefox, only an honest "unavailable" label.
- **The Battery Status API is deprecated and removed from modern browsers.** Any on-screen battery
  reading in this app is simulated — don't try to wire up a real one, and don't drop the
  "Simulated" label if you touch that UI.

---

## 11. Adding a screen

1. Create the component in `src/operator/` or `src/public/`.
2. Register the route in `src/App.jsx` (inside the right layout's `<Route>`).
3. For operator screens, add a nav entry to the `NAV` array in `layouts/OperatorLayout.jsx`;
   for public screens, to `TABS` in `layouts/PublicLayout.jsx`.
4. Pull data from `src/data/mockData.js` — never inline a new fixture in the component.
5. Reuse `Card`, `StatCard`, `StatusBadge`, `Icon`, and the `ui.css` atoms before writing new CSS.
6. Wire `useLanguage()` and translate every user-visible string, both locales.
7. Run `npm run build`, then click the screen in the browser at desktop **and** mobile width.

---

## 12. Conventions

- Match surrounding code style: double quotes, semicolons, 2-space indent, named default exports.
- Comments explain **why**, not what. The existing comments in `riskLevels.js`, `mockData.js`,
  `PublicAuthContext.jsx`, and `ReportsContext.jsx` are load-bearing context — don't strip them.
- Keep components presentational and data flowing down via props; the only contexts are
  `LanguageContext`, `PublicAuthContext`, and `ReportsContext`.
- Indonesian place names and agency names (BNPB, BPBD, BMKG, Puskesmas) are real domain
  vocabulary — don't "correct" them to English.
- Don't commit unless asked. Don't add dependencies without a clear reason.
