import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import MiniLineChart from "../components/MiniLineChart";
import { DEVICES, DEVICE_HEALTH, siteById, timeAgo } from "../data/mockData";

const POSITION_LABEL = {
  upstream: "hulu",
  midstream: "tengah",
  downstream: "hilir",
};

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const device = DEVICES.find((d) => d.id === deviceId);

  if (!device) {
    return (
      <div className="op-page">
        <p>Perangkat tidak ditemukan.</p>
        <Link to="/operator/devices" className="btn btn-outline btn-sm">Kembali ke perangkat</Link>
      </div>
    );
  }

  const site = siteById(device.siteId);
  const health = DEVICE_HEALTH[device.id];
  const labels = health.map((p) => new Date(p.t).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }));

  return (
    <div className="op-page">
      <div className="op-breadcrumb">
        <Link to="/operator/devices">Perangkat</Link>
        <Icon name="chevron-right" size={12} />
        <span>{device.serial}</span>
      </div>

      <Card className="op-site-header">
        <div className="op-site-header__left">
          <h1>{device.serial}</h1>
          <div className="op-site-header__meta">
            <span className="badge-neutral"><Icon name="cpu" size={12} /> {device.type}</span>
            <Link to={`/operator/sites/${device.siteId}`} className="muted">{site?.name}</Link>
            <span className="muted">Kontak terakhir {timeAgo(device.lastContact, "id")}</span>
          </div>
        </div>
        <StatusBadge level={device.status} locale="id" size="lg" />
      </Card>

      {device.status === "black" ? (
        <div className="op-inline-notice">
          <Icon name="wifi-off" size={16} /> Tidak ada heartbeat yang diterima belakangan ini. Tren sinyal dan baterai di bawah
          ini bisa menunjukkan penyebabnya - periksa kehilangan daya atau kerusakan fisik sebelum menganggap pembacaan parah di
          node ini.
        </div>
      ) : null}

      <div className="op-grid-2">
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">Baterai, 14 hari terakhir</span>
            <span className="muted" style={{ fontSize: 12.5 }}>{device.battery}% saat ini</span>
          </div>
          <MiniLineChart labels={labels} values={health.map((p) => p.battery)} color="#0d9488" unit="%" />
        </Card>
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">Kekuatan sinyal, 14 hari terakhir</span>
            <span className="muted" style={{ fontSize: 12.5 }}>{health[health.length - 1].signal}% saat ini</span>
          </div>
          <MiniLineChart labels={labels} values={health.map((p) => p.signal)} color="#0f4c81" unit="%" />
        </Card>
      </div>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">Info perangkat</span>
        </div>
        <div className="op-kv-grid">
          <div>
            <div className="field-label">Serial</div>
            <div>{device.serial}</div>
          </div>
          <div>
            <div className="field-label">Tipe</div>
            <div>{device.type}</div>
          </div>
          <div>
            <div className="field-label">Titik</div>
            <div>{site?.name}</div>
          </div>
          <div>
            <div className="field-label">Posisi</div>
            <div style={{ textTransform: "capitalize" }}>{POSITION_LABEL[site?.position] ?? site?.position}</div>
          </div>
          <div>
            <div className="field-label">DAS</div>
            <div>{site?.basin}</div>
          </div>
          <div>
            <div className="field-label">Provinsi</div>
            <div>{site?.province}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
