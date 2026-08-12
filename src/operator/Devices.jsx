import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { DEVICES, BASINS, SITES, timeAgo } from "../data/mockData";

export default function Devices() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    return DEVICES.filter((d) => (status === "all" ? true : d.status === status)).filter((d) =>
      q.trim() ? (d.serial + d.site + d.type).toLowerCase().includes(q.toLowerCase()) : true
    );
  }, [q, status]);

  return (
    <div className="op-page">
      <div className="op-page-head">
        <div>
          <h1>Devices</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {DEVICES.length} nodes across {SITES.length} sites in {BASINS.length} basins
          </p>
        </div>
      </div>

      <div className="op-toolbar">
        <div className="field" style={{ minWidth: 240 }}>
          <label className="field-label">Search</label>
          <input className="text-input" placeholder="Serial, site, or type..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Status</label>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="green">Normal</option>
            <option value="yellow">Watch</option>
            <option value="orange">Alert</option>
            <option value="red">Danger</option>
            <option value="black">No Signal</option>
          </select>
        </div>
      </div>

      <Card>
        <table className="data-table data-table--clickable">
          <thead>
            <tr>
              <th>Serial</th>
              <th>Site</th>
              <th>Type</th>
              <th>Status</th>
              <th>Last contact</th>
              <th>Battery</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} onClick={() => navigate(`/operator/devices/${d.id}`)}>
                <td style={{ fontWeight: 700 }}>{d.serial}</td>
                <td>{d.site}</td>
                <td className="muted">{d.type}</td>
                <td>
                  <StatusBadge level={d.status} size="sm" />
                </td>
                <td>{timeAgo(d.lastContact)}</td>
                <td>
                  <span className="op-battery">
                    <Icon name="battery" size={14} className={d.battery < 20 ? "op-battery--low" : "muted"} />
                    {d.battery}%
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">No devices match these filters.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
