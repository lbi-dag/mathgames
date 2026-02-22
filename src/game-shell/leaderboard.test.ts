import { describe, expect, test } from "vitest";
import {
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
    expect(getBestScore("exponent-sprint", "sprint", storage)).toBe(0);

    saveBestScore("exponent-sprint", "sprint", 9, storage);
    saveBestScore("exponent-sprint", "sprint", 7, storage);
    expect(getBestScore("exponent-sprint", "sprint", storage)).toBe(9);

    saveBestScore("exponent-sprint", "survival", 4, storage);
    expect(getBestScore("exponent-sprint", "survival", storage)).toBe(4);

    resetBestScore("exponent-sprint", "survival", storage);
    expect(getBestScore("exponent-sprint", "survival", storage)).toBe(0);
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
    expect(data.scores["exponent-sprint|sprint"]).toBe(6);
    expect(data.scores["number-sense-sprint|sprint"]).toBe(8);
    expect(data.scores["number-sense-sprint|survival"]).toBe(5);
  });
});

describe("sprint duration preferences", () => {
  test("persists preferred sprint minutes per game", () => {
    const storage = createMockStorage();
    expect(getSprintMinutesForGame("number-sense-sprint", storage)).toBe(1);

    setSprintMinutesForGame("number-sense-sprint", 5, storage);
    expect(getSprintMinutesForGame("number-sense-sprint", storage)).toBe(5);
    expect(getSprintMinutesForGame("exponent-sprint", storage)).toBe(1);
  });
});
