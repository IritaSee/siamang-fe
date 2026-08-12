// Central definition of the five-status risk system. `black` is deliberately
// not "worse than red" — it means a node/site has gone silent (unknown state),
// so it always renders with its own icon language and is kept out of severity
// sorts that rank flood danger low -> high.
export const RISK_LEVELS = {
  green: {
    value: "green",
    en: "Normal",
    id: "Aman",
    color: "var(--risk-green)",
    bg: "var(--risk-green-bg)",
    shape: "circle",
  },
  yellow: {
    value: "yellow",
    en: "Watch",
    id: "Waspada",
    color: "var(--risk-yellow)",
    bg: "var(--risk-yellow-bg)",
    shape: "triangle",
  },
  orange: {
    value: "orange",
    en: "Alert",
    id: "Siaga",
    color: "var(--risk-orange)",
    bg: "var(--risk-orange-bg)",
    shape: "triangle-heavy",
  },
  red: {
    value: "red",
    en: "Danger",
    id: "Awas",
    color: "var(--risk-red)",
    bg: "var(--risk-red-bg)",
    shape: "diamond",
  },
  black: {
    value: "black",
    en: "No Signal",
    id: "Tidak Ada Sinyal",
    color: "var(--risk-black)",
    bg: "var(--risk-black-bg)",
    shape: "no-signal",
  },
};

// Flood-severity ranking only — `black` is intentionally excluded, it is not
// a point on this scale.
export const FLOOD_SEVERITY_ORDER = ["red", "orange", "yellow", "green"];

export function sortBySeverity(items, getLevel) {
  return [...items].sort((a, b) => {
    const la = getLevel(a);
    const lb = getLevel(b);
    const ia = FLOOD_SEVERITY_ORDER.indexOf(la);
    const ib = FLOOD_SEVERITY_ORDER.indexOf(lb);
    // black / unknown sinks to the end of a severity-sorted list
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

export function label(level, locale = "en") {
  const l = RISK_LEVELS[level];
  if (!l) return level;
  return locale === "id" ? l.id : l.en;
}
