import { type KeyboardEvent, useEffect, useRef } from "react";
import styles from "./NumberSenseInput.module.css";

type NumberSenseInputProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

export default function NumberSenseInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: NumberSenseInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (!value.trim()) return;
    onSubmit();
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit();
  };

  return (
    <div className={styles.answerForm}>
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        className={styles.answerInput}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type your answer, then press Enter"
        aria-label="Answer input"
      />
      <p className={styles.hint}>Enter: 43, -5, 3/4, or 2 1/3</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}
