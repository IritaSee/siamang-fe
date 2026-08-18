import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { WARNINGS, siteById, formatClock, timeAgo } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

const SOURCE_LABEL = {
  sensor_threshold: { id: "Data sensor melampaui ambang", en: "Sensor data crossed threshold" },
  central_forecast: { id: "Model prakiraan pusat", en: "Central forecast model" },
  manual: { id: "Pemicu manual oleh operator", en: "Manual trigger by operator" },
  liveness_monitor: { id: "Monitor keheningan/keaktifan node", en: "Node liveness monitor" },
  citizen_report: { id: "Berasal dari laporan warga", en: "Originated from a citizen report" },
};

const CHANNEL_STATUS_LABEL = {
  confirmed: { id: "terkonfirmasi", en: "confirmed" },
  pending: { id: "menunggu", en: "pending" },
  failed: { id: "gagal", en: "failed" },
};

const ACTION_LABEL = {
  "Warning triggered by central forecast model": { id: "Peringatan dipicu oleh model prakiraan pusat", en: "Warning triggered by the central forecast model" },
  "Escalated to RED by duty operator": { id: "Dinaikkan ke status AWAS oleh operator jaga", en: "Escalated to RED by the duty operator" },
  "Loudspeaker dissemination confirmed at 2/3 points": { id: "Diseminasi pengeras suara terkonfirmasi di 2/3 titik", en: "Loudspeaker dissemination confirmed at 2/3 points" },
  "Node liveness check failed — no heartbeat for 3+ hours": { id: "Pemeriksaan keaktifan node gagal - tidak ada heartbeat selama 3+ jam", en: "Node liveness check failed - no heartbeat for 3+ hours" },
  "Node liveness check failed — no heartbeat for 2+ hours": { id: "Pemeriksaan keaktifan node gagal - tidak ada heartbeat selama 2+ jam", en: "Node liveness check failed - no heartbeat for 2+ hours" },
  "Water level crossed ALERT threshold (210cm)": { id: "Tinggi muka air melampaui ambang SIAGA (210cm)", en: "Water level crossed ALERT threshold (210 cm)" },
  "Manual confirmation by duty operator": { id: "Konfirmasi manual oleh operator jaga", en: "Manual confirmation by duty operator" },
  "Water level crossed ALERT threshold (185cm)": { id: "Tinggi muka air melampaui ambang SIAGA (185cm)", en: "Water level crossed ALERT threshold (185 cm)" },
  "Water level crossed WATCH threshold (140cm)": { id: "Tinggi muka air melampaui ambang WASPADA (140cm)", en: "Water level crossed WATCH threshold (140 cm)" },
  "Downgraded — level receded below threshold": { id: "Diturunkan - muka air turun di bawah ambang", en: "Downgraded - water level receded below threshold" },
  "Rainfall accumulation crossed WATCH threshold (35mm/3h)": { id: "Akumulasi curah hujan melampaui ambang WASPADA (35mm/3j)", en: "Rainfall accumulation crossed WATCH threshold (35 mm/3h)" },
  "Manually triggered ahead of forecast heavy rain": { id: "Dipicu manual menjelang prakiraan hujan lebat", en: "Manually triggered ahead of forecast heavy rain" },
  "Cancelled — rain did not materialize": { id: "Dibatalkan - hujan tidak terjadi", en: "Cancelled - rain did not materialize" },
  "Citizen report received near SD Negeri 05 Batang Anai": {
    id: "Laporan warga diterima dekat SD Negeri 05 Batang Anai",
    en: "Citizen report received near SD Negeri 05 Batang Anai",
  },
  "Warning created from a citizen report": { id: "Peringatan dibuat dari laporan warga", en: "Warning created from a citizen report" },
};

const CHANNEL_STATUS_TONE = { confirmed: "green", pending: "yellow", failed: "red" };

export default function WarningDetail() {
  const { locale } = useLanguage();
  const { warningId } = useParams();
  const warning = WARNINGS.find((w) => w.id === warningId);

  if (!warning) {
    return (
      <div className="op-page">
        <p>{locale === "id" ? "Peringatan tidak ditemukan." : "Warning not found."}</p>
        <Link to="/operator/warnings" className="btn btn-outline btn-sm">{locale === "id" ? "Kembali ke peringatan" : "Back to warnings"}</Link>
      </div>
    );
  }

  const site = siteById(warning.siteId);

  return (
    <div className="op-page">
      <div className="op-breadcrumb">
        <Link to="/operator/warnings">{locale === "id" ? "Peringatan" : "Warnings"}</Link>
        <Icon name="chevron-right" size={12} />
        <span>{warning.id}</span>
      </div>

      <Card className="op-site-header">
        <div className="op-site-header__left">
          <h1>
            {site?.name} <span className="muted" style={{ fontWeight: 500, fontSize: 15 }}>&middot; {warning.id}</span>
          </h1>
          <div className="op-site-header__meta">
            <span className="muted">{SOURCE_LABEL[warning.source]?.[locale] ?? warning.source}</span>
            {warning.originReportId ? (
              <Link to={`/operator/reports/${warning.originReportId}`} className="muted" style={{ textDecoration: "underline" }}>
                {locale === "id" ? "Lihat laporan asal" : "View originating report"}
              </Link>
            ) : null}
            <span className="muted">{locale === "id" ? "Dipicu" : "Triggered"} {formatClock(warning.triggeredAt)} UTC &middot; {timeAgo(warning.triggeredAt, locale)}</span>
            <span className={`badge-neutral${warning.resolved ? "" : " badge-neutral--active"}`}>
              {warning.resolved ? `${locale === "id" ? "Selesai" : "Resolved"} ${timeAgo(warning.resolvedAt, locale)}` : locale === "id" ? "Aktif" : "Active"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge level={warning.status} locale={locale} size="lg" />
          <Link to={`/operator/sites/${warning.siteId}`} className="btn btn-outline btn-sm">
            {locale === "id" ? "Buka titik" : "Open site"}
          </Link>
        </div>
      </Card>

      <div className="op-grid-2">
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">{locale === "id" ? "Diseminasi" : "Dissemination"}</span>
          </div>
          {warning.dissemination.length === 0 ? (
            <div className="empty-state">{locale === "id" ? "Tidak ada saluran diseminasi yang dipicu untuk peringatan ini." : "No dissemination channels were triggered for this warning."}</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{locale === "id" ? "Titik" : "Point"}</th>
                  <th>{locale === "id" ? "Saluran" : "Channel"}</th>
                  <th>{locale === "id" ? "Status" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {warning.dissemination.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{d.point}</td>
                    <td className="muted">{d.channel}</td>
                    <td>
                      <span className={`badge-neutral badge-neutral--${CHANNEL_STATUS_TONE[d.status]}`}>{CHANNEL_STATUS_LABEL[d.status]?.[locale] ?? d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">{locale === "id" ? "Tindakan manual" : "Manual actions"}</span>
          </div>
          <ul className="op-timeline">
            {warning.history.map((h, i) => (
              <li key={i}>
                <div className="op-timeline__dot" />
                <div>
                  <div className="op-timeline__action">{ACTION_LABEL[h.action]?.[locale] ?? h.action}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>
                    {h.by === "system" ? (locale === "id" ? "sistem" : "system") : h.by} &middot; {formatClock(h.at)} UTC &middot; {timeAgo(h.at, locale)}
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
