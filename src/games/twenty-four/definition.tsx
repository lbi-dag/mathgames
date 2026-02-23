import type { GameDefinition } from "../../game-shell/types";
import { evaluateTwentyFourExpression, generateQuestionForDifficulty, isTwentyFour, type TwentyFourQuestion } from "./logic";
import styles from "./TwentyFourGame.module.css";

export const twentyFourGameDefinition: GameDefinition<TwentyFourQuestion, string, string> = {
  gameId: "equation-forge-24",
  title: "Equation Forge 24",
  subtitle: "Use all four numbers once with +, -, ×, ÷ and parentheses to hit 24.",
  createInitialAnswer: () => "",
  generateQuestion: ({ rng, difficultyLevel, previousQuestion }) =>
    generateQuestionForDifficulty(rng, difficultyLevel ?? 1, previousQuestion),
  evaluateAnswer: ({ question, answer }) => {
    const result = evaluateTwentyFourExpression(answer, question);
    if (!result.valid) {
      return {
        kind: "invalid",
        message: result.message ?? "Invalid expression.",
      };
    }

    if (result.value && isTwentyFour(result.value)) {
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
  renderQuestion: (question) => {
    if (!question) return "Press Start";

    return (
      <div>
        <div className={styles.questionWrap}>
          {question.numbers.map((number, index) => (
            <div key={`${number}-${index}`} className={styles.numberTile}>
              {number}
            </div>
          ))}
        </div>
        <div className={styles.hint}>Build an expression that equals 24</div>
      </div>
    );
  },
  getCorrectAnswerLabel: (question) => question.solution,
  getQuestionLabel: (question) => question.text,
  renderAnswerInput: ({ value, onChange, onSubmit, disabled }) => (
    <div className={styles.inputLayout}>
      <input
        type="text"
        className={styles.expressionInput}
        placeholder="Example: (8/(3-(8/3)))"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit();
          }
        }}
        disabled={disabled}
      />
      <div className={styles.helpRow}>Allowed: + - * / parentheses, and each number exactly once.</div>
      <button type="button" className={styles.submitButton} onClick={onSubmit} disabled={disabled || !value.trim()}>
        Submit Expression
      </button>
    </div>
  ),
};
