import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getInitialThemeMode, saveThemePreference } from "./storage";
import { ThemeContext } from "./theme-context";
import { getSystemPrefersDark, applyThemeToDocument } from "./theme-runtime";
import { resolveTheme, type ThemeMode } from "./theme";

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
