import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SiteMap from "../components/SiteMap";
import MapLegend from "../components/MapLegend";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/Card";
import Icon from "../components/Icon";
import { SITES, BASINS, timeAgo } from "../data/mockData";

export default function OperatorMap() {
  const [basin, setBasin] = useState("all");
  const [selected, setSelected] = useState(null);

  const sites = useMemo(() => (basin === "all" ? SITES : SITES.filter((s) => s.basin === basin)), [basin]);

  return (
    <div className="op-page">
      <div className="op-page-head">
        <div>
          <h1>Map / Sites</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {sites.length} monitoring sites {basin !== "all" ? `in ${basin}` : "across all pilot basins"}
          </p>
        </div>
        <div className="field" style={{ minWidth: 220 }}>
          <label className="field-label">River basin</label>
          <select className="select" value={basin} onChange={(e) => setBasin(e.target.value)}>
            <option value="all">All basins</option>
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
            <MapLegend />
          </div>
          <ul>
            {sites.map((site) => (
              <li key={site.id} className={`op-map-list__item${selected === site.id ? " active" : ""}`}>
                <button className="op-map-list__item-main" onClick={() => setSelected(site.id)}>
                  <StatusBadge level={site.status} size="sm" />
                  <div className="op-map-list__item-body">
                    <div className="op-map-list__item-name">{site.name}</div>
                    <div className="muted" style={{ fontSize: 11.5, textTransform: "capitalize" }}>
                      {site.position} &middot; {timeAgo(site.lastUpdated)}
                    </div>
                  </div>
                </button>
                <Link to={`/operator/sites/${site.id}`} className="op-map-list__item-link" title="Open site detail">
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
          renderPopupAction={(site) => (
            <Link to={`/operator/sites/${site.id}`} className="btn btn-primary btn-sm" style={{ width: "100%" }}>
              Open site detail
            </Link>
          )}
        />
      </div>
    </div>
  );
}
