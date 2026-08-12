import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import MiniLineChart from "../components/MiniLineChart";
import { DEVICES, DEVICE_HEALTH, siteById, timeAgo } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

const POSITION_LABEL = {
  upstream: { id: "hulu", en: "upstream" },
  midstream: { id: "tengah", en: "midstream" },
  downstream: { id: "hilir", en: "downstream" },
};

export default function DeviceDetail() {
  const { locale } = useLanguage();
  const { deviceId } = useParams();
  const device = DEVICES.find((d) => d.id === deviceId);

  if (!device) {
    return (
      <div className="op-page">
        <p>{locale === "id" ? "Perangkat tidak ditemukan." : "Device not found."}</p>
        <Link to="/operator/devices" className="btn btn-outline btn-sm">{locale === "id" ? "Kembali ke perangkat" : "Back to devices"}</Link>
      </div>
    );
  }

  const site = siteById(device.siteId);
  const health = DEVICE_HEALTH[device.id];
  const labels = health.map((p) => new Date(p.t).toLocaleDateString(locale === "id" ? "id-ID" : "en-GB", { day: "2-digit", month: "short" }));

  return (
    <div className="op-page">
      <div className="op-breadcrumb">
        <Link to="/operator/devices">{locale === "id" ? "Perangkat" : "Devices"}</Link>
        <Icon name="chevron-right" size={12} />
        <span>{device.serial}</span>
      </div>

      <Card className="op-site-header">
        <div className="op-site-header__left">
          <h1>{device.serial}</h1>
          <div className="op-site-header__meta">
            <span className="badge-neutral"><Icon name="cpu" size={12} /> {device.type}</span>
            <Link to={`/operator/sites/${device.siteId}`} className="muted">{site?.name}</Link>
            <span className="muted">{locale === "id" ? "Kontak terakhir" : "Last contact"} {timeAgo(device.lastContact, locale)}</span>
          </div>
        </div>
        <StatusBadge level={device.status} locale={locale} size="lg" />
      </Card>

      {device.status === "black" ? (
        <div className="op-inline-notice">
          <Icon name="wifi-off" size={16} /> {locale === "id"
            ? "Tidak ada heartbeat yang diterima belakangan ini. Tren sinyal dan baterai di bawah ini bisa menunjukkan penyebabnya - periksa kehilangan daya atau kerusakan fisik sebelum menganggap pembacaan parah di node ini."
            : "No heartbeat has been received recently. The signal and battery trends below may show why - check for power loss or physical damage before assuming a severe reading on this node."}
        </div>
      ) : null}

      <div className="op-grid-2">
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">{locale === "id" ? "Baterai, 14 hari terakhir" : "Battery, last 14 days"}</span>
            <span className="muted" style={{ fontSize: 12.5 }}>{device.battery}% {locale === "id" ? "saat ini" : "now"}</span>
          </div>
          <MiniLineChart labels={labels} values={health.map((p) => p.battery)} color="#0d9488" unit="%" />
        </Card>
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">{locale === "id" ? "Kekuatan sinyal, 14 hari terakhir" : "Signal strength, last 14 days"}</span>
            <span className="muted" style={{ fontSize: 12.5 }}>{health[health.length - 1].signal}% {locale === "id" ? "saat ini" : "now"}</span>
          </div>
          <MiniLineChart labels={labels} values={health.map((p) => p.signal)} color="#0f4c81" unit="%" />
        </Card>
      </div>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">{locale === "id" ? "Info perangkat" : "Device info"}</span>
        </div>
        <div className="op-kv-grid">
          <div>
            <div className="field-label">Serial</div>
            <div>{device.serial}</div>
          </div>
          <div>
            <div className="field-label">{locale === "id" ? "Tipe" : "Type"}</div>
            <div>{device.type}</div>
          </div>
          <div>
            <div className="field-label">{locale === "id" ? "Titik" : "Site"}</div>
            <div>{site?.name}</div>
          </div>
          <div>
            <div className="field-label">{locale === "id" ? "Posisi" : "Position"}</div>
            <div style={{ textTransform: "capitalize" }}>{(POSITION_LABEL[site?.position] ?? { id: site?.position, en: site?.position })[locale]}</div>
          </div>
          <div>
            <div className="field-label">{locale === "id" ? "DAS" : "Watershed"}</div>
            <div>{site?.basin}</div>
          </div>
          <div>
            <div className="field-label">{locale === "id" ? "Provinsi" : "Province"}</div>
            <div>{site?.province}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
