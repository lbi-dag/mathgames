import type { GameDefinition } from "../../game-shell/types";
import Target24AnswerInput from "./Target24AnswerInput";
import {
  evaluateTarget24Expression,
  formatNumbersForPrompt,
  generateTarget24Question,
  type Target24Question,
} from "./logic";

export const target24GameDefinition: GameDefinition<Target24Question, string, string> = {
  gameId: "target-24",
  title: "Target 24",
  subtitle: "Use +, -, *, / with all four numbers to make exactly 24.",
  createInitialAnswer: () => "",
  generateQuestion: ({ rng, difficultyLevel }) => generateTarget24Question(rng, difficultyLevel ?? 1),
  evaluateAnswer: ({ question, answer }) => {
    const result = evaluateTarget24Expression(answer, question);
    if (!result.ok) {
      return {
        kind: "invalid",
        message: result.message,
      };
    }

    if (Math.abs(result.value - 24) < 1e-9) {
      return {
        kind: "correct",
        normalizedAnswer: answer.trim(),
      };
    }

    return {
      kind: "wrong",
      normalizedAnswer: answer.trim(),
    };
  },
  renderQuestion: (question) => (question ? formatNumbersForPrompt(question) : "Press Start"),
  getCorrectAnswerLabel: () => "A valid expression that evaluates to 24",
  getQuestionLabel: (question) => question.numbers.join(", "),
  renderAnswerInput: ({ value, onChange, onSubmit, disabled }) => (
    <Target24AnswerInput value={value} onChange={onChange} onSubmit={onSubmit} disabled={disabled} />
  ),
};
