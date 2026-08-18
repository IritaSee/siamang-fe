import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { useReports } from "../reports/ReportsContext";
import { siteById, formatDateTime } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

export const WORKFLOW_LABEL = {
  new: { id: "Baru", en: "New" },
  reviewed: { id: "Ditinjau", en: "Reviewed" },
  verified: { id: "Terverifikasi", en: "Verified" },
  dismissed: { id: "Ditolak", en: "Dismissed" },
  escalated: { id: "Ditingkatkan", en: "Escalated" },
};
export const WORKFLOW_TONE = { new: "active", reviewed: "", verified: "green", dismissed: "", escalated: "green" };

export default function CitizenReports() {
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const { reports } = useReports();
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return reports
      .filter((r) => (status === "all" ? true : r.workflowStatus === status))
      .filter((r) => {
        if (!q.trim()) return true;
        const haystack = `${r.locationDetail} ${r.description} ${r.reporter?.name ?? ""}`.toLowerCase();
        return haystack.includes(q.toLowerCase());
      });
  }, [reports, status, q]);

  return (
    <div className="op-page">
      <div className="op-page-head">
        <div>
          <h1>{locale === "id" ? "Laporan Warga" : "Citizen Reports"}</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {rows.length} {locale === "id" ? "laporan sesuai filter" : "reports match the filter"}
          </p>
        </div>
      </div>

      <div className="op-toolbar">
        <div className="field" style={{ minWidth: 240 }}>
          <label className="field-label">{locale === "id" ? "Cari" : "Search"}</label>
          <input
            className="text-input"
            placeholder={locale === "id" ? "Lokasi, deskripsi, atau pelapor..." : "Location, description, or reporter..."}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">{locale === "id" ? "Status" : "Status"}</label>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">{locale === "id" ? "Semua status" : "All statuses"}</option>
            {Object.entries(WORKFLOW_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label[locale]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <table className="data-table data-table--clickable">
          <thead>
            <tr>
              <th>{locale === "id" ? "Lokasi" : "Location"}</th>
              <th>{locale === "id" ? "Pelapor" : "Reporter"}</th>
              <th>{locale === "id" ? "Titik terdekat" : "Nearest site"}</th>
              <th>{locale === "id" ? "Status" : "Status"}</th>
              <th>{locale === "id" ? "Terkirim" : "Submitted"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const nearest = r.nearestSiteId ? siteById(r.nearestSiteId) : null;
              return (
                <tr key={r.id} onClick={() => navigate(`/operator/reports/${r.id}`)}>
                  <td style={{ fontWeight: 700, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.locationDetail || (locale === "id" ? "(tidak dijelaskan)" : "(not described)")}
                  </td>
                  <td className="muted">{r.reporter ? r.reporter.name : locale === "id" ? "Anonim" : "Anonymous"}</td>
                  <td className="muted">{nearest ? `${nearest.name} (~${r.nearestSiteDistanceKm} km)` : locale === "id" ? "Tidak ada" : "None"}</td>
                  <td>
                    <span className={`badge-neutral${WORKFLOW_TONE[r.workflowStatus] ? ` badge-neutral--${WORKFLOW_TONE[r.workflowStatus]}` : ""}`}>
                      {WORKFLOW_LABEL[r.workflowStatus]?.[locale] ?? r.workflowStatus}
                    </span>
                  </td>
                  <td>{formatDateTime(r.submittedAt, locale)}</td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">{locale === "id" ? "Tidak ada laporan yang sesuai dengan filter." : "No reports match the filter."}</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
