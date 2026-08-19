import { INTENSITY_BY_STATUS, SITES, mulberry32, seedFromString } from "../data/mockData";

const POSITION_RANK = { upstream: 0, midstream: 1, downstream: 2 };

// Illustrative mockup only — see docs/BACKEND.md. OpenTopoMap's tiles are a
// rendered image, not queryable terrain, so "flows toward lower elevation"
// uses `SITES[].elevationMeters` — real SRTM data fetched once and baked
// into mockData.js — to find each basin's actual highest/lowest points.
// This deliberately does NOT use the `position` (upstream/midstream/
// downstream) label: five of six basins' labels already agree with real
// elevation, but one site's label disagrees with its real terrain (see the
// comment on SITES in mockData.js) — trusting elevation over the label
// self-corrects that case without moving any coordinates other features
// already depend on. Falls back to the position label only if elevation is
// ever missing.
function basinFlowDirection(site) {
  const basinSites = SITES.filter((s) => s.basin === site.basin);
  const hasElevation = basinSites.every((s) => typeof s.elevationMeters === "number");
  const rankOf = (s) => (hasElevation ? -s.elevationMeters : POSITION_RANK[s.position]);

  let up = basinSites[0];
  let down = basinSites[0];
  for (const s of basinSites) {
    if (rankOf(s) < rankOf(up)) up = s;
    if (rankOf(s) > rankOf(down)) down = s;
  }
  if (up === down) return null; // basin has only one distinct point — no direction to derive

  const avgLatRad = ((up.lat + down.lat) / 2) * (Math.PI / 180);
  const dx = (down.lng - up.lng) * Math.cos(avgLatRad); // eastward component
  const dy = down.lat - up.lat; // northward component
  const length = Math.hypot(dx, dy);
  if (length === 0) return null;

  // Screen-space direction (x right, y down — flip the northward component
  // since geographic north is "up"/negative-y on an unrotated Leaflet map).
  return { x: dx / length, y: -dy / length };
}

// Averages each value with its neighbours so a jittered ring of points reads
// as an organic blob outline rather than a jagged star.
function smooth(values) {
  return values.map((v, i) => (values[(i - 1 + values.length) % values.length] + v + values[(i + 1) % values.length]) / 3);
}

// Radii/positions are computed in PIXELS, not meters, and deliberately
// zoom-independent — the map (SiteMap.jsx) swings between zoom 6 (multi-site
// overview) and zoom 12 (after flyToSelected), a 64x pixel-scale range, so a
// flat meters value would be invisible at one end and absurd at the other.
// SiteMap.jsx converts these pixel targets to screen positions based on the
// map's current zoom.
export function computeImpactFootprint(site, seriesForSite, mode = "now") {
  // A silent sensor can't feed a confident prediction — don't extrapolate
  // one. Same principle as AGENTS.md §5's "black is unknown, not severe."
  if (site.status === "black") return null;

  const intensity = INTENSITY_BY_STATUS[site.status] ?? 0.1;

  let multiplier = 1;
  if (mode === "forecast" && seriesForSite?.forecast?.length) {
    const first = seriesForSite.forecast[0].waterLevel;
    const last = seriesForSite.forecast[seriesForSite.forecast.length - 1].waterLevel;
    const delta = last - first;
    // Same rising/stable/falling thresholds PublicHome.jsx already uses for trendLabel().
    multiplier = delta > 4 ? 1.35 : delta < -4 ? 0.85 : 1.05;
  }

  const radiusPx = (22 + intensity * 55) * multiplier;

  const vertexCount = 14;
  const rand = mulberry32(seedFromString(`${site.id}-impact`));
  const rawJitter = Array.from({ length: vertexCount }, () => 0.85 + rand() * 0.3); // 0.85-1.15
  const jitters = smooth(smooth(rawJitter));

  return {
    intensity,
    vertexCount,
    radiusPx,
    jitters,
    // Direction this site's basin flows downstream, in screen-space units —
    // null if it couldn't be derived, in which case the polygon renders as a
    // plain organic blob with no directional bias.
    flowDir: basinFlowDirection(site),
    fillColor: intensity < 0.4 ? "var(--impact-glow-1)" : intensity < 0.65 ? "var(--impact-glow-2)" : "var(--impact-glow-3)",
    fillOpacity: 0.12 + intensity * 0.22,
    strokeColor: "var(--impact-glow-3)",
    strokeOpacity: 0.45,
  };
}
