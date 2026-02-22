import { describe, expect, test } from "vitest";
import { defaultScorePolicy } from "./scorePolicy";
import type { ScorePolicy } from "./types";

const baseContext = {
  currentScore: 5,
  totalCorrect: 5,
  totalAnswered: 8,
  difficultyLevel: 3,
  mode: "sprint" as const,
  timeLeftSec: 20,
};

describe("score policies", () => {
  test("default score policy equals correct answer count delta", () => {
    expect(defaultScorePolicy({ ...baseContext, isCorrect: true })).toBe(1);
    expect(defaultScorePolicy({ ...baseContext, isCorrect: false })).toBe(0);
  });

  test("custom score policy can replace scoring behavior", () => {
    const customPolicy: ScorePolicy = ({ isCorrect, difficultyLevel }) => {
      if (!isCorrect) return -1;
      return difficultyLevel;
    };

    expect(customPolicy({ ...baseContext, isCorrect: true })).toBe(3);
    expect(customPolicy({ ...baseContext, isCorrect: false })).toBe(-1);
  });
});
