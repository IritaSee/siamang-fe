import { useState } from "react";
import { usePublicAuth } from "./PublicAuthContext";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { SITES } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

function NotifyToggle({ siteId, locale }) {
  const [on, setOn] = useState(true);
  return (
    <button className={`pub-switch${on ? " on" : ""}`} onClick={() => setOn((v) => !v)} aria-label={locale === "id" ? "Notifikasi" : "Notifications"}>
      <span className="pub-switch__knob" />
    </button>
  );
}

export default function PublicSettings() {
  const { isLoggedIn, login, logout, favorites, toggleFavorite, user } = usePublicAuth();
  const { locale } = useLanguage();

  if (!isLoggedIn) {
    return (
      <div className="pub-section pub-section--center">
        <div className="pub-login-card">
          <div className="pub-login-card__icon">
            <Icon name="settings" size={22} />
          </div>
          <h2>{locale === "id" ? "Masuk untuk mengatur akun" : "Sign in to manage your account"}</h2>
          <p>{locale === "id" ? "Pengaturan favorit, notifikasi hanya tersedia setelah kamu masuk." : "Favorite and notification settings are only available after you sign in."}</p>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={login}>
            {locale === "id" ? "Masuk (sebagai Akun Warga Contoh)" : "Sign in (sample citizen account)"}
          </button>
          <p className="pub-login-card__footnote">{locale === "id" ? "Belum punya akun? Mendaftar hanya butuh beberapa detik." : "No account yet? Sign-up only takes a few seconds."}</p>
        </div>
      </div>
    );
  }

  const favoriteSites = SITES.filter((s) => favorites.includes(s.id));

  return (
    <div className="pub-section">
      <div className="pub-hero pub-hero--tight">
        <h1>{locale === "id" ? "Pengaturan" : "Settings"}</h1>
        <p>{locale === "id" ? "Masuk sebagai" : "Signed in as"} {user.name}</p>
      </div>

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">{locale === "id" ? "Lokasi Favorit" : "Favorite Locations"}</span>
        </div>
        {favoriteSites.length === 0 ? (
          <div className="pub-empty">{locale === "id" ? "Belum ada lokasi favorit." : "No favorite locations yet."}</div>
        ) : (
          <div className="pub-settings-list">
            {favoriteSites.map((s) => (
              <div key={s.id} className="pub-settings-row">
                <StatusBadge level={s.status} locale={locale} size="sm" />
                <div className="pub-site-row__body">
                  <div className="pub-site-row__name">{s.name}</div>
                  <div className="pub-site-row__meta">{locale === "id" ? "Notifikasi" : "Notifications"}</div>
                </div>
                <NotifyToggle siteId={s.id} locale={locale} />
                <button className="pub-icon-btn" onClick={() => toggleFavorite(s.id)} aria-label={locale === "id" ? "Hapus favorit" : "Remove favorite"}>
                  <Icon name="x" size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>


      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">{locale === "id" ? "Akun" : "Account"}</span>
        </div>
        <div className="pub-settings-row">
          <div className="pub-site-row__body">
            <div className="pub-site-row__name">{user.name}</div>
            <div className="pub-site-row__meta">{user.email}</div>
          </div>
        </div>
        <button className="btn btn-outline" style={{ width: "100%", marginTop: 12 }} onClick={logout}>
          <Icon name="logout" size={15} /> {locale === "id" ? "Keluar" : "Logout"}
        </button>
      </div>
    </div>
  );
}
