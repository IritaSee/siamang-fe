import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePublicAuth } from "./PublicAuthContext";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { PUBLIC_ALERTS, siteById, timeAgo } from "../data/mockData";

export default function PublicAlerts() {
  const { isLoggedIn, favorites } = usePublicAuth();
  const [scope, setScope] = useState("favorites");
  const navigate = useNavigate();

  const showFavoritesOnly = isLoggedIn && scope === "favorites";
  const alerts = showFavoritesOnly ? PUBLIC_ALERTS.filter((a) => favorites.includes(a.siteId)) : PUBLIC_ALERTS;

  return (
    <div className="pub-section">
      <div className="pub-hero pub-hero--tight">
        <h1>Peringatan</h1>
        <p>{isLoggedIn ? "Notifikasi untuk lokasi favoritmu dan info umum." : "Info peringatan untuk seluruh lokasi pemantauan."}</p>
      </div>

      {isLoggedIn ? (
        <div className="pill-tabs" style={{ marginBottom: 16 }}>
          <button className={scope === "favorites" ? "active" : ""} onClick={() => setScope("favorites")}>
            Favorit
          </button>
          <button className={scope === "all" ? "active" : ""} onClick={() => setScope("all")}>
            Semua lokasi
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
                <StatusBadge level={a.status} locale="id" size="sm" />
                <span className="muted" style={{ fontSize: 11 }}>{timeAgo(a.time, "id")}</span>
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
            Tidak ada peringatan untuk lokasi favoritmu saat ini.
            <div style={{ marginTop: 10 }}>
              <button className="pub-link" onClick={() => setScope("all")}>Lihat semua peringatan</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
