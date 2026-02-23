import { getInitialThemeMode } from "./storage";
import { resolveTheme, type EffectiveTheme } from "./theme";

export function getSystemPrefersDark() {
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
