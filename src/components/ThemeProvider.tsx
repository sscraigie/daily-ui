"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextValue = {
  setDark: (dark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Wraps the whole app. Site-wide dark mode defaults to off (light mode).
 * Individual pages can opt in to dark mode by rendering <RequireDarkMode />
 * (see below), which flips it on while mounted and reverts to light mode
 * as soon as the page unmounts (e.g. navigating back to "/" or "/portfolio").
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ setDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useDarkMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useDarkMode must be used within a ThemeProvider");
  }
  return ctx;
};

/**
 * Drop this into any /day/[n]/page.tsx that requires dark mode:
 *
 *   import { RequireDarkMode } from "@/components/ThemeProvider";
 *   ...
 *   <RequireDarkMode />
 *
 * It renders nothing - it just toggles the site's dark mode on while the
 * page is mounted, and back off when the user navigates away.
 */
export const RequireDarkMode = () => {
  const { setDark } = useDarkMode();

  useEffect(() => {
    setDark(true);
    return () => setDark(false);
  }, [setDark]);

  return null;
};
