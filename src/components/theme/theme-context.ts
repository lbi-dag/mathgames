import { createContext, useContext } from "react";
import type { EffectiveTheme, ThemeMode } from "./theme";

export type ThemeContextValue = {
  mode: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setMode: (mode: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return value;
}
