import { type KeyboardEvent, useEffect, useRef } from "react";
import styles from "./Target24AnswerInput.module.css";

type Target24AnswerInputProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

const QUICK_OPERATORS = ["+", "-", "*", "/"] as const;

export default function Target24AnswerInput({ value, onChange, onSubmit, disabled }: Target24AnswerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const appendOperator = (operator: (typeof QUICK_OPERATORS)[number]) => {
    if (disabled) return;
    onChange(`${value}${operator}`);
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className={styles.answerForm}>
      <input
        ref={inputRef}
        type="text"
        className={styles.answerInput}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleInputKeyDown}
        disabled={disabled}
        placeholder="Example: (8-3)*(7-1)"
        aria-label="Expression input"
      />
      <div className={styles.operators}>
        {QUICK_OPERATORS.map((operator) => (
          <button
            key={operator}
            type="button"
            className={styles.operatorButton}
            disabled={disabled}
            onClick={() => appendOperator(operator)}
          >
            {operator}
          </button>
        ))}
      </div>
      <p className={styles.helpText}>Keyboard first: type your expression and press Enter to submit.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.submitButton} onClick={onSubmit} disabled={disabled}>
          Submit Expression
        </button>
      </div>
    </div>
  );
}
