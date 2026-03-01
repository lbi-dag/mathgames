import type { GameDefinition, ScorePolicy } from "../../game-shell/types";
import { formatRational } from "./parsing";
import { evaluateAnswer, generateQuestion } from "./logic";
import type { NumberSenseQuestion } from "./types";
import NumberSenseInput from "./NumberSenseInput";

export const numberSenseScorePolicy: ScorePolicy = ({ isCorrect }) =>
  isCorrect ? 5 : -4;

export const numberSenseGameDefinition: GameDefinition<NumberSenseQuestion, string, string> = {
  gameId: "number-sense",
  title: "A+ Number Sense",
  subtitle: "Practice UIL Number Sense \u2014 80 mental math problems in 10 minutes.",
  createInitialAnswer: () => "",
  generateQuestion: ({ rng, difficultyLevel }) =>
    generateQuestion(rng, difficultyLevel),
  evaluateAnswer: ({ question, answer }) => evaluateAnswer(question, answer),
  renderQuestion: (question) => {
    if (!question) return "Press Start";
    return question.text;
  },
  getCorrectAnswerLabel: (question) => formatRational(question.answer),
  getQuestionLabel: (question) => question.text,
  renderAnswerInput: ({ value, onChange, onSubmit, disabled }) => (
    <NumberSenseInput
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      disabled={disabled}
    />
  ),
};
