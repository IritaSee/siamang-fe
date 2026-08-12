import { Link, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import SensorChart from "../components/SensorChart";
import SiteMap from "../components/SiteMap";
import { usePublicAuth } from "./PublicAuthContext";
import { siteById, SITE_SERIES, timeAgo } from "../data/mockData";
import { RISK_LEVELS } from "../theme/riskLevels";
import { useLanguage } from "../i18n/LanguageContext";

const ADVICE = {
  green: { id: "Kondisi aman. Tetap pantau secara berkala.", en: "Safe. Keep monitoring regularly." },
  yellow: { id: "Waspada. Perhatikan perkembangan cuaca dan informasi terbaru.", en: "Pay Extra Watch. Pay attention to weather developments and updates." },
  orange: { id: "Siaga. Siapkan rencana evakuasi dan pantau arahan petugas setempat.", en: "Alert. Prepare an evacuation plan and monitor local guidance." },
  red: { id: "Awas. Segera menuju titik evakuasi terdekat dan ikuti arahan petugas.", en: "Danger. Move to the nearest evacuation point and follow official guidance." },
  black: { id: "Sensor di lokasi ini sedang tidak mengirim data. Pantau lokasi terdekat lain sebagai referensi.", en: "The sensor at this site is not sending data. Use nearby sites as a reference." },
};

export default function PublicSiteDetail() {
  const { locale } = useLanguage();
  const { siteId } = useParams();
  const site = siteById(siteId);
  const { isFavorite, toggleFavorite } = usePublicAuth();

  if (!site) {
    return (
      <div className="pub-section">
        <p>{locale === "id" ? "Lokasi tidak ditemukan." : "Site not found."}</p>
        <Link to="/public/map" className="btn btn-outline btn-sm">{locale === "id" ? "Kembali ke peta" : "Back to map"}</Link>
      </div>
    );
  }

  const series = SITE_SERIES[site.id];
  const favorite = isFavorite(site.id);

  return (
    <div className="pub-section">
      <Link to="/public/map" className="pub-back">
        <Icon name="arrow-left" size={15} /> {locale === "id" ? "Kembali" : "Back"}
      </Link>

      <div className="pub-status-card" style={{ background: RISK_LEVELS[site.status].bg }}>
        <div className="pub-status-card__top">
          <div>
            <div className="pub-status-card__basin">{site.basin} &middot; <span style={{ textTransform: "capitalize" }}>{({ upstream: { id: "hulu", en: "upstream" }, midstream: { id: "tengah", en: "midstream" }, downstream: { id: "hilir", en: "downstream" } }[site.position] ?? { id: site.position, en: site.position })[locale]}</span></div>
            <h1>{site.name}</h1>
          </div>
          <button className={`pub-fav-btn${favorite ? " active" : ""}`} onClick={() => toggleFavorite(site.id)} aria-label={locale === "id" ? "Simpan ke favorit" : "Save to favorites"}>
            <Icon name="star" size={20} />
          </button>
        </div>
        <StatusBadge level={site.status} locale={locale} size="lg" />
        <p className="pub-status-card__advice">{ADVICE[site.status]?.[locale] ?? ADVICE[site.status]?.id}</p>
        <div className="pub-status-card__updated">{locale === "id" ? "Diperbarui" : "Updated"} {timeAgo(site.lastUpdated, locale)}</div>
      </div>

      <button className={`btn ${favorite ? "btn-outline" : "btn-primary"}`} style={{ width: "100%", marginTop: 14 }} onClick={() => toggleFavorite(site.id)}>
        <Icon name="star" size={15} /> {favorite ? (locale === "id" ? "Tersimpan di favorit" : "Saved to favorites") : (locale === "id" ? "Simpan ke favorit" : "Save to favorites")}
      </button>

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">{locale === "id" ? "Tren Sensor" : "Sensor Trend"}</span>
        </div>
        <div className="pub-card">
          <SensorChart series={series} locale={locale} />
        </div>
      </div>

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">{locale === "id" ? "Lokasi di Peta" : "Site on Map"}</span>
        </div>
        <SiteMap sites={[site]} selectedSiteId={site.id} height={220} center={[site.lat, site.lng]} zoom={11} locale={locale} />
      </div>
    </div>
  );
}
