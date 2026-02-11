import { describe, expect, test } from "vitest";
import { evaluateAnswer, generateQuestion } from "./logic";

function createRng(values: number[]) {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

describe("generateQuestion", () => {
  test("starts with exponents 2-3", () => {
    const question = generateQuestion(createRng([0.1]), 0);
    expect(question.exponent).toBeGreaterThanOrEqual(2);
    expect(question.exponent).toBeLessThanOrEqual(3);
  });

  test("caps answers at 10,000", () => {
    const question = generateQuestion(createRng([0.5]), 20);
    expect(question.answer).toBeLessThanOrEqual(10000);
  });

  test("high correct count unlocks exponent 9", () => {
    const question = generateQuestion(createRng([0.9999]), 40);
    expect(question.exponent).toBe(9);
    expect(question.base).toBe(2);
  });
});

describe("evaluateAnswer", () => {
  const baseQuestion = { text: "2^3", base: 2, exponent: 3, answer: 8 };
  const initialStats = { score: 2, streak: 1, totalAnswered: 3, totalCorrect: 2 };

  test("invalid input leaves stats unchanged", () => {
    const result = evaluateAnswer("3.9", baseQuestion, initialStats);
    expect(result.status).toBe("invalid");
    expect(result.stats).toEqual(initialStats);
  });

  test("correct answer updates totals and streak", () => {
    const result = evaluateAnswer("8", baseQuestion, initialStats);
    expect(result.status).toBe("correct");
    expect(result.stats.score).toBe(initialStats.score + 1);
    expect(result.stats.streak).toBe(initialStats.streak + 1);
    expect(result.stats.totalAnswered).toBe(initialStats.totalAnswered + 1);
    expect(result.stats.totalCorrect).toBe(initialStats.totalCorrect + 1);
  });

  test("wrong answer resets streak but tracks attempts", () => {
    const result = evaluateAnswer("5", baseQuestion, initialStats);
    expect(result.status).toBe("wrong");
    expect(result.stats.score).toBe(initialStats.score);
    expect(result.stats.streak).toBe(0);
    expect(result.stats.totalAnswered).toBe(initialStats.totalAnswered + 1);
    expect(result.stats.totalCorrect).toBe(initialStats.totalCorrect);
  });
});
