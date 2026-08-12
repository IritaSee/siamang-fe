import { useState } from "react";
import { usePublicAuth } from "./PublicAuthContext";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { SITES } from "../data/mockData";

function NotifyToggle({ siteId }) {
  const [on, setOn] = useState(true);
  return (
    <button className={`pub-switch${on ? " on" : ""}`} onClick={() => setOn((v) => !v)} aria-label="Notifikasi">
      <span className="pub-switch__knob" />
    </button>
  );
}

export default function PublicSettings() {
  const { isLoggedIn, login, logout, favorites, toggleFavorite, user } = usePublicAuth();
  const [lang, setLang] = useState("id");

  if (!isLoggedIn) {
    return (
      <div className="pub-section pub-section--center">
        <div className="pub-login-card">
          <div className="pub-login-card__icon">
            <Icon name="settings" size={22} />
          </div>
          <h2>Masuk untuk mengatur akun</h2>
          <p>Pengaturan favorit, notifikasi, dan bahasa hanya tersedia setelah kamu masuk.</p>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={login}>
            Masuk (mock)
          </button>
          <p className="pub-login-card__footnote">Belum punya akun? Mendaftar hanya butuh beberapa detik.</p>
        </div>
      </div>
    );
  }

  const favoriteSites = SITES.filter((s) => favorites.includes(s.id));

  return (
    <div className="pub-section">
      <div className="pub-hero pub-hero--tight">
        <h1>Pengaturan</h1>
        <p>Masuk sebagai {user.name}</p>
      </div>

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">Lokasi Favorit</span>
        </div>
        {favoriteSites.length === 0 ? (
          <div className="pub-empty">Belum ada lokasi favorit.</div>
        ) : (
          <div className="pub-settings-list">
            {favoriteSites.map((s) => (
              <div key={s.id} className="pub-settings-row">
                <StatusBadge level={s.status} locale="id" size="sm" />
                <div className="pub-site-row__body">
                  <div className="pub-site-row__name">{s.name}</div>
                  <div className="pub-site-row__meta">Notifikasi</div>
                </div>
                <NotifyToggle siteId={s.id} />
                <button className="pub-icon-btn" onClick={() => toggleFavorite(s.id)} aria-label="Hapus favorit">
                  <Icon name="x" size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">Bahasa</span>
        </div>
        <div className="pill-tabs">
          <button className={lang === "id" ? "active" : ""} onClick={() => setLang("id")}>Bahasa Indonesia</button>
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button>
        </div>
      </div>

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">Akun</span>
        </div>
        <div className="pub-settings-row">
          <div className="pub-site-row__body">
            <div className="pub-site-row__name">{user.name}</div>
            <div className="pub-site-row__meta">{user.email}</div>
          </div>
        </div>
        <button className="btn btn-outline" style={{ width: "100%", marginTop: 12 }} onClick={logout}>
          <Icon name="logout" size={15} /> Keluar
        </button>
      </div>
    </div>
  );
}
