import { type FormEvent, useEffect, useMemo, useRef } from "react";
import { Timer, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useGameEngine } from "../game-shell/useGameEngine";
import type { GameDefinition, ScorePolicy, SprintMinutes } from "../game-shell/types";
import ThemeToggle from "./theme/ThemeToggle";
import styles from "../styles/GameShell.module.css";

type GameShellProps<Q, A, N> = {
  definition: GameDefinition<Q, A, N>;
  scorePolicy?: ScorePolicy;
};

const SPRINT_MINUTES_OPTIONS: SprintMinutes[] = [1, 3, 5];

function formatTime(seconds: number | null) {
  if (seconds === null) return "--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function normalizeAnswerDisplay(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (value === null || value === undefined) {
    return "-";
  }
  return String(value);
}

export default function GameShell<Q, A, N>({ definition, scorePolicy }: GameShellProps<Q, A, N>) {
  const { state, answer, setAnswer, bestScore, startRun, submitAnswer, setMode, setSprintMinutes, resetBestForMode } =
    useGameEngine({ definition, scorePolicy });

  const inputRef = useRef<HTMLInputElement>(null);
  const isRunning = state.phase === "running";
  const hasPlayed = state.phase === "ended";

  useEffect(() => {
    if (!isRunning || definition.renderAnswerInput) return;
    inputRef.current?.focus();
  }, [definition.renderAnswerInput, isRunning, state.question]);

  useEffect(() => {
    document.title = `${definition.title} | Math Games`;
  }, [definition.title]);

  const introMessage =
    state.mode === "sprint"
      ? "Sprint mode ends when time runs out or after 3 wrong answers."
      : "Survival mode ends on your first wrong answer.";

  const sprintTotalSeconds = state.sprintMinutes * 60;
  const timeProgress = useMemo(() => {
    if (state.mode !== "sprint" || state.timeLeftSec === null) return 0;
    return Math.max(0, Math.min(100, (state.timeLeftSec / sprintTotalSeconds) * 100));
  }, [sprintTotalSeconds, state.mode, state.timeLeftSec]);

  const startLabel = isRunning ? "Running..." : hasPlayed ? "Play Again" : "Start Game";
  const isLowTime = state.mode === "sprint" && (state.timeLeftSec ?? 0) <= 10;
  const timerText = state.mode === "sprint" ? formatTime(state.timeLeftSec) : "--";

  const customInputRenderer = definition.renderAnswerInput;
  const supportsDefaultInput = !customInputRenderer;
  const defaultInputValue = typeof answer === "string" || typeof answer === "number" ? String(answer) : "";

  const handleDefaultInputSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitAnswer();
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <Link className={styles.backLink} to="/">
            <span>&larr;</span>
            Back to games
          </Link>
          <h1 className={styles.title}>{definition.title}</h1>
          {definition.subtitle && <p className={styles.subtitle}>{definition.subtitle}</p>}
          <div className={styles.themeControl}>
            <ThemeToggle />
          </div>
        </header>

        <div className={styles.intro}>
          <div className={styles.modeRow}>
            <div className={styles.tag}>Game Mode</div>
            <div className={styles.modeToggle}>
              <button
                type="button"
                className={`${styles.modeBtn} ${state.mode === "sprint" ? styles.modeBtnActive : ""}`}
                onClick={() => setMode("sprint")}
                disabled={isRunning}
              >
                Sprint
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${state.mode === "survival" ? styles.modeBtnActive : ""}`}
                onClick={() => setMode("survival")}
                disabled={isRunning}
              >
                Survival
              </button>
            </div>
          </div>

          {state.mode === "sprint" && (
            <div className={styles.modeRow}>
              <div className={styles.tag}>Sprint Time</div>
              <div className={styles.modeToggle}>
                {SPRINT_MINUTES_OPTIONS.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={`${styles.modeBtn} ${state.sprintMinutes === minutes ? styles.modeBtnActive : ""}`}
                    onClick={() => setSprintMinutes(minutes)}
                    disabled={isRunning}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className={styles.introMessage}>{introMessage}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primaryAction} disabled={isRunning} onClick={startRun}>
              {startLabel}
            </button>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <Trophy className={styles.statIcon} />
            {state.score}/{state.totalAnswered}
          </div>
          <div className={styles.statPill}>
            <span className={styles.pillLabel}>Streak</span>
            <span className={styles.pillValue}>{state.streak}</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.pillLabel}>Best</span>
            <span className={styles.pillValue}>{bestScore}</span>
          </div>
          <div className={`${styles.statPill} ${styles.pillHighlight}`}>
            <span className={styles.pillLabel}>Wrong</span>
            <span className={styles.pillValue}>
              {state.wrongAnswers}/{state.wrongLimit}
            </span>
          </div>
          {state.mode === "sprint" && (
            <div className={`${styles.statPill} ${styles.timerPill} ${isLowTime ? styles.statPillAlert : ""}`}>
              <Timer className={styles.statIcon} />
              <span className={`${styles.timerText} ${isLowTime ? "" : styles.timerTextQuiet}`}>{timerText}</span>
            </div>
          )}
        </div>

        {state.mode === "sprint" && (
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${timeProgress}%` }} />
          </div>
        )}

        <div className={styles.target}>
          <p className={styles.targetLabel}>Current Question</p>
          <div className={styles.targetNumber}>{definition.renderQuestion(state.question)}</div>
        </div>

        {supportsDefaultInput ? (
          <form className={styles.answerForm} onSubmit={handleDefaultInputSubmit}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.answerInput}
              placeholder="Type your answer, then press Enter"
              autoComplete="off"
              value={defaultInputValue}
              onChange={(event) => setAnswer(event.target.value as A)}
              disabled={!isRunning}
              ref={inputRef}
            />
            <div className={styles.actions}>
              <button type="submit" className={styles.primaryAction} disabled={!isRunning}>
                Submit Answer
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.customInputWrap}>
            {customInputRenderer({
              value: answer,
              onChange: setAnswer,
              onSubmit: submitAnswer,
              disabled: !isRunning,
            })}
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryAction} onClick={resetBestForMode}>
            Reset Best
          </button>
        </div>

        {state.feedback.message && (
          <div
            className={`${styles.feedback} ${
              state.feedback.tone === "correct"
                ? styles.feedbackCorrect
                : state.feedback.tone === "wrong"
                  ? styles.feedbackWrong
                  : ""
            }`}
          >
            {state.feedback.message}
          </div>
        )}

        {state.history.length > 0 && (
          <div className={styles.history}>
            {state.history.map((entry) => (
              <div
                key={entry.id}
                className={`${styles.historyEntry} ${
                  entry.outcome === "correct" ? styles.historyEntryCorrect : styles.historyEntryWrong
                }`}
              >
                {entry.outcome === "correct"
                  ? `[OK] ${entry.questionLabel} = ${entry.correctAnswerLabel}`
                  : `[X] ${entry.questionLabel} -> you: ${normalizeAnswerDisplay(entry.normalizedAnswer)} (correct: ${entry.correctAnswerLabel})`}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
