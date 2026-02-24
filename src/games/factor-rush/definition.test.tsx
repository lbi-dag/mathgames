import { describe, expect, test } from "vitest";
import { createSeededRng } from "../../game-shell/rng";
import { factorRushGameDefinition } from "./definition";

describe("factor rush game definition", () => {
  test("early difficulty stays within starter prime pool", () => {
    const rng = createSeededRng(15);
    const allowed = new Set([2, 3, 5, 7, 11, 13]);

    for (let i = 0; i < 25; i += 1) {
      const question = factorRushGameDefinition.generateQuestion({
        rng,
        difficultyLevel: 1,
        previousQuestion: null,
      });
      question.factors.forEach((factor) => {
        expect(allowed.has(factor)).toBe(true);
      });
    }
  });

  test("higher difficulty can include larger primes", () => {
    const rng = createSeededRng(9);
    let sawLargePrime = false;

    for (let i = 0; i < 40; i += 1) {
      const question = factorRushGameDefinition.generateQuestion({
        rng,
        difficultyLevel: 4,
        previousQuestion: null,
      });
      if (question.factors.some((factor) => factor > 13)) {
        sawLargePrime = true;
        break;
      }
    }

    expect(sawLargePrime).toBe(true);
  });
});
