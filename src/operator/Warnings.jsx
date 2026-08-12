import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import { WARNINGS, siteById, timeAgo, formatClock } from "../data/mockData";

const SOURCE_LABEL = {
  sensor_threshold: "Ambang sensor",
  central_forecast: "Prakiraan pusat",
  manual: "Manual",
  liveness_monitor: "Monitor keaktifan",
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
          <h1>Peringatan</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {rows.length} peringatan sesuai filter
          </p>
        </div>
      </div>

      <div className="op-toolbar">
        <div className="field">
          <label className="field-label">Status</label>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Semua status</option>
            <option value="red">Awas</option>
            <option value="orange">Siaga</option>
            <option value="yellow">Waspada</option>
            <option value="black">Tidak Ada Sinyal</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Kondisi</label>
          <select className="select" value={resolved} onChange={(e) => setResolved(e.target.value)}>
            <option value="active">Hanya aktif</option>
            <option value="resolved">Hanya selesai</option>
            <option value="all">Semua</option>
          </select>
        </div>
      </div>

      <Card>
        <table className="data-table data-table--clickable">
          <thead>
            <tr>
              <th>Titik</th>
              <th>Status</th>
              <th>Sumber</th>
              <th>Dipicu</th>
              <th>Kondisi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => {
              const site = siteById(w.siteId);
              return (
                <tr key={w.id} onClick={() => navigate(`/operator/warnings/${w.id}`)}>
                  <td style={{ fontWeight: 700 }}>{site?.name}</td>
                  <td>
                    <StatusBadge level={w.status} locale="id" size="sm" />
                  </td>
                  <td className="muted">{SOURCE_LABEL[w.source]}</td>
                  <td>
                    {formatClock(w.triggeredAt)} UTC <span className="muted">&middot; {timeAgo(w.triggeredAt, "id")}</span>
                  </td>
                  <td>
                    <span className={`badge-neutral${w.resolved ? "" : " badge-neutral--active"}`}>
                      {w.resolved ? "Selesai" : "Aktif"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">Tidak ada peringatan yang sesuai dengan filter.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
