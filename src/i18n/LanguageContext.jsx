import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "siamang-locale";
const SUPPORTED_LOCALES = ["id", "en"];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window === "undefined") return "id";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "id" ? saved : "id";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      isIndonesian: locale === "id",
      isEnglish: locale === "en",
      setLocale: (nextLocale) => setLocaleState(SUPPORTED_LOCALES.includes(nextLocale) ? nextLocale : "id"),
      toggleLocale: () => setLocaleState((current) => (current === "id" ? "en" : "id")),
    }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}