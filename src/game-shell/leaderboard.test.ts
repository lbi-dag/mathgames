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

  test("recovers malformed leaderboard JSON by migrating documented legacy scores", () => {
    const storage = createMockStorage({
      [LEADERBOARD_STORAGE_KEY]: "{not valid JSON",
      exponentSprintBestScore: "6",
    });

    const data = readLeaderboard(storage);

    expect(data).toEqual({
      version: 1,
      scores: { "power-blitz|sprint": 6 },
      migratedLegacyKeys: true,
    });
    expect(JSON.parse(storage.getItem(LEADERBOARD_STORAGE_KEY) ?? "")).toEqual(data);
  });

  test("does not overwrite an unsupported leaderboard schema version", () => {
    const unsupportedPayload = JSON.stringify({
      version: 2,
      scores: { "power-blitz|sprint": 12 },
      futureMetadata: { source: "future-release" },
    });
    const storage = createMockStorage({ [LEADERBOARD_STORAGE_KEY]: unsupportedPayload });

    expect(readLeaderboard(storage)).toEqual({
      version: 1,
      scores: {},
      migratedLegacyKeys: true,
    });
    expect(storage.getItem(LEADERBOARD_STORAGE_KEY)).toBe(unsupportedPayload);
  });

  test("does not mutate an unsupported leaderboard schema version", () => {
    const unsupportedPayload = JSON.stringify({
      version: 2,
      scores: { "power-blitz|sprint": 12 },
      futureMetadata: { source: "future-release" },
    });
    const storage = createMockStorage({ [LEADERBOARD_STORAGE_KEY]: unsupportedPayload });

    expect(saveBestScore("power-blitz", "sprint", 13, storage)).toEqual({ updated: false, bestScore: 0 });
    resetBestScore("power-blitz", "sprint", storage);

    expect(storage.getItem(LEADERBOARD_STORAGE_KEY)).toBe(unsupportedPayload);
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

  test("preserves the highest score when legacy aliases and canonical entries collide", () => {
    const storage = createMockStorage({
      [LEADERBOARD_STORAGE_KEY]: JSON.stringify({
        version: 1,
        scores: {
          "power-blitz|sprint": 9,
          "exponent-sprint|sprint": 12,
        },
        migratedLegacyKeys: false,
      }),
      exponentSprintBestScore: "10",
    });

    const data = readLeaderboard(storage);

    expect(data.scores).toEqual({ "power-blitz|sprint": 12 });
  });

  test("preserves signed exam scores while clamping non-exam scores", () => {
    const storage = createMockStorage({
      [LEADERBOARD_STORAGE_KEY]: JSON.stringify({
        version: 1,
        scores: {
          "number-sense|exam": -18,
          "speed-arithmetic|sprint": -5,
        },
        migratedLegacyKeys: true,
      }),
    });

    const data = readLeaderboard(storage);
    expect(data.scores["number-sense|exam"]).toBe(-18);
    expect(data.scores["speed-arithmetic|sprint"]).toBe(0);
  });

  test("stores the highest signed exam score", () => {
    const storage = createMockStorage();

    saveBestScore("number-sense", "exam", -12, storage, { allowNegative: true });
    saveBestScore("number-sense", "exam", -20, storage, { allowNegative: true });
    expect(getBestScore("number-sense", "exam", storage)).toBe(-12);

    saveBestScore("number-sense", "exam", 6, storage, { allowNegative: true });
    expect(getBestScore("number-sense", "exam", storage)).toBe(6);
  });

  test("resets only the selected game and mode", () => {
    const storage = createMockStorage();
    saveBestScore("power-blitz", "sprint", 9, storage);
    saveBestScore("power-blitz", "survival", 4, storage);
    saveBestScore("factor-rush", "sprint", 7, storage);
    saveBestScore("number-sense", "exam", -12, storage, { allowNegative: true });

    resetBestScore("power-blitz", "sprint", storage);

    expect(readLeaderboard(storage).scores).toEqual({
      "power-blitz|survival": 4,
      "factor-rush|sprint": 7,
      "number-sense|exam": -12,
    });
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

  test("keeps one sprint best while the sprint preference changes", () => {
    const storage = createMockStorage();

    setSprintMinutesForGame("power-blitz", 1, storage);
    saveBestScore("power-blitz", "sprint", 8, storage);
    setSprintMinutesForGame("power-blitz", 5, storage);
    saveBestScore("power-blitz", "sprint", 11, storage);

    expect(getSprintMinutesForGame("power-blitz", storage)).toBe(5);
    expect(readLeaderboard(storage).scores).toEqual({ "power-blitz|sprint": 11 });
  });
});
