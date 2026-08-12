import { useNavigate } from "react-router-dom";
import { usePublicAuth } from "./PublicAuthContext";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { SITES, SITE_SERIES, timeAgo } from "../data/mockData";
import { sortBySeverity } from "../theme/riskLevels";

function trendLabel(siteId) {
  const series = SITE_SERIES[siteId];
  const first = series.forecast[0].waterLevel;
  const last = series.forecast[series.forecast.length - 1].waterLevel;
  const delta = last - first;
  if (delta > 4) return { text: "diperkirakan naik 12 jam ke depan", icon: "arrow-right" };
  if (delta < -4) return { text: "diperkirakan turun 12 jam ke depan", icon: "arrow-left" };
  return { text: "diperkirakan stabil 12 jam ke depan", icon: "check" };
}

export default function PublicHome() {
  const { isLoggedIn, favorites, user } = usePublicAuth();
  const navigate = useNavigate();

  const alertCount = SITES.filter((s) => s.status === "orange" || s.status === "red").length;
  const silentCount = SITES.filter((s) => s.status === "black").length;
  const favoriteSites = SITES.filter((s) => favorites.includes(s.id));
  const worstFirst = sortBySeverity(SITES, (s) => s.status).slice(0, 6);

  return (
    <div className="pub-section">
      <div className="pub-hero">
        <div className="pub-hero__eyebrow">SIAMANG &middot; Peringatan Dini Banjir Bandang</div>
        {isLoggedIn ? <h1>Halo, {user.name.split(" ")[0]} 👋</h1> : <h1>Pantau risiko banjir di sekitarmu</h1>}
        <p>Data status sungai dari sensor di hulu, tengah, dan hilir — diperbarui berkala.</p>
      </div>

      <button className="pub-search" onClick={() => navigate("/public/map")}>
        <Icon name="search" size={16} />
        <span>Cari nama sungai atau desa...</span>
      </button>

      <div className="pub-stat-row">
        <div className="pub-stat-chip">
          <div className="pub-stat-chip__value">{SITES.length}</div>
          <div className="pub-stat-chip__label">Lokasi</div>
        </div>
        <div className="pub-stat-chip pub-stat-chip--warn">
          <div className="pub-stat-chip__value">{alertCount}</div>
          <div className="pub-stat-chip__label">Siaga / Awas</div>
        </div>
        <div className="pub-stat-chip pub-stat-chip--dim">
          <div className="pub-stat-chip__value">{silentCount}</div>
          <div className="pub-stat-chip__label">Tanpa Sinyal</div>
        </div>
      </div>

      {isLoggedIn ? (
        <div className="pub-block">
          <div className="pub-block__head">
            <span className="pub-block__title">Lokasi Favorit</span>
            <button className="pub-link" onClick={() => navigate("/public/settings")}>Kelola</button>
          </div>
          {favoriteSites.length === 0 ? (
            <div className="pub-empty">Belum ada lokasi favorit. Buka halaman detail lokasi lalu ketuk "Simpan ke favorit".</div>
          ) : (
            <div className="pub-fav-scroll">
              {favoriteSites.map((s) => {
                const trend = trendLabel(s.id);
                return (
                  <button key={s.id} className="pub-fav-card" onClick={() => navigate(`/public/sites/${s.id}`)}>
                    <StatusBadge level={s.status} locale="id" size="sm" />
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
            <div className="pub-cta-card__title">Simpan lokasi favoritmu</div>
            <div className="pub-cta-card__sub">Masuk untuk memantau lokasi tertentu &amp; dapat notifikasi</div>
          </div>
          <Icon name="chevron-right" size={16} className="muted" />
        </button>
      )}

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">Status Terkini</span>
          <button className="pub-link" onClick={() => navigate("/public/map")}>Lihat peta</button>
        </div>
        <div className="pub-site-list">
          {worstFirst.map((s) => (
            <button key={s.id} className="pub-site-row" onClick={() => navigate(`/public/sites/${s.id}`)}>
              <StatusBadge level={s.status} locale="id" size="sm" />
              <div className="pub-site-row__body">
                <div className="pub-site-row__name">{s.name}</div>
                <div className="pub-site-row__meta">{s.basin} &middot; {timeAgo(s.lastUpdated, "id")}</div>
              </div>
              <Icon name="chevron-right" size={15} className="muted" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
