import { describe, expect, test } from "vitest";
import { advanceDifficultyOnCorrect, createInitialDifficultyState } from "./difficulty";
import { createSeededRng } from "./rng";

describe("difficulty ramp", () => {
  test("threshold increments are always 2 or 3", () => {
    const rng = createSeededRng(42);
    let state = createInitialDifficultyState(rng, 1);
    const thresholdDiffs: number[] = [state.nextThreshold];

    for (let totalCorrect = 1; totalCorrect <= 50; totalCorrect += 1) {
      const next = advanceDifficultyOnCorrect(state, totalCorrect, rng);
      if (next.level > state.level) {
        thresholdDiffs.push(next.nextThreshold - state.nextThreshold);
      }
      state = next;
    }

    thresholdDiffs.forEach((value) => {
      expect([2, 3]).toContain(value);
    });
  });

  test("same seed yields deterministic progression", () => {
    const totals = Array.from({ length: 25 }, (_, index) => index + 1);

    const rngA = createSeededRng(101);
    const rngB = createSeededRng(101);
    let stateA = createInitialDifficultyState(rngA, 1);
    let stateB = createInitialDifficultyState(rngB, 1);

    const levelsA: number[] = [];
    const levelsB: number[] = [];

    totals.forEach((totalCorrect) => {
      stateA = advanceDifficultyOnCorrect(stateA, totalCorrect, rngA);
      stateB = advanceDifficultyOnCorrect(stateB, totalCorrect, rngB);
      levelsA.push(stateA.level);
      levelsB.push(stateB.level);
    });

    expect(levelsA).toEqual(levelsB);
    expect(levelsA.some((level) => level > 1)).toBe(true);
  });
});
