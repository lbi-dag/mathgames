import { describe, expect, test } from "vitest";
import { generateNumberSenseExamSet, numberSenseGameDefinition } from "../games/number-sense/definition";
import { speedArithmeticGameDefinition } from "../games/speed-arithmetic/definition";
import { createExamSession, createExamSlotsFromSeed, createRunSessionFromSeed, createSessionSeed } from "./session";

function sampleRng(rng: () => number, count = 4) {
  return Array.from({ length: count }, () => rng());
}

describe("session helpers", () => {
  test("normalizes timestamps into unsigned 32-bit seeds", () => {
    expect(createSessionSeed(0x1_0000_0005)).toBe(5);
  });

  test("same seed yields the same run start state", () => {
    const first = createRunSessionFromSeed(speedArithmeticGameDefinition, 12345);
    const second = createRunSessionFromSeed(speedArithmeticGameDefinition, 12345);

    expect({
      seed: first.seed,
      initialQuestion: first.initialQuestion,
      initialDifficultyLevel: first.initialDifficultyLevel,
      nextDifficultyThreshold: first.nextDifficultyThreshold,
      nextRngValues: sampleRng(first.rng),
    }).toEqual({
      seed: second.seed,
      initialQuestion: second.initialQuestion,
      initialDifficultyLevel: second.initialDifficultyLevel,
      nextDifficultyThreshold: second.nextDifficultyThreshold,
      nextRngValues: sampleRng(second.rng),
    });
  });

  test("same timestamp yields the same custom exam session", () => {
    const first = createExamSession({
      definition: numberSenseGameDefinition,
      totalQuestions: 80,
      generateQuestionSet: generateNumberSenseExamSet,
      timestamp: 20260310,
    });
    const second = createExamSession({
      definition: numberSenseGameDefinition,
      totalQuestions: 80,
      generateQuestionSet: generateNumberSenseExamSet,
      timestamp: 20260310,
    });

    expect(second).toEqual(first);
  });

  test("generic exam fallback stays deterministic for the same seed", () => {
    const first = createExamSlotsFromSeed({
      definition: speedArithmeticGameDefinition,
      seed: 9876,
      totalQuestions: 12,
    });
    const second = createExamSlotsFromSeed({
      definition: speedArithmeticGameDefinition,
      seed: 9876,
      totalQuestions: 12,
    });

    expect(second).toEqual(first);
  });
});
