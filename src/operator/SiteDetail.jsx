import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import SensorChart from "../components/SensorChart";
import SiteMap from "../components/SiteMap";
import { siteById, SITE_SERIES, devicesForSite, warningsForSite, timeAgo, formatClock } from "../data/mockData";

const POSITION_LABEL = {
  upstream: "hulu",
  midstream: "tengah",
  downstream: "hilir",
};

const SOURCE_LABEL = {
  sensor_threshold: "Ambang sensor",
  central_forecast: "Prakiraan pusat",
  manual: "Manual",
  liveness_monitor: "Monitor keaktifan node",
};

const ACTIONS = [
  { key: "trigger", label: "Picu", icon: "siren", cls: "btn-danger" },
  { key: "escalate", label: "Naikkan tingkat", icon: "arrow-right", cls: "btn-outline" },
  { key: "downgrade", label: "Turunkan tingkat", icon: "arrow-left", cls: "btn-outline" },
  { key: "cancel", label: "Batalkan peringatan", icon: "x", cls: "btn-ghost" },
];

export default function SiteDetail() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const site = siteById(siteId);
  const [actionMsg, setActionMsg] = useState(null);

  if (!site) {
    return (
      <div className="op-page">
        <p>Titik tidak ditemukan.</p>
        <Link to="/operator/map" className="btn btn-outline btn-sm">Kembali ke peta</Link>
      </div>
    );
  }

  const series = SITE_SERIES[site.id];
  const devices = devicesForSite(site.id);
  const history = warningsForSite(site.id);

  function runAction(action) {
    setActionMsg(`Aksi ${action.label} tercatat (mock) - ${new Date().toLocaleTimeString("id-ID")}`);
    setTimeout(() => setActionMsg(null), 3500);
  }

  return (
    <div className="op-page">
      <div className="op-breadcrumb">
        <Link to="/operator/map">Peta / Titik</Link>
        <Icon name="chevron-right" size={12} />
        <span>{site.name}</span>
      </div>

      <Card className="op-site-header">
        <div className="op-site-header__left">
          <h1>{site.name}</h1>
          <div className="op-site-header__meta">
            <span className="badge-neutral">
              <Icon name="layers" size={12} /> {POSITION_LABEL[site.position] ?? site.position}
            </span>
            <span className="muted">DAS {site.basin}</span>
            <span className="muted">{site.province}</span>
            <span className="muted">Diperbarui {timeAgo(site.lastUpdated, "id")}</span>
          </div>
        </div>
        <StatusBadge level={site.status} locale="id" size="lg" />
      </Card>

      {site.status === "black" ? (
        <div className="op-inline-notice">
          <Icon name="wifi-off" size={16} /> Titik ini tidak merespons - perlakukan sebagai status tidak diketahui, bukan
          kondisi parah yang terkonfirmasi. Kirim pemeriksaan lapangan dan cek daya/konektivitas node di menu Perangkat.
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
            <span className="section-title">Pembacaan sensor</span>
          </div>
          <SensorChart series={series} locale="id" />
        </Card>

        <Card className="op-panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="section-header" style={{ padding: "18px 18px 0" }}>
            <span className="section-title">Lokasi</span>
          </div>
          <div style={{ padding: 18 }}>
            <SiteMap sites={[site]} selectedSiteId={site.id} height={260} center={[site.lat, site.lng]} zoom={11} locale="id" />
          </div>
        </Card>
      </div>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">Tindakan peringatan</span>
          <span className="muted" style={{ fontSize: 12 }}>Override manual - tercatat di riwayat peringatan</span>
        </div>
        <div className="op-action-row">
          {ACTIONS.map((a) => (
            <button key={a.key} className={`btn ${a.cls}`} onClick={() => runAction(a)}>
              <Icon name={a.icon} size={15} /> {a.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">Node di titik ini</span>
        </div>
        <table className="data-table data-table--clickable">
          <thead>
            <tr>
              <th>Serial</th>
              <th>Tipe</th>
              <th>Status</th>
              <th>Kontak terakhir</th>
              <th>Baterai</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id} onClick={() => navigate(`/operator/devices/${d.id}`)}>
                <td style={{ fontWeight: 700 }}>{d.serial}</td>
                <td>{d.type}</td>
                <td>
                  <StatusBadge level={d.status} locale="id" size="sm" />
                </td>
                <td>{timeAgo(d.lastContact, "id")}</td>
                <td>{d.battery}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">Riwayat peringatan</span>
        </div>
        {history.length === 0 ? (
          <div className="empty-state">Belum ada peringatan tercatat untuk titik ini.</div>
        ) : (
          <ul className="op-warning-list">
            {history.map((w) => (
              <li key={w.id}>
                <Link to={`/operator/warnings/${w.id}`} className="op-warning-row">
                  <StatusBadge level={w.status} locale="id" size="sm" />
                  <div className="op-warning-row__body">
                    <div className="op-warning-row__site">
                      {SOURCE_LABEL[w.source] ?? w.source} {w.resolved ? "· selesai" : "· aktif"}
                    </div>
                    <div className="muted" style={{ fontSize: 11.5 }}>
                      Dipicu {formatClock(w.triggeredAt)} UTC &middot; {timeAgo(w.triggeredAt, "id")}
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
