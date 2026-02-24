import type { GameDefinition } from "../../game-shell/types";
import { generateQuestion, parseIntegerAnswer, type Question } from "./logic";

export const speedArithmeticGameDefinition: GameDefinition<Question, string, number> = {
  gameId: "speed-arithmetic",
  title: "Speed Arithmetic",
  subtitle: "Build speed and accuracy with mixed arithmetic.",
  createInitialAnswer: () => "",
  generateQuestion: ({ rng, difficultyLevel, previousQuestion }) =>
    generateQuestion(rng, null, difficultyLevel ?? 1) ?? previousQuestion ?? generateQuestion(rng, null, 1),
  evaluateAnswer: ({ question, answer }) => {
    const parsed = parseIntegerAnswer(answer);
    if (parsed === null) {
      return {
        kind: "invalid",
        message: "Please enter a whole number.",
      };
    }
    if (parsed === question.answer) {
      return {
        kind: "correct",
        normalizedAnswer: parsed,
      };
    }
    return {
      kind: "wrong",
      normalizedAnswer: parsed,
    };
  },
  renderQuestion: (question) => question?.text ?? "Press Start",
  getCorrectAnswerLabel: (question) => String(question.answer),
  getQuestionLabel: (question) => question.text,
};
