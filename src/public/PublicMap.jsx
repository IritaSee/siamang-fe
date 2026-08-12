import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteMap from "../components/SiteMap";
import MapLegend from "../components/MapLegend";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { SITES, timeAgo } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

export default function PublicMap() {
  const { locale } = useLanguage();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const sites = useMemo(
    () => (q.trim() ? SITES.filter((s) => (s.name + s.basin).toLowerCase().includes(q.toLowerCase())) : SITES),
    [q]
  );
  const selectedSite = sites.find((s) => s.id === selected);

  return (
    <div className="pub-map-page">
      <div className="pub-map-search">
        <Icon name="search" size={16} className="muted" />
        <input placeholder={locale === "id" ? "Cari nama sungai atau desa..." : "Search river or village name..."} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <SiteMap
        sites={sites}
        selectedSiteId={selected}
        onSelectSite={setSelected}
        height={330}
        zoom={6}
        locale={locale}
        renderPopupAction={(site) => (
          <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => navigate(`/public/sites/${site.id}`)}>
            {locale === "id" ? "Lihat detail" : "View details"}
          </button>
        )}
      />

      <div className="pub-map-legend-wrap">
        <MapLegend locale={locale} />
      </div>

      {selectedSite ? (
        <button className="pub-site-row pub-site-row--selected" onClick={() => navigate(`/public/sites/${selectedSite.id}`)}>
          <StatusBadge level={selectedSite.status} locale={locale} size="sm" />
          <div className="pub-site-row__body">
            <div className="pub-site-row__name">{selectedSite.name}</div>
            <div className="pub-site-row__meta">{selectedSite.basin} &middot; {timeAgo(selectedSite.lastUpdated, locale)}</div>
          </div>
          <Icon name="chevron-right" size={15} className="muted" />
        </button>
      ) : null}

      <div className="pub-site-list">
        {sites.map((s) => (
          <button key={s.id} className="pub-site-row" onClick={() => navigate(`/public/sites/${s.id}`)}>
            <StatusBadge level={s.status} locale={locale} size="sm" />
            <div className="pub-site-row__body">
              <div className="pub-site-row__name">{s.name}</div>
              <div className="pub-site-row__meta">{s.basin} &middot; {timeAgo(s.lastUpdated, locale)}</div>
            </div>
            <Icon name="chevron-right" size={15} className="muted" />
          </button>
        ))}
        {sites.length === 0 ? <div className="pub-empty">{locale === "id" ? "Tidak ada lokasi yang cocok." : "No matching sites found."}</div> : null}
      </div>
    </div>
  );
}
