import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { riskDivIcon } from "./mapIcons";
import StatusBadge from "./StatusBadge";
import "./SiteMap.css";

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.6 });
  }, [center, zoom, map]);
  return null;
}

export default function SiteMap({
  sites,
  selectedSiteId,
  onSelectSite,
  height = 420,
  center = [1.6, 99.2],
  zoom = 6,
  locale = "en",
  renderPopupAction,
  flyToSelected = false,
}) {
  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  return (
    <div className="site-map" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {flyToSelected && selectedSite ? <FlyTo center={[selectedSite.lat, selectedSite.lng]} zoom={12} /> : null}
        {sites.map((site) => (
          <Marker
            key={site.id}
            position={[site.lat, site.lng]}
            icon={riskDivIcon(site.status, { size: site.id === selectedSiteId ? 36 : 28, selected: site.id === selectedSiteId })}
            eventHandlers={{ click: () => onSelectSite && onSelectSite(site.id) }}
          >
            <Popup>
              <div className="site-map__popup">
                <div className="site-map__popup-name">{site.name}</div>
                <div className="site-map__popup-meta">
                  {site.basin} &middot; {site.position}
                </div>
                <div style={{ margin: "8px 0" }}>
                  <StatusBadge level={site.status} locale={locale} size="sm" />
                </div>
                {renderPopupAction ? renderPopupAction(site) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
