import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import { WARNINGS, siteById, timeAgo, formatClock } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

const SOURCE_LABEL = {
  sensor_threshold: { id: "Ambang sensor", en: "Sensor threshold" },
  central_forecast: { id: "Prakiraan pusat", en: "Central forecast" },
  manual: { id: "Manual", en: "Manual" },
  liveness_monitor: { id: "Monitor keaktifan", en: "Liveness monitor" },
};

export default function Warnings() {
  const { locale } = useLanguage();
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
          <h1>{locale === "id" ? "Peringatan" : "Warnings"}</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {rows.length} {locale === "id" ? "peringatan sesuai filter" : "warnings match the filter"}
          </p>
        </div>
      </div>

      <div className="op-toolbar">
        <div className="field">
          <label className="field-label">{locale === "id" ? "Status" : "Status"}</label>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">{locale === "id" ? "Semua status" : "All statuses"}</option>
            <option value="red">{locale === "id" ? "Awas" : "Danger"}</option>
            <option value="orange">{locale === "id" ? "Siaga" : "Alert"}</option>
            <option value="yellow">{locale === "id" ? "Waspada" : "Watch"}</option>
            <option value="black">{locale === "id" ? "Tidak Ada Sinyal" : "No Signal"}</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">{locale === "id" ? "Kondisi" : "State"}</label>
          <select className="select" value={resolved} onChange={(e) => setResolved(e.target.value)}>
            <option value="active">{locale === "id" ? "Hanya aktif" : "Active only"}</option>
            <option value="resolved">{locale === "id" ? "Hanya selesai" : "Resolved only"}</option>
            <option value="all">{locale === "id" ? "Semua" : "All"}</option>
          </select>
        </div>
      </div>

      <Card>
        <table className="data-table data-table--clickable">
          <thead>
            <tr>
              <th>{locale === "id" ? "Titik" : "Site"}</th>
              <th>{locale === "id" ? "Status" : "Status"}</th>
              <th>{locale === "id" ? "Sumber" : "Source"}</th>
              <th>{locale === "id" ? "Dipicu" : "Triggered"}</th>
              <th>{locale === "id" ? "Kondisi" : "State"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => {
              const site = siteById(w.siteId);
              return (
                <tr key={w.id} onClick={() => navigate(`/operator/warnings/${w.id}`)}>
                  <td style={{ fontWeight: 700 }}>{site?.name}</td>
                  <td>
                      <StatusBadge level={w.status} locale={locale} size="sm" />
                  </td>
                    <td className="muted">{SOURCE_LABEL[w.source]?.[locale] ?? w.source}</td>
                  <td>
                      {formatClock(w.triggeredAt)} UTC <span className="muted">&middot; {timeAgo(w.triggeredAt, locale)}</span>
                  </td>
                  <td>
                    <span className={`badge-neutral${w.resolved ? "" : " badge-neutral--active"}`}>
                        {w.resolved ? (locale === "id" ? "Selesai" : "Resolved") : (locale === "id" ? "Aktif" : "Active")}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">{locale === "id" ? "Tidak ada peringatan yang sesuai dengan filter." : "No warnings match the filter."}</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
