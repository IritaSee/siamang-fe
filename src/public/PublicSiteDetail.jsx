import { Link, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import SensorChart from "../components/SensorChart";
import SiteMap from "../components/SiteMap";
import { usePublicAuth } from "./PublicAuthContext";
import { siteById, SITE_SERIES, timeAgo } from "../data/mockData";
import { RISK_LEVELS } from "../theme/riskLevels";

const ADVICE = {
  green: "Kondisi aman. Tetap pantau secara berkala.",
  yellow: "Waspada. Perhatikan perkembangan cuaca dan informasi terbaru.",
  orange: "Siaga. Siapkan rencana evakuasi dan pantau arahan petugas setempat.",
  red: "Awas. Segera menuju titik evakuasi terdekat dan ikuti arahan petugas.",
  black: "Sensor di lokasi ini sedang tidak mengirim data. Pantau lokasi terdekat lain sebagai referensi.",
};

export default function PublicSiteDetail() {
  const { siteId } = useParams();
  const site = siteById(siteId);
  const { isFavorite, toggleFavorite } = usePublicAuth();

  if (!site) {
    return (
      <div className="pub-section">
        <p>Lokasi tidak ditemukan.</p>
        <Link to="/public/map" className="btn btn-outline btn-sm">Kembali ke peta</Link>
      </div>
    );
  }

  const series = SITE_SERIES[site.id];
  const favorite = isFavorite(site.id);

  return (
    <div className="pub-section">
      <Link to="/public/map" className="pub-back">
        <Icon name="arrow-left" size={15} /> Kembali
      </Link>

      <div className="pub-status-card" style={{ background: RISK_LEVELS[site.status].bg }}>
        <div className="pub-status-card__top">
          <div>
            <div className="pub-status-card__basin">{site.basin} &middot; <span style={{ textTransform: "capitalize" }}>{site.position}</span></div>
            <h1>{site.name}</h1>
          </div>
          <button className={`pub-fav-btn${favorite ? " active" : ""}`} onClick={() => toggleFavorite(site.id)} aria-label="Simpan ke favorit">
            <Icon name="star" size={20} />
          </button>
        </div>
        <StatusBadge level={site.status} locale="id" size="lg" />
        <p className="pub-status-card__advice">{ADVICE[site.status]}</p>
        <div className="pub-status-card__updated">Diperbarui {timeAgo(site.lastUpdated, "id")}</div>
      </div>

      <button className={`btn ${favorite ? "btn-outline" : "btn-primary"}`} style={{ width: "100%", marginTop: 14 }} onClick={() => toggleFavorite(site.id)}>
        <Icon name="star" size={15} /> {favorite ? "Tersimpan di favorit" : "Simpan ke favorit"}
      </button>

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">Tren Sensor</span>
        </div>
        <div className="pub-card">
          <SensorChart series={series} locale="id" />
        </div>
      </div>

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">Lokasi di Peta</span>
        </div>
        <SiteMap sites={[site]} selectedSiteId={site.id} height={220} center={[site.lat, site.lng]} zoom={11} locale="id" />
      </div>
    </div>
  );
}
