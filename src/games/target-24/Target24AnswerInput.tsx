import { type KeyboardEvent } from "react";
import styles from "./Target24AnswerInput.module.css";

type Target24AnswerInputProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

const EXPRESSION_KEYS = [
  "7",
  "8",
  "9",
  "+",
  "4",
  "5",
  "6",
  "-",
  "1",
  "2",
  "3",
  "*",
  "(",
  "0",
  ")",
  "/",
] as const;

export default function Target24AnswerInput({ value, onChange, onSubmit, disabled }: Target24AnswerInputProps) {
  const appendToken = (token: string) => {
    if (disabled) return;
    onChange(`${value}${token}`);
  };

  const handleBackspace = () => {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled || value.length === 0) return;
    onChange("");
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className={styles.answerForm}>
      <input
        type="text"
        className={styles.answerInput}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleInputKeyDown}
        disabled={disabled}
        placeholder="Type your expression, then tap Submit Answer or press Enter"
        aria-label="Expression input"
      />

      <div className={styles.keypad}>
        {EXPRESSION_KEYS.map((token) => (
          <button
            key={token}
            type="button"
            className={styles.keypadButton}
            disabled={disabled}
            onClick={() => appendToken(token)}
          >
            {token}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.secondaryButton} onClick={handleBackspace} disabled={disabled || !value}>
          Backspace
        </button>
        <button type="button" className={styles.secondaryButton} onClick={handleClear} disabled={disabled || !value}>
          Clear
        </button>
        <button type="button" className={styles.submitButton} onClick={onSubmit} disabled={disabled}>
          Submit Answer
        </button>
      </div>

      <p className={styles.helpText}>Use the keypad or keyboard, then tap Submit Answer or press Enter.</p>
    </div>
  );
}
