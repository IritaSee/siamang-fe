import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { WARNINGS, siteById, formatClock, timeAgo } from "../data/mockData";

const SOURCE_LABEL = {
  sensor_threshold: "Data sensor melampaui ambang",
  central_forecast: "Model prakiraan pusat",
  manual: "Pemicu manual oleh operator",
  liveness_monitor: "Monitor keheningan/keaktifan node",
};

const CHANNEL_STATUS_LABEL = {
  confirmed: "terkonfirmasi",
  pending: "menunggu",
  failed: "gagal",
};

const ACTION_LABEL = {
  "Warning triggered by central forecast model": "Peringatan dipicu oleh model prakiraan pusat",
  "Escalated to RED by duty operator": "Dinaikkan ke status AWAS oleh operator jaga",
  "Loudspeaker dissemination confirmed at 2/3 points": "Diseminasi pengeras suara terkonfirmasi di 2/3 titik",
  "Node liveness check failed — no heartbeat for 3+ hours": "Pemeriksaan keaktifan node gagal - tidak ada heartbeat selama 3+ jam",
  "Node liveness check failed — no heartbeat for 2+ hours": "Pemeriksaan keaktifan node gagal - tidak ada heartbeat selama 2+ jam",
  "Water level crossed ALERT threshold (210cm)": "Tinggi muka air melampaui ambang SIAGA (210cm)",
  "Manual confirmation by duty operator": "Konfirmasi manual oleh operator jaga",
  "Water level crossed ALERT threshold (185cm)": "Tinggi muka air melampaui ambang SIAGA (185cm)",
  "Water level crossed WATCH threshold (140cm)": "Tinggi muka air melampaui ambang WASPADA (140cm)",
  "Downgraded — level receded below threshold": "Diturunkan - muka air turun di bawah ambang",
  "Rainfall accumulation crossed WATCH threshold (35mm/3h)": "Akumulasi curah hujan melampaui ambang WASPADA (35mm/3j)",
  "Manually triggered ahead of forecast heavy rain": "Dipicu manual menjelang prakiraan hujan lebat",
  "Cancelled — rain did not materialize": "Dibatalkan - hujan tidak terjadi",
};

const CHANNEL_STATUS_TONE = { confirmed: "green", pending: "yellow", failed: "red" };

export default function WarningDetail() {
  const { warningId } = useParams();
  const warning = WARNINGS.find((w) => w.id === warningId);

  if (!warning) {
    return (
      <div className="op-page">
        <p>Peringatan tidak ditemukan.</p>
        <Link to="/operator/warnings" className="btn btn-outline btn-sm">Kembali ke peringatan</Link>
      </div>
    );
  }

  const site = siteById(warning.siteId);

  return (
    <div className="op-page">
      <div className="op-breadcrumb">
        <Link to="/operator/warnings">Peringatan</Link>
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
            <span className="muted">Dipicu {formatClock(warning.triggeredAt)} UTC &middot; {timeAgo(warning.triggeredAt, "id")}</span>
            <span className={`badge-neutral${warning.resolved ? "" : " badge-neutral--active"}`}>
              {warning.resolved ? `Selesai ${timeAgo(warning.resolvedAt, "id")}` : "Aktif"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge level={warning.status} locale="id" size="lg" />
          <Link to={`/operator/sites/${warning.siteId}`} className="btn btn-outline btn-sm">
            Buka titik
          </Link>
        </div>
      </Card>

      <div className="op-grid-2">
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">Diseminasi</span>
          </div>
          {warning.dissemination.length === 0 ? (
            <div className="empty-state">Tidak ada saluran diseminasi yang dipicu untuk peringatan ini.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Titik</th>
                  <th>Saluran</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {warning.dissemination.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{d.point}</td>
                    <td className="muted">{d.channel}</td>
                    <td>
                      <span className={`badge-neutral badge-neutral--${CHANNEL_STATUS_TONE[d.status]}`}>{CHANNEL_STATUS_LABEL[d.status] ?? d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">Tindakan manual</span>
          </div>
          <ul className="op-timeline">
            {warning.history.map((h, i) => (
              <li key={i}>
                <div className="op-timeline__dot" />
                <div>
                  <div className="op-timeline__action">{ACTION_LABEL[h.action] ?? h.action}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>
                    {h.by === "system" ? "sistem" : h.by} &middot; {formatClock(h.at)} UTC &middot; {timeAgo(h.at, "id")}
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
