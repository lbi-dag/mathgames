import { describe, expect, test } from "vitest";
import { evaluateTwentyFourExpression, findSolutionExpression, generateQuestionForDifficulty, isTwentyFour } from "./logic";

function createRng(values: number[]) {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

describe("generateQuestionForDifficulty", () => {
  test("produces solvable starter questions", () => {
    const question = generateQuestionForDifficulty(createRng([0.2, 0.3, 0.4, 0.5]), 1);
    expect(findSolutionExpression(question.numbers)).not.toBeNull();
    expect(question.numbers.every((value) => value >= 1 && value <= 6)).toBe(true);
  });

  test("higher difficulties include card-range values", () => {
    const question = generateQuestionForDifficulty(createRng([0.99]), 7);
    expect(question.numbers.every((value) => value >= 1 && value <= 13)).toBe(true);
  });
});

describe("evaluateTwentyFourExpression", () => {
  const question = {
    numbers: [3, 3, 8, 8] as [number, number, number, number],
    text: "3 • 3 • 8 • 8",
    solution: "(8/(3-(8/3)))",
  };

  test("accepts a correct expression", () => {
    const result = evaluateTwentyFourExpression("8/(3-(8/3))", question);
    expect(result.valid).toBe(true);
    expect(result.value && isTwentyFour(result.value)).toBe(true);
  });

  test("rejects expressions that do not use each number once", () => {
    const result = evaluateTwentyFourExpression("(8*3)-3", question);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("exactly once");
  });

  test("rejects malformed expressions", () => {
    const result = evaluateTwentyFourExpression("8/(3-)", question);
    expect(result.valid).toBe(false);
    expect(result.message).toContain("parse");
  });
});
