import { RISK_LEVELS } from "../theme/riskLevels";
import RiskIcon from "./RiskIcon";

export default function MapLegend({ locale = "en" }) {
  return (
    <div className="map-legend">
      {Object.values(RISK_LEVELS).map((l) => (
        <span className="map-legend__item" key={l.value}>
          <RiskIcon level={l.value} size={14} />
          {locale === "id" ? l.id : l.en}
        </span>
      ))}
    </div>
  );
}
