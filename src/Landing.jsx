import { Link } from "react-router-dom";
import "./landing.css";

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing__topline">
        <span className="landing__badge">FRONTEND MOCKUP — FOR PROPOSAL REVIEW</span>
      </div>

      <div className="landing__hero">
        <div className="landing__mark">
          <svg width="40" height="40" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#0b3d66" />
            <path d="M32 12c-8 9-14 17-14 25a14 14 0 0 0 28 0c0-8-6-16-14-25z" fill="#38bdf8" />
            <path d="M32 20c-5 6-9 11-9 16a9 9 0 0 0 18 0c0-5-4-10-9-16z" fill="#e0f2fe" />
          </svg>
        </div>
        <h1>SIAMANG</h1>
        <p className="landing__subtitle">
          Sistem Peringatan Dini Banjir Bandang &mdash; flash-flood early warning for pilot river
          basins in Aceh, West Sumatra, and North Sumatra.
        </p>
      </div>

      <div className="landing__cards">
        <Link to="/operator" className="landing__card">
          <div className="landing__card-tag">Operator / Admin Console</div>
          <h2>Operational Service Center</h2>
          <p>
            Desktop, English. Used by BNPB / BPBD / BMKG staff to monitor sites, manage
            warnings, and track device health across all basins.
          </p>
          <span className="landing__card-cta">Open console &rarr;</span>
        </Link>

        <Link to="/public" className="landing__card landing__card--public">
          <div className="landing__card-tag">Public Platform</div>
          <h2>Aplikasi Publik</h2>
          <p>
            Mobile, Bahasa Indonesia. Digunakan oleh masyarakat untuk memantau status
            sungai, menyimpan lokasi favorit, dan menerima peringatan dini.
          </p>
          <span className="landing__card-cta">Buka aplikasi &rarr;</span>
        </Link>
      </div>

      <p className="landing__footnote">
        All data on these screens is mock / hardcoded for demonstration purposes only.
      </p>
    </div>
  );
}
