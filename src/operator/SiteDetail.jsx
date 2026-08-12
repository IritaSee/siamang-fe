import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import SensorChart from "../components/SensorChart";
import SiteMap from "../components/SiteMap";
import { siteById, SITE_SERIES, devicesForSite, warningsForSite, timeAgo, formatClock } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

const POSITION_LABEL = {
  upstream: { id: "hulu", en: "upstream" },
  midstream: { id: "tengah", en: "midstream" },
  downstream: { id: "hilir", en: "downstream" },
};

const SOURCE_LABEL = {
  sensor_threshold: { id: "Ambang sensor", en: "Sensor threshold" },
  central_forecast: { id: "Prakiraan pusat", en: "Central forecast" },
  manual: { id: "Manual", en: "Manual" },
  liveness_monitor: { id: "Monitor keaktifan node", en: "Node liveness monitor" },
};

const ACTIONS = [
  { key: "trigger", label: { id: "Picu", en: "Trigger" }, icon: "siren", cls: "btn-danger" },
  { key: "escalate", label: { id: "Naikkan tingkat", en: "Escalate" }, icon: "arrow-right", cls: "btn-outline" },
  { key: "downgrade", label: { id: "Turunkan tingkat", en: "Downgrade" }, icon: "arrow-left", cls: "btn-outline" },
  { key: "cancel", label: { id: "Batalkan peringatan", en: "Cancel warning" }, icon: "x", cls: "btn-ghost" },
];

export default function SiteDetail() {
  const { locale } = useLanguage();
  const { siteId } = useParams();
  const navigate = useNavigate();
  const site = siteById(siteId);
  const [actionMsg, setActionMsg] = useState(null);

  if (!site) {
    return (
      <div className="op-page">
        <p>{locale === "id" ? "Titik tidak ditemukan." : "Site not found."}</p>
        <Link to="/operator/map" className="btn btn-outline btn-sm">{locale === "id" ? "Kembali ke peta" : "Back to map"}</Link>
      </div>
    );
  }

  const series = SITE_SERIES[site.id];
  const devices = devicesForSite(site.id);
  const history = warningsForSite(site.id);

  function runAction(action) {
    setActionMsg(`${locale === "id" ? "Aksi" : "Action"} ${action.label[locale]} ${locale === "id" ? "tercatat (mock)" : "recorded (mock)"} - ${new Date().toLocaleTimeString(locale === "id" ? "id-ID" : "en-GB")}`);
    setTimeout(() => setActionMsg(null), 3500);
  }

  return (
    <div className="op-page">
      <div className="op-breadcrumb">
        <Link to="/operator/map">{locale === "id" ? "Peta / Titik" : "Map / Sites"}</Link>
        <Icon name="chevron-right" size={12} />
        <span>{site.name}</span>
      </div>

      <Card className="op-site-header">
        <div className="op-site-header__left">
          <h1>{site.name}</h1>
          <div className="op-site-header__meta">
            <span className="badge-neutral">
              <Icon name="layers" size={12} /> {(POSITION_LABEL[site.position] ?? { id: site.position, en: site.position })[locale]}
            </span>
            <span className="muted">{locale === "id" ? "DAS" : "Watershed"} {site.basin}</span>
            <span className="muted">{site.province}</span>
            <span className="muted">{locale === "id" ? "Diperbarui" : "Updated"} {timeAgo(site.lastUpdated, locale)}</span>
          </div>
        </div>
        <StatusBadge level={site.status} locale={locale} size="lg" />
      </Card>

      {site.status === "black" ? (
        <div className="op-inline-notice">
          <Icon name="wifi-off" size={16} /> {locale === "id"
            ? "Titik ini tidak merespons - perlakukan sebagai status tidak diketahui, bukan kondisi parah yang terkonfirmasi. Kirim pemeriksaan lapangan dan cek daya/konektivitas node di menu Perangkat."
            : "This site is not responding - treat it as an unknown state, not a confirmed severe condition. Send a field check and verify node power/connectivity in the Devices menu."}
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
            <span className="section-title">{locale === "id" ? "Pembacaan sensor" : "Sensor readings"}</span>
          </div>
          <SensorChart series={series} locale={locale} />
        </Card>

        <Card className="op-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="section-header" style={{ padding: "18px 18px 0" }}>
            <span className="section-title">{locale === "id" ? "Lokasi" : "Location"}</span>
          </div>
          <div style={{ padding: 18 }}>
            <SiteMap sites={[site]} selectedSiteId={site.id} height={260} center={[site.lat, site.lng]} zoom={11} locale={locale} />
          </div>
        </Card>
      </div>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">{locale === "id" ? "Tindakan peringatan" : "Warning actions"}</span>
          <span className="muted" style={{ fontSize: 12 }}>{locale === "id" ? "Override manual - tercatat di riwayat peringatan" : "Manual override - recorded in warning history"}</span>
        </div>
        <div className="op-action-row">
          {ACTIONS.map((a) => (
            <button key={a.key} className={`btn ${a.cls}`} onClick={() => runAction(a)}>
              <Icon name={a.icon} size={15} /> {a.label[locale]}
            </button>
          ))}
        </div>
      </Card>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">{locale === "id" ? "Node di titik ini" : "Nodes at this site"}</span>
        </div>
        <table className="data-table data-table--clickable">
          <thead>
            <tr>
              <th>{locale === "id" ? "Serial" : "Serial"}</th>
              <th>{locale === "id" ? "Tipe" : "Type"}</th>
              <th>{locale === "id" ? "Status" : "Status"}</th>
              <th>{locale === "id" ? "Kontak terakhir" : "Last contact"}</th>
              <th>{locale === "id" ? "Baterai" : "Battery"}</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id} onClick={() => navigate(`/operator/devices/${d.id}`)}>
                <td style={{ fontWeight: 700 }}>{d.serial}</td>
                <td>{d.type}</td>
                <td>
                  <StatusBadge level={d.status} locale={locale} size="sm" />
                </td>
                <td>{timeAgo(d.lastContact, locale)}</td>
                <td>{d.battery}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="op-panel">
        <div className="section-header">
            <span className="section-title">{locale === "id" ? "Riwayat peringatan" : "Warning history"}</span>
        </div>
        {history.length === 0 ? (
          <div className="empty-state">{locale === "id" ? "Belum ada peringatan tercatat untuk titik ini." : "No warnings recorded for this site yet."}</div>
        ) : (
          <ul className="op-warning-list">
            {history.map((w) => (
              <li key={w.id}>
                <Link to={`/operator/warnings/${w.id}`} className="op-warning-row">
                  <StatusBadge level={w.status} locale={locale} size="sm" />
                  <div className="op-warning-row__body">
                    <div className="op-warning-row__site">
                      {SOURCE_LABEL[w.source]?.[locale] ?? w.source} {w.resolved ? (locale === "id" ? "· selesai" : "· resolved") : (locale === "id" ? "· aktif" : "· active")}
                    </div>
                    <div className="muted" style={{ fontSize: 11.5 }}>
                      {locale === "id" ? "Dipicu" : "Triggered"} {formatClock(w.triggeredAt)} UTC &middot; {timeAgo(w.triggeredAt, locale)}
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
