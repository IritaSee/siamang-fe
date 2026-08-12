import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageToggle({ className = "" }) {
  const { locale, toggleLocale } = useLanguage();
  const nextLabel = locale === "id" ? "EN" : "ID";
  const ariaLabel = locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia";

  return (
    <button type="button" className={className} onClick={toggleLocale} aria-label={ariaLabel} title={ariaLabel}>
      {nextLabel}
    </button>
  );
}