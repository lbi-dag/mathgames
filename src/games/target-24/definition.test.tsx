import { describe, expect, test } from "vitest";
import { target24GameDefinition } from "./definition";

describe("target24GameDefinition", () => {
  test("exposes the expected game identity", () => {
    expect(target24GameDefinition.gameId).toBe("target-24");
    expect(target24GameDefinition.title).toBe("Target 24");
  });

  test("marks correct expressions as correct", () => {
    const question = { numbers: [8, 8, 3, 3] as [number, number, number, number] };
    const outcome = target24GameDefinition.evaluateAnswer({
      question,
      answer: "8/(3-(8/3))",
    });
    expect(outcome.kind).toBe("correct");
  });
});
