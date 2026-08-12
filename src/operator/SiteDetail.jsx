import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import SensorChart from "../components/SensorChart";
import SiteMap from "../components/SiteMap";
import { siteById, SITE_SERIES, devicesForSite, warningsForSite, timeAgo, formatClock } from "../data/mockData";

const ACTIONS = [
  { key: "trigger", label: "Trigger", icon: "siren", cls: "btn-danger" },
  { key: "escalate", label: "Escalate", icon: "arrow-right", cls: "btn-outline" },
  { key: "downgrade", label: "Downgrade", icon: "arrow-left", cls: "btn-outline" },
  { key: "cancel", label: "Cancel warning", icon: "x", cls: "btn-ghost" },
];

export default function SiteDetail() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const site = siteById(siteId);
  const [actionMsg, setActionMsg] = useState(null);

  if (!site) {
    return (
      <div className="op-page">
        <p>Site not found.</p>
        <Link to="/operator/map" className="btn btn-outline btn-sm">Back to map</Link>
      </div>
    );
  }

  const series = SITE_SERIES[site.id];
  const devices = devicesForSite(site.id);
  const history = warningsForSite(site.id);

  function runAction(action) {
    setActionMsg(`${action.label} action recorded (mock) — ${new Date().toLocaleTimeString()}`);
    setTimeout(() => setActionMsg(null), 3500);
  }

  return (
    <div className="op-page">
      <div className="op-breadcrumb">
        <Link to="/operator/map">Map / Sites</Link>
        <Icon name="chevron-right" size={12} />
        <span>{site.name}</span>
      </div>

      <Card className="op-site-header">
        <div className="op-site-header__left">
          <h1>{site.name}</h1>
          <div className="op-site-header__meta">
            <span className="badge-neutral" style={{ textTransform: "capitalize" }}>
              <Icon name="layers" size={12} /> {site.position}
            </span>
            <span className="muted">{site.basin} basin</span>
            <span className="muted">{site.province}</span>
            <span className="muted">Updated {timeAgo(site.lastUpdated)}</span>
          </div>
        </div>
        <StatusBadge level={site.status} size="lg" />
      </Card>

      {site.status === "black" ? (
        <div className="op-inline-notice">
          <Icon name="wifi-off" size={16} /> This site has gone silent — treat as unknown, not confirmed severe. Dispatch a field
          check and inspect node power/connectivity in Devices.
        </div>
      ) : null}

      {actionMsg ? (
        <div className="op-inline-notice op-inline-notice--success">
          <Icon name="check" size={16} /> {actionMsg}
        </div>
      ) : null}

      <div className="op-grid-2">
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">Sensor readings</span>
          </div>
          <SensorChart series={series} />
        </Card>

        <Card className="op-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="section-header" style={{ padding: "18px 18px 0" }}>
            <span className="section-title">Location</span>
          </div>
          <div style={{ padding: 18 }}>
            <SiteMap sites={[site]} selectedSiteId={site.id} height={260} center={[site.lat, site.lng]} zoom={11} />
          </div>
        </Card>
      </div>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">Warning actions</span>
          <span className="muted" style={{ fontSize: 12 }}>Manual override — logged to warning history</span>
        </div>
        <div className="op-action-row">
          {ACTIONS.map((a) => (
            <button key={a.key} className={`btn ${a.cls}`} onClick={() => runAction(a)}>
              <Icon name={a.icon} size={15} /> {a.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">Nodes at this site</span>
        </div>
        <table className="data-table data-table--clickable">
          <thead>
            <tr>
              <th>Serial</th>
              <th>Type</th>
              <th>Status</th>
              <th>Last contact</th>
              <th>Battery</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id} onClick={() => navigate(`/operator/devices/${d.id}`)}>
                <td style={{ fontWeight: 700 }}>{d.serial}</td>
                <td>{d.type}</td>
                <td>
                  <StatusBadge level={d.status} size="sm" />
                </td>
                <td>{timeAgo(d.lastContact)}</td>
                <td>{d.battery}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">Warning history</span>
        </div>
        {history.length === 0 ? (
          <div className="empty-state">No warnings recorded for this site.</div>
        ) : (
          <ul className="op-warning-list">
            {history.map((w) => (
              <li key={w.id}>
                <Link to={`/operator/warnings/${w.id}`} className="op-warning-row">
                  <StatusBadge level={w.status} size="sm" />
                  <div className="op-warning-row__body">
                    <div className="op-warning-row__site">
                      {w.source.replace("_", " ")} {w.resolved ? "· resolved" : "· active"}
                    </div>
                    <div className="muted" style={{ fontSize: 11.5 }}>
                      Triggered {formatClock(w.triggeredAt)} UTC &middot; {timeAgo(w.triggeredAt)}
                    </div>
                  </div>
                  <Icon name="chevron-right" size={16} className="muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
