import type { GameDefinition } from "../../game-shell/types";
import {
  generateCompositeNumberForDifficulty,
  isCorrectSelection,
  PRIMES_UNDER_50,
  type CompositeQuestion,
} from "./logic";
import styles from "./FactorRush.module.css";

type PrimeSelectionAnswer = number[];

function togglePrimeSelection(selection: PrimeSelectionAnswer, prime: number) {
  if (selection.includes(prime)) {
    return selection.filter((value) => value !== prime);
  }
  if (selection.length >= 3) {
    return selection;
  }
  return [...selection, prime].sort((a, b) => a - b);
}

export const factorRushGameDefinition: GameDefinition<CompositeQuestion, PrimeSelectionAnswer, PrimeSelectionAnswer> = {
  gameId: "factor-rush",
  title: "Factor Rush",
  subtitle: "Pick the 3 primes that multiply into the target value.",
  createInitialAnswer: () => [],
  generateQuestion: ({ rng, difficultyLevel }) =>
    generateCompositeNumberForDifficulty({ rng, difficultyLevel: difficultyLevel ?? 1 }),
  evaluateAnswer: ({ question, answer }) => {
    if (answer.length !== 3) {
      return {
        kind: "invalid",
        message: "Select exactly 3 primes before submitting.",
      };
    }

    const normalized = [...answer].sort((a, b) => a - b);
    if (isCorrectSelection(normalized, question.factors)) {
      return {
        kind: "correct",
        normalizedAnswer: normalized,
      };
    }
    return {
      kind: "wrong",
      normalizedAnswer: normalized,
    };
  },
  renderQuestion: (question) => question?.number ?? "Press Start",
  getCorrectAnswerLabel: (question) => question.factors.join(" x "),
  getQuestionLabel: (question) => String(question.number),
  renderAnswerInput: ({ value, onChange, onSubmit, disabled }) => {
    const selectionCountClass =
      value.length === 3 ? `${styles.selectionCount} ${styles.selectionReady}` : styles.selectionCount;

    return (
      <>
        <div className={styles.selectionRow}>
          Selected: <span className={selectionCountClass}>{value.length}/3</span>
        </div>
        <div className={styles.primeGrid}>
          {PRIMES_UNDER_50.map((prime) => {
            const isSelected = value.includes(prime);
            const isLimitDisabled = !isSelected && value.length >= 3;
            const buttonDisabled = disabled || isLimitDisabled;
            return (
              <button
                key={prime}
                type="button"
                className={[
                  styles.primeButton,
                  isSelected ? styles.primeButtonSelected : "",
                  buttonDisabled && !isSelected ? styles.primeButtonDisabled : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onChange(togglePrimeSelection(value, prime))}
                disabled={buttonDisabled}
              >
                {prime}
              </button>
            );
          })}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={onSubmit}
            disabled={disabled || value.length !== 3}
          >
            Submit Answer
          </button>
        </div>
      </>
    );
  },
};
