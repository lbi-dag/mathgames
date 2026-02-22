import { describe, expect, test } from "vitest";
import { getInitialThemeMode, readThemePreference, saveThemePreference, THEME_STORAGE_KEY } from "./storage";

function createMockStorage(initialEntries: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initialEntries));
  return {
    getItem: (key: string) => (map.has(key) ? map.get(key) ?? null : null),
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

describe("theme storage", () => {
  test("defaults to system mode when no storage value exists", () => {
    const storage = createMockStorage();
    expect(readThemePreference(storage).mode).toBe("system");
    expect(getInitialThemeMode(storage)).toBe("system");
  });

  test("persists and reads back theme mode", () => {
    const storage = createMockStorage();
    saveThemePreference("dark", storage);
    expect(readThemePreference(storage).mode).toBe("dark");

    saveThemePreference("light", storage);
    expect(readThemePreference(storage).mode).toBe("light");
  });

  test("falls back to system for invalid or corrupt values", () => {
    const invalidStorage = createMockStorage({
      [THEME_STORAGE_KEY]: JSON.stringify({ version: 1, mode: "unexpected" }),
    });
    expect(readThemePreference(invalidStorage).mode).toBe("system");

    const corruptStorage = createMockStorage({
      [THEME_STORAGE_KEY]: "not-json",
    });
    expect(readThemePreference(corruptStorage).mode).toBe("system");

    const wrongVersionStorage = createMockStorage({
      [THEME_STORAGE_KEY]: JSON.stringify({ version: 2, mode: "dark" }),
    });
    expect(readThemePreference(wrongVersionStorage).mode).toBe("system");
  });
});
