import { type KeyboardEvent } from "react";
import type { Target24Question } from "./logic";
import styles from "./Target24AnswerInput.module.css";

type Target24AnswerInputProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  question: Target24Question | null;
};

const OPERATORS = ["+", "-", "*", "/"] as const;
const PARENS = ["(", ")"] as const;

/**
 * Tokenize an expression string into semantic tokens (multi-digit numbers,
 * operators, parens). Returns an array of token strings.
 */
function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    if (expr[i] === " ") {
      i += 1;
      continue;
    }
    if (/[0-9]/.test(expr[i])) {
      let end = i + 1;
      while (end < expr.length && /[0-9]/.test(expr[end])) {
        end += 1;
      }
      tokens.push(expr.slice(i, end));
      i = end;
    } else {
      tokens.push(expr[i]);
      i += 1;
    }
  }
  return tokens;
}

/**
 * Given the current expression and the question's 4 numbers, determine which
 * number slots are already used. Returns an array of 4 booleans.
 */
function getUsedSlots(expr: string, numbers: [number, number, number, number]): boolean[] {
  const tokens = tokenize(expr);
  const numberTokens = tokens
    .filter((t) => /^[0-9]+$/.test(t))
    .map(Number);
  const remaining = [...numbers];
  const used = [false, false, false, false];
  for (const num of numberTokens) {
    const idx = remaining.indexOf(num);
    if (idx !== -1) {
      for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] === num && !used[i]) {
          used[i] = true;
          break;
        }
      }
      remaining.splice(idx, 1);
    }
  }
  return used;
}

export default function Target24AnswerInput({
  value,
  onChange,
  onSubmit,
  disabled,
  question,
}: Target24AnswerInputProps) {
  const numbers = question?.numbers ?? [0, 0, 0, 0];
  const usedSlots = getUsedSlots(value, numbers as [number, number, number, number]);

  const appendToken = (token: string) => {
    if (disabled) return;
    onChange(`${value}${token}`);
  };

  const handleBackspace = () => {
    if (disabled || value.length === 0) return;
    // Token-aware: remove the last semantic token
    const tokens = tokenize(value);
    if (tokens.length === 0) return;
    tokens.pop();
    onChange(tokens.join(""));
  };

  const handleClear = () => {
    if (disabled || value.length === 0) return;
    onChange("");
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
        type="text"
        className={styles.answerInput}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleInputKeyDown}
        disabled={disabled}
        placeholder="Build your expression…"
        aria-label="Expression input"
      />

      <div className={styles.numberRow}>
        {numbers.map((num, idx) => {
          const isUsed = usedSlots[idx];
          return (
            <button
              key={idx}
              type="button"
              className={`${styles.numberButton} ${isUsed ? styles.numberButtonUsed : ""}`}
              disabled={disabled || isUsed}
              onClick={() => appendToken(String(num))}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className={styles.operatorRow}>
        {OPERATORS.map((op) => (
          <button
            key={op}
            type="button"
            className={styles.operatorButton}
            disabled={disabled}
            onClick={() => appendToken(op)}
          >
            {op === "*" ? "\u00d7" : op === "/" ? "\u00f7" : op}
          </button>
        ))}
        {PARENS.map((p) => (
          <button
            key={p}
            type="button"
            className={styles.operatorButton}
            disabled={disabled}
            onClick={() => appendToken(p)}
          >
            {p}
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
