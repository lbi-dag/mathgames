import { describe, expect, test } from "vitest";
import {
  LEADERBOARD_STORAGE_KEY,
  SPRINT_PREFS_STORAGE_KEY,
  getBestScore,
  getSprintMinutesForGame,
  readLeaderboard,
  resetBestScore,
  saveBestScore,
  setSprintMinutesForGame,
} from "./leaderboard";

function createMockStorage(initialEntries: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initialEntries));
  return {
    getItem: (key: string) => (map.has(key) ? map.get(key) ?? null : null),
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

describe("leaderboard storage", () => {
  test("stores highest score per game and mode", () => {
    const storage = createMockStorage();
    expect(getBestScore("power-blitz", "sprint", storage)).toBe(0);

    saveBestScore("power-blitz", "sprint", 9, storage);
    saveBestScore("power-blitz", "sprint", 7, storage);
    expect(getBestScore("power-blitz", "sprint", storage)).toBe(9);

    saveBestScore("power-blitz", "survival", 4, storage);
    expect(getBestScore("power-blitz", "survival", storage)).toBe(4);

    resetBestScore("power-blitz", "survival", storage);
    expect(getBestScore("power-blitz", "survival", storage)).toBe(0);
  });

  test("migrates legacy best keys one time into v1 schema", () => {
    const storage = createMockStorage({
      exponentSprintBestScore: "6",
      "numberSenseBest:sprint": "4",
      numberSenseSprintBestScore: "8",
      "numberSenseBest:survival": "5",
    });

    const data = readLeaderboard(storage);
    expect(data.version).toBe(1);
    expect(data.migratedLegacyKeys).toBe(true);
    expect(data.scores["power-blitz|sprint"]).toBe(6);
    expect(data.scores["speed-arithmetic|sprint"]).toBe(8);
    expect(data.scores["speed-arithmetic|survival"]).toBe(5);
  });

  test("normalizes existing v1 leaderboard entries from old game IDs", () => {
    const storage = createMockStorage({
      [LEADERBOARD_STORAGE_KEY]: JSON.stringify({
        version: 1,
        scores: {
          "number-sense-sprint|sprint": 11,
          "prime-factor-challenge|survival": 3,
          "exponent-sprint|sprint": 7,
        },
        migratedLegacyKeys: true,
      }),
    });

    const data = readLeaderboard(storage);
    expect(data.scores["speed-arithmetic|sprint"]).toBe(11);
    expect(data.scores["factor-rush|survival"]).toBe(3);
    expect(data.scores["power-blitz|sprint"]).toBe(7);
  });
});

describe("sprint duration preferences", () => {
  test("persists preferred sprint minutes per game", () => {
    const storage = createMockStorage({
      [SPRINT_PREFS_STORAGE_KEY]: JSON.stringify({
        version: 1,
        byGame: {
          "number-sense-sprint": 5,
        },
      }),
    });
    expect(getSprintMinutesForGame("speed-arithmetic", storage)).toBe(5);

    setSprintMinutesForGame("speed-arithmetic", 3, storage);
    expect(getSprintMinutesForGame("speed-arithmetic", storage)).toBe(3);
    expect(getSprintMinutesForGame("power-blitz", storage)).toBe(1);
  });
});
