import { describe, expect, test } from "vitest";
import { factorRushGameDefinition } from "../games/factor-rush/definition";
import { powerBlitzGameDefinition } from "../games/power-blitz/definition";
import { speedArithmeticGameDefinition } from "../games/speed-arithmetic/definition";
import { target24GameDefinition } from "../games/target-24/definition";
import { assertDefinitionPurity, createReplayTrace, target24CorrectAnswer } from "./replay-test-utils";

const arcadeDefinitions = [
  { definition: speedArithmeticGameDefinition, answerFor: (_question: unknown, label: string) => label },
  { definition: factorRushGameDefinition, answerFor: (_question: unknown, label: string) => label.split(" x ").map(Number) },
  { definition: powerBlitzGameDefinition, answerFor: (_question: unknown, label: string) => label },
  { definition: target24GameDefinition, answerFor: target24CorrectAnswer },
] as const;

describe("seeded arcade replay", () => {
  test.each(arcadeDefinitions)("replays $definition.gameId through adaptive thresholds", ({ definition, answerFor }) => {
    const first = createReplayTrace(definition, 20260318, answerFor, 10);
    const second = createReplayTrace(definition, 20260318, answerFor, 10);

    expect(second).toEqual(first);
    expect(new Set(first.steps.map((step) => step.difficultyLevel)).size).toBeGreaterThan(2);
    expect(first.steps.some((step) => step.nextDifficultyThreshold !== first.nextDifficultyThreshold)).toBe(true);
  });

  test.each(arcadeDefinitions)("$definition.gameId evaluation and presentation leave RNG untouched", ({ definition, answerFor }) => {
    expect(() => assertDefinitionPurity(definition, 20260319, answerFor)).not.toThrow();
  });
});
