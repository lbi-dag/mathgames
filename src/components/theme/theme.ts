export type ThemeMode = "light" | "dark" | "system";
export type EffectiveTheme = "light" | "dark";

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): EffectiveTheme {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }

  return mode;
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}
