import { INTENSITY_BY_STATUS } from "../data/mockData";

// Illustrative mockup only — see docs/BACKEND.md. A real integration would
// receive actual geometry (GeoJSON polygon/multipolygon, or a raster tile
// URL) per forecast run from the vendor's flood-impact model; this computes
// a soft circular glow from data that already exists in this mockup
// (site status + the existing sensor forecast trend) so the concept can be
// demoed without inventing a parallel fake dataset.
//
// Radii are returned in PIXELS, not meters, and deliberately zoom-independent
// — the map (SiteMap.jsx) swings between zoom 6 (multi-site overview) and
// zoom 12 (after flyToSelected), a 64x pixel-scale range, so a flat meters
// value would be invisible at one end and absurd at the other. SiteMap.jsx
// converts these pixel targets to live meters based on the map's current
// zoom.
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

  const outerPx = (22 + intensity * 55) * multiplier;

  return {
    intensity,
    rings: [
      { radiusPx: outerPx, fillColor: "var(--impact-glow-1)", fillOpacity: 0.1 },
      { radiusPx: outerPx * 0.62, fillColor: "var(--impact-glow-2)", fillOpacity: 0.18 },
      { radiusPx: outerPx * 0.32, fillColor: "var(--impact-glow-3)", fillOpacity: 0.3 },
    ],
  };
}
