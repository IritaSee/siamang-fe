import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SiteMap from "../components/SiteMap";
import MapLegend from "../components/MapLegend";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/Card";
import Icon from "../components/Icon";
import ImpactLegend from "./ImpactLegend";
import { SITES, SITE_SERIES, BASINS, timeAgo } from "../data/mockData";
import { computeImpactFootprint } from "../theme/impactOverlay";
import { useLanguage } from "../i18n/LanguageContext";

const POSITION_LABEL = {
  upstream: { id: "hulu", en: "upstream" },
  midstream: { id: "tengah", en: "midstream" },
  downstream: { id: "hilir", en: "downstream" },
};

export default function OperatorMap() {
  const { locale } = useLanguage();
  const [basin, setBasin] = useState("all");
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("now");

  const sites = useMemo(() => (basin === "all" ? SITES : SITES.filter((s) => s.basin === basin)), [basin]);

  const impactFootprints = useMemo(() => {
    const result = {};
    for (const site of sites) {
      const footprint = computeImpactFootprint(site, SITE_SERIES[site.id], mode);
      if (footprint) result[site.id] = footprint;
    }
    return result;
  }, [sites, mode]);

  return (
    <div className="op-page">
      <div className="op-page-head">
        <div>
          <h1>{locale === "id" ? "Peta / Titik" : "Map / Sites"}</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {sites.length} {locale === "id" ? "titik pemantauan" : "monitoring sites"} {basin !== "all" ? (locale === "id" ? `di ${basin}` : `in ${basin}`) : locale === "id" ? "di seluruh DAS percontohan" : "across all demo watersheds"}
          </p>
        </div>
        <div className="field" style={{ minWidth: 220 }}>
          <label className="field-label">{locale === "id" ? "DAS" : "Watershed"}</label>
          <select className="select" value={basin} onChange={(e) => setBasin(e.target.value)}>
            <option value="all">{locale === "id" ? "Semua DAS" : "All watersheds"}</option>
            {BASINS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="op-map-layout">
        <Card className="op-map-list">
          <div className="op-map-list__legend">
            <MapLegend locale={locale} />
            <ImpactLegend locale={locale} />
            <div className="pill-tabs pill-tabs--ghost" style={{ marginTop: 10 }}>
              <button className={mode === "now" ? "active" : ""} onClick={() => setMode("now")}>
                {locale === "id" ? "Saat Ini" : "Now"}
              </button>
              <button className={mode === "forecast" ? "active" : ""} onClick={() => setMode("forecast")}>
                {locale === "id" ? "Prakiraan" : "Forecast"}
              </button>
            </div>
          </div>
          <ul>
            {sites.map((site) => (
              <li key={site.id} className={`op-map-list__item${selected === site.id ? " active" : ""}`}>
                <button className="op-map-list__item-main" onClick={() => setSelected(site.id)}>
                  <StatusBadge level={site.status} locale={locale} size="sm" />
                  <div className="op-map-list__item-body">
                    <div className="op-map-list__item-name">{site.name}</div>
                    <div className="muted" style={{ fontSize: 11.5, textTransform: "capitalize" }}>
                      {(POSITION_LABEL[site.position] ?? { id: site.position, en: site.position })[locale]} &middot; {timeAgo(site.lastUpdated, locale)}
                    </div>
                  </div>
                </button>
                <Link to={`/operator/sites/${site.id}`} className="op-map-list__item-link" title={locale === "id" ? "Buka detail titik" : "Open site details"}>
                  <Icon name="chevron-right" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <SiteMap
          sites={sites}
          selectedSiteId={selected}
          onSelectSite={setSelected}
          flyToSelected
          height={620}
          locale={locale}
          basemap="terrain"
          impactFootprints={impactFootprints}
          renderPopupAction={(site) => (
            <Link to={`/operator/sites/${site.id}`} className="btn btn-primary btn-sm" style={{ width: "100%" }}>
              {locale === "id" ? "Buka detail titik" : "Open site details"}
            </Link>
          )}
        />
      </div>
    </div>
  );
}
