import { useNavigate } from "react-router-dom";
import { usePublicAuth } from "./PublicAuthContext";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { SITES, SITE_SERIES, timeAgo } from "../data/mockData";
import { sortBySeverity } from "../theme/riskLevels";
import { useLanguage } from "../i18n/LanguageContext";

function trendLabel(siteId, locale) {
  const series = SITE_SERIES[siteId];
  const first = series.forecast[0].waterLevel;
  const last = series.forecast[series.forecast.length - 1].waterLevel;
  const delta = last - first;
  if (delta > 4) return { text: locale === "id" ? "diperkirakan naik 12 jam ke depan" : "expected to rise over the next 12 hours", icon: "arrow-right" };
  if (delta < -4) return { text: locale === "id" ? "diperkirakan turun 12 jam ke depan" : "expected to fall over the next 12 hours", icon: "arrow-left" };
  return { text: locale === "id" ? "diperkirakan stabil 12 jam ke depan" : "expected to stay stable over the next 12 hours", icon: "check" };
}

export default function PublicHome() {
  const { locale } = useLanguage();
  const { isLoggedIn, favorites, user } = usePublicAuth();
  const navigate = useNavigate();

  const alertCount = SITES.filter((s) => s.status === "orange" || s.status === "red").length;
  const silentCount = SITES.filter((s) => s.status === "black").length;
  const favoriteSites = SITES.filter((s) => favorites.includes(s.id));
  const worstFirst = sortBySeverity(SITES, (s) => s.status).slice(0, 6);

  return (
    <div className="pub-section">
      <div className="pub-hero">
        <div className="pub-hero__eyebrow">SIAMANG &middot; {locale === "id" ? "Peringatan Dini Banjir Bandang" : "Flash Flood Early Warning"}</div>
        {isLoggedIn ? <h1>{locale === "id" ? "Halo" : "Hello"}, {user.name.split(" ")[0]} 👋</h1> : <h1>{locale === "id" ? "Pantau risiko banjir di sekitarmu" : "Monitor flood risk around you"}</h1>}
        <p>{locale === "id" ? "Data status sungai dari sensor di hulu, tengah, dan hilir — diperbarui berkala." : "River status data from upstream, midstream, and downstream sensors — refreshed regularly."}</p>
      </div>

      <button className="pub-search" onClick={() => navigate("/public/map")}>
        <Icon name="search" size={16} />
        <span>{locale === "id" ? "Cari nama sungai atau desa..." : "Search river or village name..."}</span>
      </button>

      <div className="pub-stat-row">
        <div className="pub-stat-chip">
          <div className="pub-stat-chip__value">{SITES.length}</div>
          <div className="pub-stat-chip__label">{locale === "id" ? "Lokasi" : "Locations"}</div>
        </div>
        <div className="pub-stat-chip pub-stat-chip--warn">
          <div className="pub-stat-chip__value">{alertCount}</div>
          <div className="pub-stat-chip__label">{locale === "id" ? "Siaga / Awas" : "Alert / Danger"}</div>
        </div>
        <div className="pub-stat-chip pub-stat-chip--dim">
          <div className="pub-stat-chip__value">{silentCount}</div>
          <div className="pub-stat-chip__label">{locale === "id" ? "Tanpa Sinyal" : "No Signal"}</div>
        </div>
      </div>

      {isLoggedIn ? (
        <div className="pub-block">
          <div className="pub-block__head">
            <span className="pub-block__title">{locale === "id" ? "Lokasi Favorit" : "Favorite Locations"}</span>
            <button className="pub-link" onClick={() => navigate("/public/settings")}>{locale === "id" ? "Kelola" : "Manage"}</button>
          </div>
          {favoriteSites.length === 0 ? (
            <div className="pub-empty">{locale === "id" ? "Belum ada lokasi favorit. Buka halaman detail lokasi lalu ketuk \"Simpan ke favorit\"." : "No favorite locations yet. Open a site detail page and tap \"Save to favorites\"."}</div>
          ) : (
            <div className="pub-fav-scroll">
              {favoriteSites.map((s) => {
                const trend = trendLabel(s.id, locale);
                return (
                  <button key={s.id} className="pub-fav-card" onClick={() => navigate(`/public/sites/${s.id}`)}>
                    <StatusBadge level={s.status} locale={locale} size="sm" />
                    <div className="pub-fav-card__name">{s.name}</div>
                    <div className="pub-fav-card__trend">
                      <Icon name={trend.icon} size={12} /> {trend.text}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <button className="pub-cta-card" onClick={() => navigate("/public/settings")}>
          <div className="pub-cta-card__icon">
            <Icon name="star" size={18} />
          </div>
          <div className="pub-cta-card__body">
            <div className="pub-cta-card__title">{locale === "id" ? "Simpan lokasi favoritmu" : "Save your favorite locations"}</div>
            <div className="pub-cta-card__sub">{locale === "id" ? "Masuk untuk memantau lokasi tertentu &amp; dapat notifikasi" : "Sign in to track specific sites and get notifications"}</div>
          </div>
          <Icon name="chevron-right" size={16} className="muted" />
        </button>
      )}

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">{locale === "id" ? "Status Terkini" : "Current Status"}</span>
          <button className="pub-link" onClick={() => navigate("/public/map")}>{locale === "id" ? "Lihat peta" : "View map"}</button>
        </div>
        <div className="pub-site-list">
          {worstFirst.map((s) => (
            <button key={s.id} className="pub-site-row" onClick={() => navigate(`/public/sites/${s.id}`)}>
              <StatusBadge level={s.status} locale={locale} size="sm" />
              <div className="pub-site-row__body">
                <div className="pub-site-row__name">{s.name}</div>
                <div className="pub-site-row__meta">{s.basin} &middot; {timeAgo(s.lastUpdated, locale)}</div>
              </div>
              <Icon name="chevron-right" size={15} className="muted" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
