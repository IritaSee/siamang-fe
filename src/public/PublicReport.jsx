import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { usePublicAuth } from "./PublicAuthContext";
import { useReports } from "../reports/ReportsContext";
import { useLanguage } from "../i18n/LanguageContext";
import { nearestSite, siteById, formatDateTime } from "../data/mockData";

const MAX_PHOTOS = 3;

// The Network Information API has no permission gate at all (unlike
// geolocation) — it's fine to read passively on mount. Chromium/Android
// only; Safari/Firefox simply don't expose `navigator.connection`.
function readConnection() {
  const conn = typeof navigator !== "undefined" ? navigator.connection || navigator.mozConnection || navigator.webkitConnection : null;
  if (!conn) return { supported: false, effectiveType: null, downlinkMbps: null, saveData: null };
  return {
    supported: true,
    effectiveType: conn.effectiveType ?? null,
    downlinkMbps: typeof conn.downlink === "number" ? conn.downlink : null,
    saveData: !!conn.saveData,
  };
}

export default function PublicReport() {
  const { locale } = useLanguage();
  const { isLoggedIn, user, openLoginPrompt } = usePublicAuth();
  const { addReport } = useReports();
  const navigate = useNavigate();

  const [locationDetail, setLocationDetail] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const [geoState, setGeoState] = useState("idle"); // idle | requesting | granted | denied | unsupported
  const [geolocation, setGeolocation] = useState(null);

  // Read once on mount — no permission dialog exists for this API, so unlike
  // geolocation there's nothing to gate behind a user action.
  const [connection] = useState(readConnection);
  // Deliberate, scoped exception to mockData.js's "no bare Math.random()"
  // rule: that rule protects reload-stable fixtures, this is live ephemeral
  // UI state, clearly labeled as simulated wherever it's shown — the real
  // Battery Status API was removed from browsers for fingerprinting reasons.
  const [batteryPercent] = useState(() => Math.round(15 + Math.random() * 80));

  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setGeoState("unsupported");
      return;
    }
    setGeoState("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeolocation({
          status: "granted",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: Math.round(pos.coords.accuracy),
        });
        setGeoState("granted");
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleFiles(e) {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photos.length);
    const next = files.map((file) => ({ id: `${Date.now()}-${file.name}`, url: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...next].slice(0, MAX_PHOTOS));
    e.target.value = "";
  }

  function removePhoto(id) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  function resetForm() {
    setSubmitted(null);
    setLocationDetail("");
    setDescription("");
    setPhotos([]);
    setGeoState("idle");
    setGeolocation(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) return;
    const report = addReport({
      reporter: isLoggedIn ? { name: user.name, email: user.email } : null,
      locationDetail: locationDetail.trim(),
      description: description.trim(),
      photos: photos.map((p) => ({ id: p.id, url: p.url })),
      geolocation:
        geoState === "granted" && geolocation
          ? geolocation
          : { status: geoState === "unsupported" ? "unavailable" : geoState === "denied" ? "denied" : "not_requested", lat: null, lng: null, accuracyMeters: null },
      connection,
      battery: { simulated: true, levelPercent: batteryPercent },
    });
    setSubmitted(report);
  }

  if (submitted) {
    const nearestSiteName = submitted.nearestSiteId ? siteById(submitted.nearestSiteId)?.name : null;
    return (
      <div className="pub-section pub-section--center">
        <div className="pub-login-card">
          <div className="pub-login-card__icon pub-login-card__icon--success">
            <Icon name="check" size={22} />
          </div>
          <h2>{locale === "id" ? "Laporan diterima" : "Report received"}</h2>
          <p>
            {locale === "id"
              ? "Terima kasih. Laporan Anda membantu tim tanggap darurat menilai situasi di lapangan."
              : "Thank you. Your report helps the emergency response team assess the situation on the ground."}
          </p>
          <div className="pub-report-summary">
            <div className="pub-report-summary__row">
              <span className="field-label">{locale === "id" ? "Terkirim" : "Submitted"}</span>
              <span>{formatDateTime(submitted.submittedAt, locale)}</span>
            </div>
            {nearestSiteName ? (
              <div className="pub-report-summary__row">
                <span className="field-label">{locale === "id" ? "Titik terdekat" : "Closest known site"}</span>
                <span>{nearestSiteName}</span>
              </div>
            ) : null}
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate("/public")}>
            {locale === "id" ? "Kembali ke Beranda" : "Back to Home"}
          </button>
          <button className="btn btn-outline" style={{ width: "100%", marginTop: 8 }} onClick={resetForm}>
            {locale === "id" ? "Laporkan kejadian lain" : "Report another incident"}
          </button>
        </div>
      </div>
    );
  }

  const nearestPreview = geoState === "granted" && geolocation ? nearestSite(geolocation.lat, geolocation.lng) : null;

  return (
    <form className="pub-section" onSubmit={handleSubmit}>
      <div className="pub-hero pub-hero--tight">
        <h1>{locale === "id" ? "Laporkan Kejadian" : "Report an Incident"}</h1>
        <p>
          {locale === "id"
            ? "Ceritakan apa yang kamu lihat. Semua kolom bersifat opsional kecuali deskripsi."
            : "Tell us what you're seeing. Every field is optional except the description."}
        </p>
      </div>

      {isLoggedIn ? (
        <div className="pub-report-login-note">
          <Icon name="check" size={13} /> {locale === "id" ? `Melapor sebagai ${user.name}` : `Reporting as ${user.name}`}
        </div>
      ) : (
        <button type="button" className="pub-cta-card" onClick={openLoginPrompt}>
          <div className="pub-cta-card__icon">
            <Icon name="users" size={18} />
          </div>
          <div className="pub-cta-card__body">
            <div className="pub-cta-card__title">{locale === "id" ? "Melapor tanpa masuk" : "Reporting without signing in"}</div>
            <div className="pub-cta-card__sub">
              {locale === "id" ? "Masuk agar kami bisa menghubungi untuk info lanjutan (opsional)" : "Sign in so we can follow up with you if needed (optional)"}
            </div>
          </div>
          <Icon name="chevron-right" size={16} className="muted" />
        </button>
      )}

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">{locale === "id" ? "Lokasi" : "Location"}</span>
        </div>
        <label className="field-label" htmlFor="report-location">
          {locale === "id" ? "Patokan, nama desa, kecamatan, dll." : "Landmark, village name, sub-district, etc."}
        </label>
        <textarea
          id="report-location"
          className="textarea"
          placeholder={locale === "id" ? "Contoh: dekat jembatan gantung, RT03 Ketaping..." : "e.g. near the suspension bridge, RT03 Ketaping..."}
          value={locationDetail}
          onChange={(e) => setLocationDetail(e.target.value)}
        />

        <button type="button" className="pub-geo-btn" onClick={requestLocation} disabled={geoState === "requesting" || geoState === "granted"}>
          <Icon name="map-pin" size={15} />
          {geoState === "requesting"
            ? locale === "id"
              ? "Meminta izin lokasi..."
              : "Requesting location..."
            : locale === "id"
              ? "Gunakan lokasi saya saat ini"
              : "Use my current location"}
        </button>

        {geoState === "granted" && geolocation ? (
          <div className="pub-geo-result">
            <div className="pub-geo-result__row">
              <span className="meta-flag meta-flag--real">{locale === "id" ? "Lokasi asli" : "Real location"}</span>
              <span className="muted">
                {geolocation.lat.toFixed(4)}, {geolocation.lng.toFixed(4)} (&plusmn;{geolocation.accuracyMeters}m)
              </span>
            </div>
            {nearestPreview ? (
              <div className="muted pub-geo-result__nearest">
                {locale === "id" ? "Titik pemantauan terdekat" : "Closest known monitoring point"}: {nearestPreview.site.name} (~{nearestPreview.distanceKm} km)
              </div>
            ) : (
              <div className="muted pub-geo-result__nearest">
                {locale === "id" ? "Tidak ada titik pemantauan di dekat lokasi ini." : "No known monitoring site is near this location."}
              </div>
            )}
            <button type="button" className="pub-link" onClick={requestLocation}>
              {locale === "id" ? "Perbarui lokasi" : "Refresh location"}
            </button>
          </div>
        ) : null}

        {geoState === "denied" || geoState === "unsupported" ? (
          <div className="pub-geo-denied">
            <Icon name="info" size={14} />
            <span>
              {locale === "id"
                ? "Lokasi tidak tersedia. Laporan tetap bisa dikirim — jelaskan lokasi di kolom di atas."
                : "Location unavailable. You can still submit — describe your location in the field above."}
            </span>
            <button type="button" className="pub-link" onClick={requestLocation}>
              {locale === "id" ? "Coba lagi" : "Try again"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">{locale === "id" ? "Foto" : "Photos"}</span>
        </div>
        <div className="pub-photo-grid">
          {photos.map((p) => (
            <div key={p.id} className="pub-photo-tile pub-photo-tile--filled">
              <img src={p.url} alt="" />
              <button type="button" className="pub-photo-tile__remove" onClick={() => removePhoto(p.id)} aria-label={locale === "id" ? "Hapus foto" : "Remove photo"}>
                <Icon name="x" size={13} />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <button type="button" className="pub-photo-tile pub-photo-tile--add" onClick={() => fileInputRef.current?.click()}>
              <Icon name="camera" size={20} />
              <span>{locale === "id" ? "Tambah foto" : "Add photo"}</span>
            </button>
          ) : null}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple capture="environment" onChange={handleFiles} style={{ display: "none" }} />
      </div>

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">{locale === "id" ? "Deskripsi" : "Description"}</span>
        </div>
        <textarea
          className="textarea"
          required
          placeholder={locale === "id" ? "Apa yang terjadi? Contoh: air mulai masuk ke halaman rumah..." : "What's happening? e.g. water is starting to enter yards..."}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="pub-block">
        <div className="pub-block__head">
          <span className="pub-block__title">{locale === "id" ? "Yang akan kami rekam" : "What we'll capture"}</span>
        </div>
        <div className="pub-meta-card">
          <div className="pub-meta-card__row">
            <div>
              <div className="pub-meta-card__label">{locale === "id" ? "Kualitas koneksi" : "Connection quality"}</div>
              {connection.supported ? (
                <div className="muted" style={{ fontSize: 12 }}>
                  {connection.effectiveType?.toUpperCase()} &middot; {connection.downlinkMbps} Mbps
                </div>
              ) : (
                <div className="muted" style={{ fontSize: 12 }}>{locale === "id" ? "Tidak tersedia di perangkat ini" : "Not available on this device"}</div>
              )}
            </div>
            <span className={`meta-flag meta-flag--${connection.supported ? "real" : "unavailable"}`}>
              {connection.supported ? (locale === "id" ? "Asli" : "Real") : locale === "id" ? "Tidak tersedia" : "Unavailable"}
            </span>
          </div>
          <div className="pub-meta-card__row">
            <div>
              <div className="pub-meta-card__label">{locale === "id" ? "Baterai perangkat" : "Device battery"}</div>
              <div className="muted" style={{ fontSize: 12 }}>{batteryPercent}%</div>
            </div>
            <span className="meta-flag meta-flag--simulated">{locale === "id" ? "Simulasi" : "Simulated"}</span>
          </div>
          <p className="pub-meta-card__note">
            {locale === "id"
              ? "Baterai diperkirakan — browser modern tidak lagi mengizinkan aplikasi web membaca status baterai asli. Aplikasi native dapat membaca ini secara langsung."
              : "Battery is estimated — modern browsers no longer let web apps read real battery status. A native app could read this directly."}
          </p>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={!description.trim()}>
        {locale === "id" ? "Kirim Laporan" : "Submit Report"}
      </button>
    </form>
  );
}
