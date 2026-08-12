import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePublicAuth } from "./PublicAuthContext";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { PUBLIC_ALERTS, siteById, timeAgo } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

export default function PublicAlerts() {
  const { locale } = useLanguage();
  const { isLoggedIn, favorites } = usePublicAuth();
  const [scope, setScope] = useState("favorites");
  const navigate = useNavigate();

  const showFavoritesOnly = isLoggedIn && scope === "favorites";
  const alerts = showFavoritesOnly ? PUBLIC_ALERTS.filter((a) => favorites.includes(a.siteId)) : PUBLIC_ALERTS;

  return (
    <div className="pub-section">
      <div className="pub-hero pub-hero--tight">
        <h1>{locale === "id" ? "Peringatan" : "Alerts"}</h1>
        <p>{isLoggedIn ? (locale === "id" ? "Notifikasi untuk lokasi favoritmu dan info umum." : "Notifications for your favorite sites and general updates.") : (locale === "id" ? "Info peringatan untuk seluruh lokasi pemantauan." : "Warning info for all monitoring sites.")}</p>
      </div>

      {isLoggedIn ? (
        <div className="pill-tabs" style={{ marginBottom: 16 }}>
          <button className={scope === "favorites" ? "active" : ""} onClick={() => setScope("favorites")}>
            {locale === "id" ? "Favorit" : "Favorites"}
          </button>
          <button className={scope === "all" ? "active" : ""} onClick={() => setScope("all")}>
            {locale === "id" ? "Semua lokasi" : "All sites"}
          </button>
        </div>
      ) : null}

      <div className="pub-alert-list">
        {alerts.map((a) => {
          const site = siteById(a.siteId);
          const resolved = a.title.startsWith("[Selesai]");
          return (
            <button key={a.id} className="pub-alert-card" onClick={() => navigate(`/public/sites/${a.siteId}`)}>
              <div className="pub-alert-card__top">
                <StatusBadge level={a.status} locale={locale} size="sm" />
                <span className="muted" style={{ fontSize: 11 }}>{timeAgo(a.time, locale)}</span>
              </div>
              <div className={`pub-alert-card__title${resolved ? " resolved" : ""}`}>{a.title}</div>
              <div className="pub-alert-card__msg">{a.message}</div>
              <div className="pub-alert-card__site">
                <Icon name="map" size={12} /> {site?.name}
              </div>
            </button>
          );
        })}
        {alerts.length === 0 ? (
          <div className="pub-empty">
            {locale === "id" ? "Tidak ada peringatan untuk lokasi favoritmu saat ini." : "No alerts for your favorite sites right now."}
            <div style={{ marginTop: 10 }}>
              <button className="pub-link" onClick={() => setScope("all")}>{locale === "id" ? "Lihat semua peringatan" : "View all alerts"}</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
