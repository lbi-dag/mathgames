import { isThemeMode, type ThemeMode } from "./theme";

export const THEME_STORAGE_KEY = "mathgames.ui.theme";

export type ThemePreferenceV1 = {
  version: 1;
  mode: ThemeMode;
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const DEFAULT_THEME_PREFERENCE: ThemePreferenceV1 = {
  version: 1,
  mode: "system",
};

function getStorage(storage?: StorageLike) {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function readThemePreference(storage?: StorageLike): ThemePreferenceV1 {
  const target = getStorage(storage);
  if (!target) return { ...DEFAULT_THEME_PREFERENCE };

  const raw = target.getItem(THEME_STORAGE_KEY);
  if (!raw) return { ...DEFAULT_THEME_PREFERENCE };

  try {
    const parsed = JSON.parse(raw) as Partial<ThemePreferenceV1>;
    if (parsed.version !== 1 || !isThemeMode(parsed.mode)) {
      return { ...DEFAULT_THEME_PREFERENCE };
    }

    return { version: 1, mode: parsed.mode };
  } catch {
    return { ...DEFAULT_THEME_PREFERENCE };
  }
}

export function saveThemePreference(mode: ThemeMode, storage?: StorageLike) {
  const target = getStorage(storage);
  if (!target) return;

  const next: ThemePreferenceV1 = {
    version: 1,
    mode,
  };

  target.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
}

export function getInitialThemeMode(storage?: StorageLike): ThemeMode {
  return readThemePreference(storage).mode;
}
