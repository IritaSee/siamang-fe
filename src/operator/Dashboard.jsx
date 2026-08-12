import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/Card";
import Icon from "../components/Icon";
import { RISK_LEVELS, sortBySeverity } from "../theme/riskLevels";
import { SITES, WARNINGS, DEVICES, timeAgo } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

const SOURCE_LABEL = {
  sensor_threshold: { id: "Ambang sensor", en: "Sensor threshold" },
  central_forecast: { id: "Prakiraan pusat", en: "Central forecast" },
  manual: { id: "Manual", en: "Manual" },
  liveness_monitor: { id: "Monitor keaktifan node", en: "Node liveness monitor" },
};

export default function Dashboard() {
  const { locale } = useLanguage();
  const counts = Object.fromEntries(Object.keys(RISK_LEVELS).map((k) => [k, SITES.filter((s) => s.status === k).length]));
  const activeWarnings = sortBySeverity(
    WARNINGS.filter((w) => !w.resolved),
    (w) => w.status
  );
  const silentSites = SITES.filter((s) => s.status === "black");
  const staleDevices = DEVICES.filter((d) => d.status === "black").sort((a, b) => new Date(a.lastContact) - new Date(b.lastContact));

  return (
    <div className="op-page">
      <div className="op-page__intro">
        <h1>{locale === "id" ? "Ringkasan Situasi" : "Situation Summary"}</h1>
        <p className="muted">{locale === "id" ? "Status langsung dari 15 titik pemantauan di 6 DAS percontohan." : "Live status from 15 monitoring sites across 6 demo watersheds."}</p>
      </div>

      <div className="op-stat-grid">
        <StatCard label={locale === "id" ? RISK_LEVELS.green.id : RISK_LEVELS.green.en} value={counts.green} sub={locale === "id" ? "titik" : "sites"} tone="green" />
        <StatCard label={locale === "id" ? RISK_LEVELS.yellow.id : RISK_LEVELS.yellow.en} value={counts.yellow} sub={locale === "id" ? "titik" : "sites"} tone="yellow" />
        <StatCard label={locale === "id" ? RISK_LEVELS.orange.id : RISK_LEVELS.orange.en} value={counts.orange} sub={locale === "id" ? "titik" : "sites"} tone="orange" />
        <StatCard label={locale === "id" ? RISK_LEVELS.red.id : RISK_LEVELS.red.en} value={counts.red} sub={locale === "id" ? "titik" : "sites"} tone="red" />
      </div>

      <Card className="op-black-panel">
        <div className="op-black-panel__left">
          <div className="op-black-panel__icon">
            <Icon name="wifi-off" size={20} />
          </div>
          <div>
            <div className="op-black-panel__title">{locale === "id" ? "Tidak Ada Sinyal - perlu perhatian" : "No Signal - needs attention"}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>
              {locale === "id"
                ? "Titik ini tidak mengirim data. Ini status tidak diketahui, bukan kondisi parah yang terkonfirmasi - mohon kirim pemeriksaan lapangan."
                : "This site is not sending data. It is an unknown state, not a confirmed severe condition - please dispatch a field check."}
            </div>
          </div>
        </div>
        <div className="op-black-panel__list">
          {silentSites.map((s) => (
            <Link key={s.id} to={`/operator/sites/${s.id}`} className="op-black-chip">
              <StatusBadge level="black" locale={locale} size="sm" />
              <span>{s.name}</span>
              <span className="muted" style={{ fontSize: 11 }}>{timeAgo(s.lastUpdated, locale)}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="op-grid-2">
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">{locale === "id" ? "Peringatan Aktif, prioritas tertinggi dulu" : "Active warnings, highest priority first"}</span>
            <Link to="/operator/warnings" className="btn btn-ghost btn-sm">
              {locale === "id" ? "Lihat semua" : "View all"} <Icon name="chevron-right" size={14} />
            </Link>
          </div>
          <ul className="op-warning-list">
            {activeWarnings.map((w) => {
              const site = SITES.find((s) => s.id === w.siteId);
              return (
                <li key={w.id}>
                  <Link to={`/operator/warnings/${w.id}`} className="op-warning-row">
                      <StatusBadge level={w.status} locale={locale} size="sm" />
                    <div className="op-warning-row__body">
                      <div className="op-warning-row__site">{site?.name}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>
                          {SOURCE_LABEL[w.source]?.[locale] ?? w.source} &middot; {locale === "id" ? "dipicu" : "triggered"} {timeAgo(w.triggeredAt, locale)}
                      </div>
                    </div>
                    <Icon name="chevron-right" size={16} className="muted" />
                  </Link>
                </li>
              );
            })}
              {activeWarnings.length === 0 ? <div className="empty-state">{locale === "id" ? "Tidak ada peringatan aktif." : "No active warnings."}</div> : null}
          </ul>
        </Card>

        <Card className="op-panel">
          <div className="section-header">
              <span className="section-title">{locale === "id" ? "Node Tidak Merespons Saat Ini" : "Currently Unresponsive Nodes"}</span>
            <Link to="/operator/devices" className="btn btn-ghost btn-sm">
                {locale === "id" ? "Lihat semua" : "View all"} <Icon name="chevron-right" size={14} />
            </Link>
          </div>
          <ul className="op-warning-list">
            {staleDevices.map((d) => (
              <li key={d.id}>
                <Link to={`/operator/devices/${d.id}`} className="op-warning-row">
                  <StatusBadge level="black" locale={locale} size="sm" />
                  <div className="op-warning-row__body">
                    <div className="op-warning-row__site">{d.serial}</div>
                    <div className="muted" style={{ fontSize: 11.5 }}>
                      {d.site} &middot; {locale === "id" ? "kontak terakhir" : "last contact"} {timeAgo(d.lastContact, locale)}
                    </div>
                  </div>
                  <Icon name="chevron-right" size={16} className="muted" />
                </Link>
              </li>
            ))}
            {staleDevices.length === 0 ? <div className="empty-state">{locale === "id" ? "Semua node melapor normal." : "All nodes are reporting normally."}</div> : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
