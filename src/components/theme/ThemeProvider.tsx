import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getInitialThemeMode, saveThemePreference } from "./storage";
import { resolveTheme, type EffectiveTheme, type ThemeMode } from "./theme";

type ThemeContextValue = {
  mode: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPrefersDark() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyThemeToDocument(effectiveTheme: EffectiveTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", effectiveTheme);
}

export function getInitialEffectiveTheme() {
  const mode = getInitialThemeMode();
  return resolveTheme(mode, getSystemPrefersDark());
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialThemeMode());
  const [prefersDark, setPrefersDark] = useState<boolean>(() => getSystemPrefersDark());

  const effectiveTheme = useMemo(() => resolveTheme(mode, prefersDark), [mode, prefersDark]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersDark(event.matches);
    };

    setPrefersDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    applyThemeToDocument(effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    saveThemePreference(mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      effectiveTheme,
      setMode,
    }),
    [effectiveTheme, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return value;
}
