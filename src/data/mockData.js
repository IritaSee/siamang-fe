// Hardcoded mock data for the SIAMANG frontend mockup. No API, no backend —
// everything the screens render comes from this file so the click-through
// stays deterministic across reloads.

const NOW = new Date("2026-08-12T03:30:00Z");

// --- tiny seeded PRNG so charts look the same on every render/reload ------
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFromString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}

function isoHoursAgo(hours) {
  return new Date(NOW.getTime() - hours * 3600 * 1000).toISOString();
}
function isoHoursAhead(hours) {
  return new Date(NOW.getTime() + hours * 3600 * 1000).toISOString();
}

// intensity: 0 (calm) -> 1 (severe). Shapes rainfall/water level/flow curves
// so red/black sites visibly trend worse than green sites.
function buildSeries(siteId, intensity) {
  const rand = mulberry32(seedFromString(siteId));
  const nowPoints = [];
  const forecastPoints = [];

  let level = 20 + intensity * 40; // cm baseline water level
  let flow = 8 + intensity * 20; // m3/s baseline

  for (let h = -23; h <= 0; h++) {
    const t = isoHoursAgo(-h);
    const rampFactor = Math.max(0, (h + 23) / 23); // ramps up toward now for higher intensity
    const rain = Math.max(0, rand() * (6 + intensity * 18) * (0.4 + rampFactor * intensity));
    level += (rand() - 0.42 + intensity * 0.35) * 2.2;
    level = Math.max(8, level);
    flow += (rand() - 0.45 + intensity * 0.3) * 1.6;
    flow = Math.max(2, flow);
    nowPoints.push({
      t,
      rainfall: Math.round(rain * 10) / 10,
      waterLevel: Math.round(level * 10) / 10,
      flow: Math.round(flow * 10) / 10,
    });
  }

  for (let h = 1; h <= 12; h++) {
    const t = isoHoursAhead(h);
    const drift = intensity > 0.55 ? 0.9 : intensity > 0.3 ? 0.15 : -0.3;
    const rain = Math.max(0, (rand() - 0.3 + intensity * 0.6) * (5 + intensity * 14));
    level += (rand() - 0.5 + drift * 0.5) * 2.4;
    level = Math.max(8, level);
    flow += (rand() - 0.5 + drift * 0.4) * 1.8;
    flow = Math.max(2, flow);
    forecastPoints.push({
      t,
      rainfall: Math.round(rain * 10) / 10,
      waterLevel: Math.round(level * 10) / 10,
      flow: Math.round(flow * 10) / 10,
    });
  }

  return { now: nowPoints, forecast: forecastPoints };
}

const INTENSITY_BY_STATUS = { green: 0.1, yellow: 0.35, orange: 0.55, red: 0.85, black: 0.5 };

// --- sites ------------------------------------------------------------
export const SITES = [
  { id: "site-01", name: "Krueng Aceh - Hulu", basin: "Krueng Aceh", province: "Aceh", position: "upstream", lat: 5.352, lng: 95.552, status: "yellow", lastUpdated: isoHoursAgo(0.4) },
  { id: "site-02", name: "Krueng Aceh - Tengah", basin: "Krueng Aceh", province: "Aceh", position: "midstream", lat: 5.451, lng: 95.447, status: "black", lastUpdated: isoHoursAgo(2.6) },
  { id: "site-03", name: "Krueng Aceh - Hilir", basin: "Krueng Aceh", province: "Aceh", position: "downstream", lat: 5.552, lng: 95.318, status: "green", lastUpdated: isoHoursAgo(0.1) },
  { id: "site-04", name: "Krueng Peusangan - Hulu", basin: "Krueng Peusangan", province: "Aceh", position: "upstream", lat: 4.752, lng: 96.851, status: "green", lastUpdated: isoHoursAgo(0.3) },
  { id: "site-05", name: "Krueng Peusangan - Hilir", basin: "Krueng Peusangan", province: "Aceh", position: "downstream", lat: 5.204, lng: 96.701, status: "orange", lastUpdated: isoHoursAgo(0.2) },
  { id: "site-06", name: "Batang Anai - Hulu", basin: "Batang Anai", province: "West Sumatra", position: "upstream", lat: -0.632, lng: 100.418, status: "green", lastUpdated: isoHoursAgo(0.5) },
  { id: "site-07", name: "Batang Anai - Tengah", basin: "Batang Anai", province: "West Sumatra", position: "midstream", lat: -0.551, lng: 100.383, status: "yellow", lastUpdated: isoHoursAgo(0.3) },
  { id: "site-08", name: "Batang Anai - Hilir", basin: "Batang Anai", province: "West Sumatra", position: "downstream", lat: -0.468, lng: 100.323, status: "red", lastUpdated: isoHoursAgo(0.05) },
  { id: "site-09", name: "Batang Kuranji - Hulu", basin: "Batang Kuranji", province: "West Sumatra", position: "upstream", lat: -0.921, lng: 100.451, status: "green", lastUpdated: isoHoursAgo(0.6) },
  { id: "site-10", name: "Batang Kuranji - Hilir", basin: "Batang Kuranji", province: "West Sumatra", position: "downstream", lat: -0.933, lng: 100.382, status: "orange", lastUpdated: isoHoursAgo(0.2) },
  { id: "site-11", name: "Sungai Deli - Hulu", basin: "Sungai Deli", province: "North Sumatra", position: "upstream", lat: 3.352, lng: 98.548, status: "yellow", lastUpdated: isoHoursAgo(0.4) },
  { id: "site-12", name: "Sungai Deli - Tengah", basin: "Sungai Deli", province: "North Sumatra", position: "midstream", lat: 3.552, lng: 98.617, status: "green", lastUpdated: isoHoursAgo(0.2) },
  { id: "site-13", name: "Sungai Deli - Hilir", basin: "Sungai Deli", province: "North Sumatra", position: "downstream", lat: 3.701, lng: 98.679, status: "black", lastUpdated: isoHoursAgo(3.9) },
  { id: "site-14", name: "Sungai Wampu - Hulu", basin: "Sungai Wampu", province: "North Sumatra", position: "upstream", lat: 3.352, lng: 98.152, status: "green", lastUpdated: isoHoursAgo(0.4) },
  { id: "site-15", name: "Sungai Wampu - Hilir", basin: "Sungai Wampu", province: "North Sumatra", position: "downstream", lat: 4.002, lng: 98.251, status: "green", lastUpdated: isoHoursAgo(0.7) },
];

export const PROVINCES = [...new Set(SITES.map((s) => s.province))];
export const BASINS = [...new Set(SITES.map((s) => s.basin))];

export const SITE_SERIES = Object.fromEntries(
  SITES.map((s) => [s.id, buildSeries(s.id, INTENSITY_BY_STATUS[s.status] ?? 0.2)])
);

export function siteById(id) {
  return SITES.find((s) => s.id === id);
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Great-circle distance in km between two lat/lng points.
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Nearest known monitoring site to an arbitrary point, or null if no
// coordinates are available (e.g. a citizen report where geolocation was
// denied). Used to give a citizen report context without requiring the
// reporter to know which official site they're near — a report with no
// nearby site is itself a signal of a monitoring coverage gap.
export function nearestSite(lat, lng) {
  if (lat == null || lng == null) return null;
  let best = null;
  for (const site of SITES) {
    const distanceKm = haversineKm(lat, lng, site.lat, site.lng);
    if (!best || distanceKm < best.distanceKm) best = { site, distanceKm: Math.round(distanceKm * 10) / 10 };
  }
  return best;
}

// --- devices / nodes ----------------------------------------------------
const DEVICE_TYPES = ["Water Level Sensor (AWLR)", "Rain Gauge (ARR)", "EWS Siren"];

export const DEVICES = SITES.flatMap((site, si) => {
  const count = site.position === "midstream" ? 3 : 2;
  return Array.from({ length: count }, (_, i) => {
    const type = DEVICE_TYPES[i % DEVICE_TYPES.length];
    const isSilent = site.status === "black" && i === 0;
    const battery = isSilent ? Math.round(8 + (si % 4)) : Math.round(48 + ((si * 7 + i * 13) % 50));
    return {
      id: `dev-${site.id}-${i + 1}`,
      siteId: site.id,
      site: site.name,
      serial: `SMG-${site.province.slice(0, 2).toUpperCase()}-${String(si + 1).padStart(2, "0")}${i + 1}`,
      type,
      status: isSilent ? "black" : site.status === "black" ? "yellow" : site.status,
      lastContact: isSilent ? isoHoursAgo(2.6 + i) : isoHoursAgo(0.1 + i * 0.15),
      battery,
    };
  });
});

export function devicesForSite(siteId) {
  return DEVICES.filter((d) => d.siteId === siteId);
}

// 14-day battery/signal history per device, for the Device Detail health chart.
function buildDeviceHealth(device) {
  const rand = mulberry32(seedFromString(device.id));
  const isSilent = device.status === "black";
  const points = [];
  let battery = Math.min(100, device.battery + 18);
  let signal = 62 + rand() * 25;
  for (let d = -13; d <= 0; d++) {
    const t = new Date(NOW.getTime() + d * 86400000).toISOString();
    battery -= rand() * 1.7;
    battery = Math.max(device.battery, Math.round(battery));
    if (isSilent && d >= -2) {
      // signal collapses over the final ~2 days leading into the outage
      signal = Math.max(0, signal - (30 + rand() * 15));
    } else {
      signal += (rand() - 0.5) * 12;
      signal = Math.min(100, Math.max(30, signal));
    }
    points.push({ t, battery, signal: Math.round(signal) });
  }
  return points;
}

export const DEVICE_HEALTH = Object.fromEntries(DEVICES.map((d) => [d.id, buildDeviceHealth(d)]));

// --- warnings -------------------------------------------------------------
export const WARNINGS = [
  {
    id: "w-01",
    siteId: "site-08",
    status: "red",
    source: "central_forecast",
    triggeredAt: isoHoursAgo(0.9),
    resolved: false,
    dissemination: [
      { point: "Masjid Al-Ikhlas, Ketaping", channel: "UHF/AM-FM Siren", status: "confirmed" },
      { point: "Balai Desa Ketaping", channel: "SMS Blast", status: "confirmed" },
      { point: "Posko BPBD Padang Pariaman", channel: "Radio Komunikasi", status: "pending" },
    ],
    history: [
      { action: "Warning triggered by central forecast model", by: "system", at: isoHoursAgo(0.9) },
      { action: "Escalated to RED by duty operator", by: "Rian Saputra (BPBD Sumbar)", at: isoHoursAgo(0.6) },
      { action: "Loudspeaker dissemination confirmed at 2/3 points", by: "system", at: isoHoursAgo(0.3) },
    ],
  },
  {
    id: "w-02",
    siteId: "site-13",
    status: "black",
    source: "liveness_monitor",
    triggeredAt: isoHoursAgo(3.9),
    resolved: false,
    dissemination: [],
    history: [{ action: "Node liveness check failed — no heartbeat for 3+ hours", by: "system", at: isoHoursAgo(3.9) }],
  },
  {
    id: "w-03",
    siteId: "site-02",
    status: "black",
    source: "liveness_monitor",
    triggeredAt: isoHoursAgo(2.6),
    resolved: false,
    dissemination: [],
    history: [{ action: "Node liveness check failed — no heartbeat for 2+ hours", by: "system", at: isoHoursAgo(2.6) }],
  },
  {
    id: "w-04",
    siteId: "site-05",
    status: "orange",
    source: "sensor_threshold",
    triggeredAt: isoHoursAgo(1.4),
    resolved: false,
    dissemination: [{ point: "Balai Desa Peusangan Hilir", channel: "SMS Blast", status: "confirmed" }],
    history: [
      { action: "Water level crossed ALERT threshold (210cm)", by: "system", at: isoHoursAgo(1.4) },
      { action: "Manual confirmation by duty operator", by: "Siti Rahma (BPBD Aceh)", at: isoHoursAgo(1.1) },
    ],
  },
  {
    id: "w-05",
    siteId: "site-10",
    status: "orange",
    source: "sensor_threshold",
    triggeredAt: isoHoursAgo(2.1),
    resolved: false,
    dissemination: [{ point: "Kelurahan Kuranji", channel: "UHF/AM-FM Siren", status: "confirmed" }],
    history: [{ action: "Water level crossed ALERT threshold (185cm)", by: "system", at: isoHoursAgo(2.1) }],
  },
  {
    id: "w-06",
    siteId: "site-08",
    status: "yellow",
    source: "sensor_threshold",
    triggeredAt: isoHoursAgo(6.5),
    resolved: true,
    resolvedAt: isoHoursAgo(4.8),
    dissemination: [{ point: "Balai Desa Ketaping", channel: "SMS Blast", status: "confirmed" }],
    history: [
      { action: "Water level crossed WATCH threshold (140cm)", by: "system", at: isoHoursAgo(6.5) },
      { action: "Downgraded — level receded below threshold", by: "Rian Saputra (BPBD Sumbar)", at: isoHoursAgo(4.8) },
    ],
  },
  {
    id: "w-07",
    siteId: "site-01",
    status: "yellow",
    source: "sensor_threshold",
    triggeredAt: isoHoursAgo(1.1),
    resolved: false,
    dissemination: [],
    history: [{ action: "Rainfall accumulation crossed WATCH threshold (35mm/3h)", by: "system", at: isoHoursAgo(1.1) }],
  },
  {
    id: "w-08",
    siteId: "site-11",
    status: "yellow",
    source: "manual",
    triggeredAt: isoHoursAgo(9.2),
    resolved: true,
    resolvedAt: isoHoursAgo(7.5),
    dissemination: [{ point: "Posko Sibolangit", channel: "Radio Komunikasi", status: "confirmed" }],
    history: [
      { action: "Manually triggered ahead of forecast heavy rain", by: "Dedi Kurniawan (BMKG)", at: isoHoursAgo(9.2) },
      { action: "Cancelled — rain did not materialize", by: "Dedi Kurniawan (BMKG)", at: isoHoursAgo(7.5) },
    ],
  },
  {
    id: "w-09",
    siteId: "site-07",
    status: "yellow",
    source: "citizen_report",
    originReportId: "cr-05",
    triggeredAt: isoHoursAgo(1.5),
    resolved: false,
    dissemination: [{ point: "Balai Desa Batang Anai Tengah", channel: "SMS Blast", status: "confirmed" }],
    history: [
      { action: "Citizen report received near SD Negeri 05 Batang Anai", by: "system", at: isoHoursAgo(1.7) },
      { action: "Warning created from a citizen report", by: "Rian Saputra (BPBD Sumbar)", at: isoHoursAgo(1.5) },
    ],
  },
];

export function warningsForSite(siteId) {
  return WARNINGS.filter((w) => w.siteId === siteId).sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));
}

// --- users (operator console, admin only) ---------------------------------
export const USERS = [
  { id: "u-1", name: "Rian Saputra", email: "rian.saputra@bpba.go.id", role: "Operator", agency: "BPBD Sumatera Barat", lastActive: isoHoursAgo(0.2) },
  { id: "u-2", name: "Siti Rahma", email: "siti.rahma@bpba-aceh.go.id", role: "Operator", agency: "BPBD Aceh", lastActive: isoHoursAgo(0.4) },
  { id: "u-3", name: "Dedi Kurniawan", email: "dedi.kurniawan@bmkg.go.id", role: "Forecaster", agency: "BMKG", lastActive: isoHoursAgo(1.6) },
  { id: "u-4", name: "Putri Wulandari", email: "putri.wulandari@bnpb.go.id", role: "Admin", agency: "BNPB Pusat", lastActive: isoHoursAgo(0.05) },
  { id: "u-5", name: "Ahmad Fauzi", email: "ahmad.fauzi@bpbd-sumut.go.id", role: "Operator", agency: "BPBD Sumatera Utara", lastActive: isoHoursAgo(3.3) },
  { id: "u-6", name: "Nurul Hidayah", email: "nurul.hidayah@bnpb.go.id", role: "Viewer", agency: "BNPB Pusat", lastActive: isoHoursAgo(20) },
];

// --- public platform ---------------------------------------------------
export const PUBLIC_FAVORITES = ["site-08", "site-01", "site-11"];

export const PUBLIC_ALERTS = [
  { id: "pa-1", siteId: "site-08", status: "red", title: "Status AWAS di Batang Anai - Hilir", message: "Ketinggian air naik cepat. Warga di sekitar bantaran sungai diminta segera menuju titik evakuasi terdekat.", time: isoHoursAgo(0.9) },
  { id: "pa-2", siteId: "site-05", status: "orange", title: "Status SIAGA di Krueng Peusangan - Hilir", message: "Ketinggian air melewati ambang siaga. Warga diminta waspada dan memantau perkembangan.", time: isoHoursAgo(1.4) },
  { id: "pa-3", siteId: "site-10", status: "orange", title: "Status SIAGA di Batang Kuranji - Hilir", message: "Ketinggian air melewati ambang siaga akibat hujan deras di hulu.", time: isoHoursAgo(2.1) },
  { id: "pa-4", siteId: "site-01", status: "yellow", title: "Status WASPADA di Krueng Aceh - Hulu", message: "Curah hujan tinggi terdeteksi di titik pemantauan hulu. Tetap pantau informasi terbaru.", time: isoHoursAgo(1.1) },
  { id: "pa-5", siteId: "site-13", status: "black", title: "Sensor Tidak Merespons di Sungai Deli - Hilir", message: "Sensor di titik ini tidak mengirim data sejak beberapa jam lalu. Tim teknis sedang memeriksa.", time: isoHoursAgo(3.9) },
  { id: "pa-6", siteId: "site-08", status: "yellow", title: "[Selesai] Status WASPADA di Batang Anai - Hilir", message: "Ketinggian air telah kembali normal.", time: isoHoursAgo(4.8) },
];

// --- citizen reports ----------------------------------------------------
// Deterministic inline SVG placeholder so seed reports have "photos" without
// needing binary image assets in the repo. Colour is seeded per report/photo
// so it stays reload-stable, same convention as buildSeries/buildDeviceHealth.
function placeholderPhoto(seed, idx) {
  const rand = mulberry32(seedFromString(`${seed}-photo-${idx}`));
  const hue = Math.round(rand() * 360);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180"><rect width="240" height="180" fill="hsl(${hue},45%,55%)"/><rect width="240" height="56" y="124" fill="hsl(${hue},45%,32%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const CITIZEN_REPORT_SEEDS = [
  {
    id: "cr-01",
    reporter: null,
    locationDetail: "Dekat jembatan gantung, RT03 Ketaping, sekitar 500m dari Balai Desa",
    description: "Air sungai naik cepat dalam 30 menit terakhir, beberapa rumah di bantaran mulai kemasukan air.",
    photoCount: 2,
    geolocation: { status: "granted", lat: -0.4706, lng: 100.3301, accuracyMeters: 15 },
    connection: { supported: true, effectiveType: "4g", downlinkMbps: 7.1, saveData: false },
    battery: { simulated: true, levelPercent: 54 },
    workflowStatus: "new",
    escalatedWarningId: null,
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: null,
    submittedAt: isoHoursAgo(0.4),
  },
  {
    id: "cr-02",
    reporter: { name: "Akun Warga Contoh", email: "warga@example.id" },
    locationDetail: "Sekitar Krueng Peusangan Hilir, dekat Balai Desa Peusangan Hilir",
    description: "Air terlihat keruh dan naik pelan sejak sore, belum masuk ke pemukiman.",
    photoCount: 1,
    geolocation: { status: "denied", lat: null, lng: null, accuracyMeters: null },
    connection: { supported: false, effectiveType: null, downlinkMbps: null, saveData: null },
    battery: { simulated: true, levelPercent: 68 },
    workflowStatus: "reviewed",
    escalatedWarningId: null,
    reviewedBy: "Siti Rahma (BPBD Aceh)",
    reviewedAt: isoHoursAgo(4.8),
    reviewNote: "Dicatat sebagai pemantauan tambahan, belum memenuhi ambang siaga.",
    submittedAt: isoHoursAgo(5.5),
  },
  {
    id: "cr-03",
    reporter: null,
    locationDetail: "Kampung Alahan Panjang, dekat Danau Diatas, jauh dari pos pemantauan",
    description: "Longsor kecil menutup sebagian jalan setelah hujan deras semalaman, sungai kecil di dekat kampung meluap.",
    photoCount: 1,
    geolocation: { status: "granted", lat: -1.08, lng: 100.72, accuracyMeters: 32 },
    connection: { supported: true, effectiveType: "3g", downlinkMbps: 0.6, saveData: true },
    battery: { simulated: true, levelPercent: 12 },
    workflowStatus: "verified",
    escalatedWarningId: null,
    reviewedBy: "Rian Saputra (BPBD Sumbar)",
    reviewedAt: isoHoursAgo(6.5),
    reviewNote: "Dikonfirmasi lewat telepon dengan pelapor, kondisi sesuai laporan. Tim lapangan dikirim.",
    submittedAt: isoHoursAgo(8.0),
  },
  {
    id: "cr-04",
    reporter: null,
    locationDetail: "Belakang Puskesmas, dekat titik pemantauan Krueng Aceh Hulu",
    description: "Ada genangan air cukup besar di halaman, khawatir itu luapan sungai.",
    photoCount: 1,
    geolocation: { status: "granted", lat: 5.355, lng: 95.548, accuracyMeters: 20 },
    connection: { supported: true, effectiveType: "4g", downlinkMbps: 5.5, saveData: false },
    battery: { simulated: true, levelPercent: 76 },
    workflowStatus: "dismissed",
    escalatedWarningId: null,
    reviewedBy: "Siti Rahma (BPBD Aceh)",
    reviewedAt: isoHoursAgo(2.5),
    reviewNote: "Setelah dicek petugas, itu genangan air hujan biasa, bukan luapan sungai.",
    submittedAt: isoHoursAgo(3.2),
  },
  {
    id: "cr-05",
    reporter: null,
    locationDetail: "Dekat SD Negeri 05 Batang Anai, jalan utama menuju Tengah",
    description: "Air mulai menggenangi jalan dan halaman sekolah, warga sekitar mulai waspada.",
    photoCount: 2,
    geolocation: { status: "granted", lat: -0.548, lng: 100.379, accuracyMeters: 12 },
    connection: { supported: true, effectiveType: "4g", downlinkMbps: 4.2, saveData: false },
    battery: { simulated: true, levelPercent: 63 },
    workflowStatus: "escalated",
    escalatedWarningId: "w-09",
    reviewedBy: "Rian Saputra (BPBD Sumbar)",
    reviewedAt: isoHoursAgo(1.5),
    reviewNote: "Dikonfirmasi sesuai kondisi sensor, ditingkatkan menjadi peringatan resmi.",
    submittedAt: isoHoursAgo(1.7),
  },
];

export const CITIZEN_REPORTS = CITIZEN_REPORT_SEEDS.map((r) => {
  const { geolocation, connection, battery, photoCount, ...rest } = r;
  const nearest = nearestSite(geolocation.lat, geolocation.lng);
  return {
    ...rest,
    nearestSiteId: nearest?.site.id ?? null,
    nearestSiteDistanceKm: nearest?.distanceKm ?? null,
    photos: Array.from({ length: photoCount }, (_, i) => ({ id: `${r.id}-photo-${i}`, url: placeholderPhoto(r.id, i) })),
    deviceMeta: { geolocation, connection, battery },
  };
});

export function timeAgo(iso, locale = "en") {
  const diffMs = NOW.getTime() - new Date(iso).getTime();
  const mins = Math.round(Math.abs(diffMs) / 60000);
  const future = diffMs < 0;
  let text;
  if (mins < 60) text = `${mins}m`;
  else if (mins < 60 * 24) text = `${Math.round(mins / 60)}h`;
  else text = `${Math.round(mins / 1440)}d`;
  if (locale === "id") return future ? `dalam ${text}` : `${text} lalu`;
  return future ? `in ${text}` : `${text} ago`;
}

export function formatClock(iso) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

// Full date + time, for contexts where a fuzzy "X ago" label isn't precise
// enough — e.g. triaging an unverified citizen report, where an operator
// needs to know exactly when it came in. Reuses formatClock's colon-separated
// time (id-ID would otherwise render "03.30" with a period) and only lets
// locale vary the month name.
export function formatDateTime(iso, locale = "en") {
  const datePart = new Date(iso).toLocaleDateString(locale === "id" ? "id-ID" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${datePart}, ${formatClock(iso)}`;
}

export const NOW_ISO = NOW.toISOString();
