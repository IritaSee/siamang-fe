import { RISK_LEVELS, label } from "../theme/riskLevels";
import RiskIcon from "./RiskIcon";
import "./StatusBadge.css";

export default function StatusBadge({ level, locale = "en", size = "md" }) {
  const def = RISK_LEVELS[level];
  if (!def) return null;
  return (
    <span className={`status-badge status-badge--${size}`} style={{ background: def.bg, color: def.color }}>
      <RiskIcon level={level} size={size === "sm" ? 12 : 14} />
      {label(level, locale)}
    </span>
  );
}
