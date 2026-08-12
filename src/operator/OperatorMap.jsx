import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SiteMap from "../components/SiteMap";
import MapLegend from "../components/MapLegend";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/Card";
import Icon from "../components/Icon";
import { SITES, BASINS, timeAgo } from "../data/mockData";

const POSITION_LABEL = {
  upstream: "hulu",
  midstream: "tengah",
  downstream: "hilir",
};

export default function OperatorMap() {
  const [basin, setBasin] = useState("all");
  const [selected, setSelected] = useState(null);

  const sites = useMemo(() => (basin === "all" ? SITES : SITES.filter((s) => s.basin === basin)), [basin]);

  return (
    <div className="op-page">
      <div className="op-page-head">
        <div>
          <h1>Peta / Titik</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {sites.length} titik pemantauan {basin !== "all" ? `di ${basin}` : "di seluruh DAS percontohan"}
          </p>
        </div>
        <div className="field" style={{ minWidth: 220 }}>
          <label className="field-label">DAS</label>
          <select className="select" value={basin} onChange={(e) => setBasin(e.target.value)}>
            <option value="all">Semua DAS</option>
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
            <MapLegend locale="id" />
          </div>
          <ul>
            {sites.map((site) => (
              <li key={site.id} className={`op-map-list__item${selected === site.id ? " active" : ""}`}>
                <button className="op-map-list__item-main" onClick={() => setSelected(site.id)}>
                  <StatusBadge level={site.status} locale="id" size="sm" />
                  <div className="op-map-list__item-body">
                    <div className="op-map-list__item-name">{site.name}</div>
                    <div className="muted" style={{ fontSize: 11.5, textTransform: "capitalize" }}>
                      {POSITION_LABEL[site.position] ?? site.position} &middot; {timeAgo(site.lastUpdated, "id")}
                    </div>
                  </div>
                </button>
                <Link to={`/operator/sites/${site.id}`} className="op-map-list__item-link" title="Buka detail titik">
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
          locale="id"
          renderPopupAction={(site) => (
            <Link to={`/operator/sites/${site.id}`} className="btn btn-primary btn-sm" style={{ width: "100%" }}>
              Buka detail titik
            </Link>
          )}
        />
      </div>
    </div>
  );
}
