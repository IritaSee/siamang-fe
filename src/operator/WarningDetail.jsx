import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { WARNINGS, siteById, formatClock, timeAgo } from "../data/mockData";

const SOURCE_LABEL = {
  sensor_threshold: "Sensor data crossed threshold",
  central_forecast: "Central forecast model",
  manual: "Manual trigger by operator",
  liveness_monitor: "Node-silence / liveness monitor",
};

const CHANNEL_STATUS_TONE = { confirmed: "green", pending: "yellow", failed: "red" };

export default function WarningDetail() {
  const { warningId } = useParams();
  const warning = WARNINGS.find((w) => w.id === warningId);

  if (!warning) {
    return (
      <div className="op-page">
        <p>Warning not found.</p>
        <Link to="/operator/warnings" className="btn btn-outline btn-sm">Back to warnings</Link>
      </div>
    );
  }

  const site = siteById(warning.siteId);

  return (
    <div className="op-page">
      <div className="op-breadcrumb">
        <Link to="/operator/warnings">Warnings</Link>
        <Icon name="chevron-right" size={12} />
        <span>{warning.id}</span>
      </div>

      <Card className="op-site-header">
        <div className="op-site-header__left">
          <h1>
            {site?.name} <span className="muted" style={{ fontWeight: 500, fontSize: 15 }}>&middot; {warning.id}</span>
          </h1>
          <div className="op-site-header__meta">
            <span className="muted">{SOURCE_LABEL[warning.source]}</span>
            <span className="muted">Triggered {formatClock(warning.triggeredAt)} UTC &middot; {timeAgo(warning.triggeredAt)}</span>
            <span className={`badge-neutral${warning.resolved ? "" : " badge-neutral--active"}`}>
              {warning.resolved ? `Resolved ${timeAgo(warning.resolvedAt)}` : "Active"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge level={warning.status} size="lg" />
          <Link to={`/operator/sites/${warning.siteId}`} className="btn btn-outline btn-sm">
            Open site
          </Link>
        </div>
      </Card>

      <div className="op-grid-2">
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">Dissemination</span>
          </div>
          {warning.dissemination.length === 0 ? (
            <div className="empty-state">No dissemination channels were triggered for this warning.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Point</th>
                  <th>Channel</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {warning.dissemination.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{d.point}</td>
                    <td className="muted">{d.channel}</td>
                    <td>
                      <span className={`badge-neutral badge-neutral--${CHANNEL_STATUS_TONE[d.status]}`}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">Manual actions taken</span>
          </div>
          <ul className="op-timeline">
            {warning.history.map((h, i) => (
              <li key={i}>
                <div className="op-timeline__dot" />
                <div>
                  <div className="op-timeline__action">{h.action}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>
                    {h.by} &middot; {formatClock(h.at)} UTC &middot; {timeAgo(h.at)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
