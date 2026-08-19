import { INTENSITY_BY_STATUS, SITES, mulberry32, seedFromString } from "../data/mockData";

const POSITION_RANK = { upstream: 0, midstream: 1, downstream: 2 };
const METERS_PER_DEGREE_LAT = 111320;

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
// ever missing. Returned as a plain geographic direction (x=east, y=north,
// both positive-normal) — no screen-space flipping here, since everything
// in this module works in real lat/lng, never pixels.
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
  const dx = (down.lng - up.lng) * Math.cos(avgLatRad); // eastward meters-equivalent
  const dy = down.lat - up.lat; // northward meters-equivalent
  const length = Math.hypot(dx, dy);
  if (length === 0) return null;

  return { x: dx / length, y: dy / length };
}

// Averages each value with its neighbours so a jittered ring of points reads
// as an organic blob outline rather than a jagged star.
function smooth(values) {
  return values.map((v, i) => (values[(i - 1 + values.length) % values.length] + v + values[(i + 1) % values.length]) / 3);
}

// Everything here is computed in real lat/lng degrees, from a real meters
// radius — deliberately NOT a screen-pixel target. An earlier version sized
// this in pixels so it stayed visible across the app's 64x zoom range (zoom
// 6 overview vs zoom 12 site detail), but that made the shape grow on screen
// when zooming OUT and shrink when zooming IN — backwards for something
// meant to represent a real geographic area, which should behave like the
// terrain and markers do: shrink on zoom-out, grow on zoom-in, same as any
// real GIS hazard layer. The trade-off, accepted deliberately: at the zoom
// 6 overview this renders as a barely-visible speck (a few hundred meters to
// ~2km real radius, at ~2.4km/pixel) — that's correct, not a bug. The site
// status markers are already the primary at-a-glance signal at that zoom;
// this overlay's job is to read correctly once you zoom into a site, not to
// be legible from orbit.
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

  const radiusMeters = (300 + intensity * 1700) * multiplier;

  const vertexCount = 14;
  const rand = mulberry32(seedFromString(`${site.id}-impact`));
  const rawJitter = Array.from({ length: vertexCount }, () => 0.85 + rand() * 0.3); // 0.85-1.15
  const jitters = smooth(smooth(rawJitter));

  const flowDir = basinFlowDirection(site);
  const latRad = (site.lat * Math.PI) / 180;
  const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos(latRad);

  const positions = jitters.map((jitter, i) => {
    const angle = (i / vertexCount) * 2 * Math.PI;
    const vx = Math.cos(angle); // east component
    const vy = Math.sin(angle); // north component
    // Vertices pointing toward the flow direction get stretched further
    // out, ones pointing upstream get pulled in — a soft teardrop shape
    // rather than a symmetric blob.
    const alignment = flowDir ? vx * flowDir.x + vy * flowDir.y : 0;
    const elongation = 1 + 0.6 * alignment;
    const r = radiusMeters * jitter * elongation;
    return [site.lat + (r * vy) / METERS_PER_DEGREE_LAT, site.lng + (r * vx) / metersPerDegreeLng];
  });

  return {
    intensity,
    positions,
    fillColor: intensity < 0.4 ? "var(--impact-glow-1)" : intensity < 0.65 ? "var(--impact-glow-2)" : "var(--impact-glow-3)",
    fillOpacity: 0.12 + intensity * 0.22,
    strokeColor: "var(--impact-glow-3)",
    strokeOpacity: 0.45,
  };
}
