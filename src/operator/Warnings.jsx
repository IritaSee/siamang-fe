import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import { WARNINGS, siteById, timeAgo, formatClock } from "../data/mockData";

const SOURCE_LABEL = {
  sensor_threshold: "Sensor threshold",
  central_forecast: "Central forecast",
  manual: "Manual",
  liveness_monitor: "Liveness monitor",
};

export default function Warnings() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("all");
  const [resolved, setResolved] = useState("active");

  const rows = useMemo(() => {
    return WARNINGS.filter((w) => (status === "all" ? true : w.status === status)).filter((w) => {
      if (resolved === "all") return true;
      if (resolved === "active") return !w.resolved;
      return w.resolved;
    });
  }, [status, resolved]);

  return (
    <div className="op-page">
      <div className="op-page-head">
        <div>
          <h1>Warnings</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {rows.length} warning{rows.length === 1 ? "" : "s"} matching filters
          </p>
        </div>
      </div>

      <div className="op-toolbar">
        <div className="field">
          <label className="field-label">Status</label>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="red">Danger</option>
            <option value="orange">Alert</option>
            <option value="yellow">Watch</option>
            <option value="black">No Signal</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">State</label>
          <select className="select" value={resolved} onChange={(e) => setResolved(e.target.value)}>
            <option value="active">Active only</option>
            <option value="resolved">Resolved only</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <Card>
        <table className="data-table data-table--clickable">
          <thead>
            <tr>
              <th>Site</th>
              <th>Status</th>
              <th>Source</th>
              <th>Triggered</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => {
              const site = siteById(w.siteId);
              return (
                <tr key={w.id} onClick={() => navigate(`/operator/warnings/${w.id}`)}>
                  <td style={{ fontWeight: 700 }}>{site?.name}</td>
                  <td>
                    <StatusBadge level={w.status} size="sm" />
                  </td>
                  <td className="muted">{SOURCE_LABEL[w.source]}</td>
                  <td>
                    {formatClock(w.triggeredAt)} UTC <span className="muted">&middot; {timeAgo(w.triggeredAt)}</span>
                  </td>
                  <td>
                    <span className={`badge-neutral${w.resolved ? "" : " badge-neutral--active"}`}>
                      {w.resolved ? "Resolved" : "Active"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">No warnings match these filters.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
