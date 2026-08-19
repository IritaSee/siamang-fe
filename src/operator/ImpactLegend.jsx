export default function ImpactLegend({ locale = "en" }) {
  return (
    <div className="impact-legend">
      <span className="impact-legend__swatch" aria-hidden="true" />
      <span>
        {locale === "id"
          ? "Area dampak banjir terprediksi (model AI vendor) — ilustratif"
          : "Predicted flood impact area (vendor AI model) — illustrative"}
      </span>
    </div>
  );
}
