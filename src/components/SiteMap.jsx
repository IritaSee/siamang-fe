import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import { useEffect } from "react";
import { riskDivIcon } from "./mapIcons";
import StatusBadge from "./StatusBadge";
import "./SiteMap.css";

const POSITION_LABEL = {
  upstream: "hulu",
  midstream: "tengah",
  downstream: "hilir",
};

const TILE_LAYERS = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  // Real contour lines from SRTM elevation data, same {s}/{z}/{x}/{y} scheme
  // as the street tiles above — free, no API key. Operator maps only.
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map display: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  },
};

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.6 });
  }, [center, zoom, map]);
  return null;
}

// Renders each site's predicted-impact zone as a single irregular polygon,
// elongated toward its basin's real downhill direction (see
// theme/impactOverlay.js). `impactFootprints[site.id].positions` are already
// full lat/lng coordinates computed from a fixed real-world meters radius —
// deliberately NOT screen pixels, so Leaflet scales this shape exactly like
// it scales the terrain and markers (shrinks on zoom-out, grows on zoom-in).
// No map/zoom awareness is needed here at all as a result.
function ImpactZones({ sites, impactFootprints }) {
  return sites.flatMap((site) => {
    const footprint = impactFootprints[site.id];
    if (!footprint) return [];
    return (
      <Polygon
        key={site.id}
        positions={footprint.positions}
        pathOptions={{
          fillColor: footprint.fillColor,
          fillOpacity: footprint.fillOpacity,
          color: footprint.strokeColor,
          opacity: footprint.strokeOpacity,
          weight: 1.5,
          interactive: false,
        }}
      />
    );
  });
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
  basemap = "street",
  impactFootprints,
}) {
  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const tile = TILE_LAYERS[basemap] ?? TILE_LAYERS.street;

  return (
    <div className="site-map" style={{ height }}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution={tile.attribution} url={tile.url} />
        {flyToSelected && selectedSite ? <FlyTo center={[selectedSite.lat, selectedSite.lng]} zoom={12} /> : null}
        {impactFootprints ? <ImpactZones sites={sites} impactFootprints={impactFootprints} /> : null}
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
                  {site.basin} &middot; {locale === "id" ? (POSITION_LABEL[site.position] ?? site.position) : site.position}
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
