import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvent } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
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
// elongated toward its basin's downstream direction (see
// theme/impactOverlay.js — there's no real elevation data to query here, so
// this is a proxy using the basin's own upstream/downstream site positions).
// Vertex offsets come in as pixels and are placed via the map's own
// layerPoint <-> latLng projection, not a meters/degrees approximation, so
// they stay correct at any zoom without extra math here. The `zoom` state
// itself is only read to force a re-render on zoomend — map.latLngToLayerPoint
// always reflects the map's live state regardless.
function ImpactZones({ sites, impactFootprints }) {
  const map = useMap();
  const [, setZoom] = useState(map.getZoom());
  useMapEvent("zoomend", () => setZoom(map.getZoom()));

  return sites.flatMap((site) => {
    const footprint = impactFootprints[site.id];
    if (!footprint) return [];

    const centerPoint = map.latLngToLayerPoint([site.lat, site.lng]);
    const positions = footprint.jitters.map((jitter, i) => {
      const angle = (i / footprint.vertexCount) * 2 * Math.PI;
      const vx = Math.cos(angle);
      const vy = Math.sin(angle);
      // Vertices pointing toward the flow direction get stretched further
      // out, ones pointing upstream get pulled in — a soft teardrop shape
      // rather than a symmetric blob.
      const alignment = footprint.flowDir ? vx * footprint.flowDir.x + vy * footprint.flowDir.y : 0;
      const elongation = 1 + 0.6 * alignment;
      const r = footprint.radiusPx * jitter * elongation;
      return map.layerPointToLatLng(L.point(centerPoint.x + r * vx, centerPoint.y + r * vy));
    });

    return (
      <Polygon
        key={site.id}
        positions={positions}
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
