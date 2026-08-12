import L from "leaflet";
import { RISK_LEVELS } from "../theme/riskLevels";

// Mirrors the shapes in RiskIcon.jsx so the same status vocabulary shows up
// on map markers, not just in table badges.
const GLYPHS = {
  green: '<circle cx="12" cy="12" r="7" fill="white"/>',
  yellow: '<path d="M12 5 19.5 18h-15L12 5z" fill="white"/>',
  orange: '<path d="M12 4 21 18.5H3L12 4z" fill="white"/>',
  red: '<rect x="7" y="7" width="10" height="10" rx="1.5" fill="white" transform="rotate(45 12 12)"/>',
  black: '<circle cx="12" cy="12" r="7" fill="none" stroke="#111827" stroke-width="1.6" stroke-dasharray="2 2"/><path d="M8 8l8 8" stroke="#111827" stroke-width="1.8" stroke-linecap="round"/>',
};

export function riskDivIcon(level, { size = 30, selected = false } = {}) {
  const def = RISK_LEVELS[level] || RISK_LEVELS.green;
  const isBlack = level === "black";
  const bg = isBlack ? "#ffffff" : def.color;
  const border = isBlack ? "3px dashed #111827" : "3px solid #ffffff";
  const ring = selected ? "0 0 0 4px rgba(15,76,129,0.28), " : "";
  const html = `
    <div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:${border};
      box-shadow:${ring}0 3px 8px rgba(16,21,29,0.35);display:flex;align-items:center;justify-content:center;">
      <svg width="${Math.round(size * 0.56)}" height="${Math.round(size * 0.56)}" viewBox="0 0 24 24">${GLYPHS[level] || GLYPHS.green}</svg>
    </div>`;
  return L.divIcon({
    html,
    className: "risk-div-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}
