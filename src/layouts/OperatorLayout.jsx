import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import Icon from "../components/Icon";
import { WARNINGS, SITES } from "../data/mockData";
import "./OperatorLayout.css";
import "../operator/operator.css";

const NAV = [
  { to: "/operator", end: true, icon: "grid", label: "Dasbor" },
  { to: "/operator/map", icon: "map", label: "Peta / Titik" },
  { to: "/operator/warnings", icon: "bell", label: "Peringatan" },
  { to: "/operator/devices", icon: "cpu", label: "Perangkat" },
  { to: "/operator/users", icon: "users", label: "Pengguna" },
];

export default function OperatorLayout() {
  const location = useLocation();
  const activeWarnings = WARNINGS.filter((w) => !w.resolved).length;
  const silentSites = SITES.filter((s) => s.status === "black").length;
  const current = [...NAV].reverse().find((n) => location.pathname.startsWith(n.to) && (!n.end || location.pathname === n.to));

  return (
    <div className="op-shell">
      <aside className="op-sidebar">
        <Link to="/operator" className="op-sidebar__brand">
          <svg width="26" height="26" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#0b3d66" />
            <path d="M32 12c-8 9-14 17-14 25a14 14 0 0 0 28 0c0-8-6-16-14-25z" fill="#38bdf8" />
            <path d="M32 20c-5 6-9 11-9 16a9 9 0 0 0 18 0c0-5-4-10-9-16z" fill="#e0f2fe" />
          </svg>
          <div>
            <div className="op-sidebar__brand-name">SIAMANG</div>
            <div className="op-sidebar__brand-sub">Konsol Operator</div>
          </div>
        </Link>

        <nav className="op-sidebar__nav">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `op-navitem${isActive ? " active" : ""}`}>
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
              {item.to === "/operator/warnings" && activeWarnings > 0 ? <span className="op-navitem__badge">{activeWarnings}</span> : null}
              {item.to === "/operator/devices" && silentSites > 0 ? <span className="op-navitem__badge op-navitem__badge--muted">{silentSites}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="op-sidebar__footer">
          <Link to="/" className="op-navitem op-navitem--exit">
            <Icon name="arrow-left" size={17} />
            <span>Keluar dari mockup</span>
          </Link>
        </div>
      </aside>

      <div className="op-main">
        <header className="op-topbar">
          <div className="op-topbar__title">{current ? current.label : "Konsol Operator"}</div>
          <div className="op-topbar__right">
            <span className="op-topbar__env">PERCONTOHAN · ACEH / SUMBAR / SUMUT</span>
            <div className="op-topbar__user">
              <div className="op-topbar__avatar">PW</div>
              <div>
                <div className="op-topbar__user-name">Putri Wulandari</div>
                <div className="op-topbar__user-role">Admin &middot; BNPB Pusat</div>
              </div>
            </div>
          </div>
        </header>
        <main className="op-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
