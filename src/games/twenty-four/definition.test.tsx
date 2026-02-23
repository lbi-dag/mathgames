import { describe, expect, test } from "vitest";
import { twentyFourGameDefinition } from "./definition";

describe("twenty four game definition", () => {
  test("maps difficulty level to deterministic generation", () => {
    const question = twentyFourGameDefinition.generateQuestion({
      rng: () => 0.99,
      difficultyLevel: 6,
      previousQuestion: null,
    });

    expect(question.numbers.every((value) => value >= 1 && value <= 13)).toBe(true);
  });

  test("validates correct and invalid answers", () => {
    const question = {
      numbers: [3, 3, 8, 8] as [number, number, number, number],
      text: "3 • 3 • 8 • 8",
      solution: "(8/(3-(8/3)))",
    };

    const correct = twentyFourGameDefinition.evaluateAnswer({ question, answer: "8/(3-(8/3))" });
    expect(correct.kind).toBe("correct");

    const invalid = twentyFourGameDefinition.evaluateAnswer({ question, answer: "(8*3)-3" });
    expect(invalid.kind).toBe("invalid");
  });
});
