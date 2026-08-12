import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import LanguageToggle from "../components/LanguageToggle";
import { usePublicAuth } from "../public/PublicAuthContext";
import LoginPromptModal from "../public/LoginPromptModal";
import { useLanguage } from "../i18n/LanguageContext";
import "./PublicLayout.css";
import "../public/public.css";

const TABS = [
  { to: "/public", end: true, icon: "home", label: { id: "Beranda", en: "Home" } },
  { to: "/public/map", icon: "map", label: { id: "Peta", en: "Map" } },
  { to: "/public/alerts", icon: "bell", label: { id: "Peringatan", en: "Alerts" } },
  { to: "/public/settings", icon: "settings", label: { id: "Pengaturan", en: "Settings" } },
];

export default function PublicLayout() {
  const { isLoggedIn, logout } = usePublicAuth();
  const { locale } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <div className="pub-frame">
        <header className="pub-topbar">
          <Link to="/public" className="pub-topbar__brand">
            <svg width="22" height="22" viewBox="0 0 64 64">
              <rect width="64" height="64" rx="14" fill="#0b3d66" />
              <path d="M32 12c-8 9-14 17-14 25a14 14 0 0 0 28 0c0-8-6-16-14-25z" fill="#38bdf8" />
              <path d="M32 20c-5 6-9 11-9 16a9 9 0 0 0 18 0c0-5-4-10-9-16z" fill="#e0f2fe" />
            </svg>
            <span>SIAMANG</span>
          </Link>
          <div className="pub-topbar__right">
            <LanguageToggle className="pub-topbar__pill" />
            {isLoggedIn ? (
              <button className="pub-topbar__pill" onClick={logout}>
                <Icon name="logout" size={13} /> {locale === "id" ? "Keluar" : "Logout"}
              </button>
            ) : (
              <button className="pub-topbar__pill pub-topbar__pill--primary" onClick={() => navigate("/public/settings")}>
                {locale === "id" ? "Masuk" : "Sign in"}
              </button>
            )}
          </div>
        </header>

        <main className="pub-content">
          <Outlet />
        </main>

        <nav className="pub-tabbar">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `pub-tab${isActive ? " active" : ""}`}>
              <Icon name={t.icon} size={20} />
              <span>{t.label[locale]}</span>
            </NavLink>
          ))}
        </nav>
        <LoginPromptModal />
      </div>
      <Link to="/" className="pub-exit">
        <Icon name="arrow-left" size={14} /> {locale === "id" ? "Keluar mockup" : "Exit mockup"}
      </Link>
    </div>
  );
}
