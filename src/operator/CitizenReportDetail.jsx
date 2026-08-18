import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import Icon from "../components/Icon";
import SiteMap from "../components/SiteMap";
import { useReports } from "../reports/ReportsContext";
import { useLanguage } from "../i18n/LanguageContext";
import { siteById, formatDateTime } from "../data/mockData";
import { WORKFLOW_LABEL, WORKFLOW_TONE } from "./CitizenReports";

const GEO_STATUS_LABEL = {
  denied: { id: "Ditolak pengguna", en: "Denied by user" },
  unavailable: { id: "Tidak didukung perangkat", en: "Not supported on device" },
  not_requested: { id: "Tidak diminta", en: "Not requested" },
};

const ACTIONS = [
  { key: "verify", status: "verified", label: { id: "Verifikasi", en: "Verify" }, icon: "check", cls: "btn-outline" },
  { key: "escalate", status: "escalated", label: { id: "Naikkan ke peringatan", en: "Escalate to warning" }, icon: "arrow-right", cls: "btn-danger" },
  { key: "dismiss", status: "dismissed", label: { id: "Tolak", en: "Dismiss" }, icon: "x", cls: "btn-ghost" },
];

export default function CitizenReportDetail() {
  const { locale } = useLanguage();
  const { reportId } = useParams();
  const { reportById, updateReportStatus } = useReports();
  const [actionMsg, setActionMsg] = useState(null);

  const report = reportById(reportId);

  if (!report) {
    return (
      <div className="op-page">
        <p>{locale === "id" ? "Laporan tidak ditemukan." : "Report not found."}</p>
        <Link to="/operator/reports" className="btn btn-outline btn-sm">
          {locale === "id" ? "Kembali ke laporan" : "Back to reports"}
        </Link>
      </div>
    );
  }

  const nearestSiteObj = report.nearestSiteId ? siteById(report.nearestSiteId) : null;
  const { geolocation, connection, battery } = report.deviceMeta;

  function runAction(action) {
    // Escalate does NOT create a live WARNINGS entry — matching SiteDetail.jsx's
    // existing mock-action pattern exactly, where the site-level warning actions
    // are also toast-only. Only the pre-seeded cr-05 -> w-09 pair demonstrates the
    // fully-wired outcome, deliberately, rather than every escalation doing a
    // live cross-entity write.
    updateReportStatus(report.id, action.status, { reviewedBy: "Putri Wulandari (BNPB Pusat)" });
    setActionMsg(
      `${action.label[locale]} ${locale === "id" ? "tercatat" : "recorded"} - ${new Date().toLocaleTimeString(locale === "id" ? "id-ID" : "en-GB")}`
    );
    setTimeout(() => setActionMsg(null), 3500);
  }

  return (
    <div className="op-page">
      <div className="op-breadcrumb">
        <Link to="/operator/reports">{locale === "id" ? "Laporan Warga" : "Citizen Reports"}</Link>
        <Icon name="chevron-right" size={12} />
        <span>{report.id}</span>
      </div>

      <Card className="op-site-header">
        <div className="op-site-header__left">
          <h1>{report.locationDetail || (locale === "id" ? "Lokasi tidak dijelaskan" : "Location not described")}</h1>
          <div className="op-site-header__meta">
            <span className="badge-neutral">
              <Icon name="users" size={12} /> {report.reporter ? report.reporter.name : locale === "id" ? "Pelapor anonim" : "Anonymous reporter"}
            </span>
            <span className="muted">
              {locale === "id" ? "Terkirim" : "Submitted"} {formatDateTime(report.submittedAt, locale)} UTC
            </span>
          </div>
        </div>
        <span className={`badge-neutral${WORKFLOW_TONE[report.workflowStatus] ? ` badge-neutral--${WORKFLOW_TONE[report.workflowStatus]}` : ""}`}>
          {WORKFLOW_LABEL[report.workflowStatus]?.[locale] ?? report.workflowStatus}
        </span>
      </Card>

      {!nearestSiteObj ? (
        <div className="op-inline-notice">
          <Icon name="map-pin" size={16} />{" "}
          {locale === "id"
            ? "Tidak ada titik pemantauan dekat lokasi ini - laporan ini mungkin menandakan celah cakupan pemantauan."
            : "No monitoring site is near this location - this report may indicate a monitoring coverage gap."}
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
            <span className="section-title">{locale === "id" ? "Deskripsi" : "Description"}</span>
          </div>
          <p style={{ padding: "0 0 18px", fontSize: 13.5, lineHeight: 1.6 }}>{report.description}</p>
        </Card>

        <Card className="op-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="section-header" style={{ padding: "18px 18px 0" }}>
            <span className="section-title">{locale === "id" ? "Lokasi" : "Location"}</span>
          </div>
          <div style={{ padding: 18 }}>
            {nearestSiteObj ? (
              <>
                <div className="muted" style={{ fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
                  {locale === "id"
                    ? "Titik pemantauan terdekat (referensi saja, bukan lokasi laporan yang tepat)"
                    : "Closest known monitoring site (reference only, not the exact reported location)"}
                  : {nearestSiteObj.name} (~{report.nearestSiteDistanceKm} km)
                </div>
                <SiteMap sites={[nearestSiteObj]} selectedSiteId={nearestSiteObj.id} height={200} center={[nearestSiteObj.lat, nearestSiteObj.lng]} zoom={11} locale={locale} />
              </>
            ) : (
              <div className="empty-state">{locale === "id" ? "Tidak ada titik pemantauan di dekat lokasi ini." : "No monitoring site is near this location."}</div>
            )}
          </div>
        </Card>
      </div>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">{locale === "id" ? "Foto" : "Photos"}</span>
        </div>
        {report.photos.length === 0 ? (
          <div className="empty-state">{locale === "id" ? "Tidak ada foto dilampirkan." : "No photos attached."}</div>
        ) : (
          <div className="op-photo-grid">
            {report.photos.map((p) => (
              <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="op-photo-thumb">
                <img src={p.url} alt="" />
              </a>
            ))}
          </div>
        )}
      </Card>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">{locale === "id" ? "Metadata perangkat" : "Device metadata"}</span>
          <span className="muted" style={{ fontSize: 12 }}>
            {locale === "id" ? "Konteks keandalan, bukan indikator tingkat bahaya" : "Reliability context, not a severity signal"}
          </span>
        </div>
        <div className="op-kv-grid">
          <div>
            <div className="field-label">{locale === "id" ? "Lokasi GPS" : "GPS location"}</div>
            <div>
              {geolocation.status === "granted"
                ? `${geolocation.lat.toFixed(4)}, ${geolocation.lng.toFixed(4)} (±${geolocation.accuracyMeters}m)`
                : GEO_STATUS_LABEL[geolocation.status]?.[locale] ?? geolocation.status}
            </div>
            <span className={`meta-flag meta-flag--${geolocation.status === "granted" ? "real" : "unavailable"}`} style={{ marginTop: 6 }}>
              {geolocation.status === "granted" ? (locale === "id" ? "Asli" : "Real") : locale === "id" ? "Tidak tersedia" : "Unavailable"}
            </span>
          </div>
          <div>
            <div className="field-label">{locale === "id" ? "Koneksi" : "Connection"}</div>
            <div>
              {connection.supported
                ? `${connection.effectiveType?.toUpperCase()} · ${connection.downlinkMbps} Mbps${connection.saveData ? ` · ${locale === "id" ? "hemat data" : "data saver"}` : ""}`
                : locale === "id"
                  ? "Tidak tersedia"
                  : "Not available"}
            </div>
            <span className={`meta-flag meta-flag--${connection.supported ? "real" : "unavailable"}`} style={{ marginTop: 6 }}>
              {connection.supported ? (locale === "id" ? "Asli" : "Real") : locale === "id" ? "Tidak tersedia" : "Unavailable"}
            </span>
          </div>
          <div>
            <div className="field-label">{locale === "id" ? "Baterai" : "Battery"}</div>
            <div>{battery.levelPercent != null ? `${battery.levelPercent}%` : "–"}</div>
            <span className="meta-flag meta-flag--simulated" style={{ marginTop: 6 }}>
              {locale === "id" ? "Simulasi" : "Simulated"}
            </span>
          </div>
        </div>
      </Card>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">{locale === "id" ? "Tindakan triase" : "Triage actions"}</span>
          {report.escalatedWarningId ? (
            <Link to={`/operator/warnings/${report.escalatedWarningId}`} className="btn btn-outline btn-sm">
              {locale === "id" ? "Lihat peringatan" : "View warning"} <Icon name="arrow-right" size={13} />
            </Link>
          ) : null}
        </div>
        <div className="op-action-row">
          {ACTIONS.map((a) => (
            <button key={a.key} className={`btn ${a.cls}`} onClick={() => runAction(a)}>
              <Icon name={a.icon} size={15} /> {a.label[locale]}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
