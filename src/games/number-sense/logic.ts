import type { Rng } from "../../game-shell/rng";
import type { AnswerOutcome } from "../../game-shell/types";
import { formatRational, isWithin5Percent, parseRational, rationalsEqual } from "./parsing";
import { pickAndGenerate } from "./generators";
import type { NumberSenseQuestion } from "./types";

export type { NumberSenseQuestion } from "./types";

export function generateQuestion(
  rng: Rng,
  difficultyLevel: number,
): NumberSenseQuestion {
  return pickAndGenerate(rng, difficultyLevel);
}

export function evaluateAnswer(
  question: NumberSenseQuestion,
  rawInput: string,
): AnswerOutcome<string> {
  const trimmed = rawInput.trim();
  if (trimmed === "") {
    return { kind: "invalid", message: "Please enter an answer." };
  }

  const parsed = parseRational(trimmed);
  if (parsed === null) {
    return { kind: "invalid", message: "Enter a number: 43, -5, 3/4, or 2 1/3" };
  }

  const displayAnswer = formatRational(parsed);

  if (question.isApproximate) {
    if (isWithin5Percent(parsed, question.answer)) {
      return { kind: "correct", normalizedAnswer: displayAnswer };
    }
    return { kind: "wrong", normalizedAnswer: displayAnswer };
  }

  if (rationalsEqual(parsed, question.answer)) {
    return { kind: "correct", normalizedAnswer: displayAnswer };
  }
  return { kind: "wrong", normalizedAnswer: displayAnswer };
}
