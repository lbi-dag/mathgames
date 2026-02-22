import { describe, expect, test } from "vitest";
import { numberSenseGameDefinition } from "./definition";

const baseQuestion = {
  text: "4 + 5",
  answer: 9,
  type: "add" as const,
};

describe("number sense game definition", () => {
  test("keeps integer-answer compatibility", () => {
    const result = numberSenseGameDefinition.evaluateAnswer({
      question: baseQuestion,
      answer: "9",
    });
    expect(result.kind).toBe("correct");
  });

  test("invalid input is ignored with validation message", () => {
    const result = numberSenseGameDefinition.evaluateAnswer({
      question: baseQuestion,
      answer: "2.5",
    });
    expect(result.kind).toBe("invalid");
  });
});
