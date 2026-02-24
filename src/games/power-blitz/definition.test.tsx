import { describe, expect, test } from "vitest";
import { powerBlitzGameDefinition } from "./definition";

describe("power blitz game definition", () => {
  test("difficulty level 1 maps to starter exponents", () => {
    const question = powerBlitzGameDefinition.generateQuestion({
      rng: () => 0.999,
      difficultyLevel: 1,
      previousQuestion: null,
    });
    expect(question.exponent).toBeLessThanOrEqual(3);
  });

  test("higher difficulty unlocks exponent 9 ceiling", () => {
    const question = powerBlitzGameDefinition.generateQuestion({
      rng: () => 0.999,
      difficultyLevel: 7,
      previousQuestion: null,
    });
    expect(question.exponent).toBe(9);
  });
});
