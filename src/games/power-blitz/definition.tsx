import type { GameDefinition } from "../../game-shell/types";
import { generateQuestionForDifficulty, parseIntegerAnswer, type Question } from "./logic";

export const powerBlitzGameDefinition: GameDefinition<Question, string, number> = {
  gameId: "power-blitz",
  title: "Power Blitz",
  subtitle: "Race through powers with increasing exponent difficulty.",
  createInitialAnswer: () => "",
  generateQuestion: ({ rng, difficultyLevel }) => generateQuestionForDifficulty(rng, difficultyLevel ?? 1),
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
  renderQuestion: (question) => {
    if (!question) return "Press Start";
    return (
      <>
        <span>{question.base}</span>
        <sup>{question.exponent}</sup>
      </>
    );
  },
  getCorrectAnswerLabel: (question) => String(question.answer),
  getQuestionLabel: (question) => question.text,
};
