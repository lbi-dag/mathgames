import { describe, expect, test } from "vitest";
import { evaluateTarget24Expression, generateTarget24Question } from "./logic";

function createRng(values: number[]) {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

describe("evaluateTarget24Expression", () => {
  const question = { numbers: [8, 8, 3, 3] as [number, number, number, number] };

  test("accepts a valid expression that equals 24", () => {
    const result = evaluateTarget24Expression("8/(3-(8/3))", question);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeCloseTo(24, 6);
    }
  });

  test("rejects answers that do not use all values exactly once", () => {
    const result = evaluateTarget24Expression("8+8+8", question);
    expect(result.ok).toBe(false);
  });

  test("rejects unsupported characters", () => {
    const result = evaluateTarget24Expression("8^2", question);
    expect(result.ok).toBe(false);
  });
});

describe("generateTarget24Question", () => {
  test("creates four values in the starter difficulty range", () => {
    const question = generateTarget24Question(createRng([0.1, 0.5, 0.3, 0.8]), 1);
    expect(question.numbers).toHaveLength(4);
    expect(question.numbers.every((value) => value >= 1 && value <= 9)).toBe(true);
  });
});
