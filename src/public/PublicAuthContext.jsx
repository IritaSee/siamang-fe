import { createContext, useContext, useMemo, useState } from "react";
import { PUBLIC_FAVORITES } from "../data/mockData";

const PublicAuthContext = createContext(null);

export function PublicAuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Represents this account's saved favorites — persists across login/logout,
  // but only surfaces in the UI while signed in (see `favorites` below).
  const [savedFavorites, setSavedFavorites] = useState(PUBLIC_FAVORITES);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const favorites = isLoggedIn ? savedFavorites : [];

  const value = useMemo(
    () => ({
      isLoggedIn,
      login: () => setIsLoggedIn(true),
      logout: () => setIsLoggedIn(false),
      favorites,
      isFavorite: (siteId) => isLoggedIn && savedFavorites.includes(siteId),
      toggleFavorite: (siteId) => {
        if (!isLoggedIn) {
          setLoginPromptOpen(true);
          return;
        }
        setSavedFavorites((prev) => (prev.includes(siteId) ? prev.filter((id) => id !== siteId) : [...prev, siteId]));
      },
      loginPromptOpen,
      openLoginPrompt: () => setLoginPromptOpen(true),
      closeLoginPrompt: () => setLoginPromptOpen(false),
      user: { name: "Akun Warga Contoh", email: "warga@example.id" },
    }),
    [isLoggedIn, favorites, savedFavorites, loginPromptOpen]
  );

  return <PublicAuthContext.Provider value={value}>{children}</PublicAuthContext.Provider>;
}

export function usePublicAuth() {
  const ctx = useContext(PublicAuthContext);
  if (!ctx) throw new Error("usePublicAuth must be used within PublicAuthProvider");
  return ctx;
}
