import { useEffect, useState } from "react";
import { Timer, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useExamEngine } from "../game-shell/useExamEngine";
import type { Rng } from "../game-shell/rng";
import type { ExamScorePolicy, GameDefinition } from "../game-shell/types";
import ThemeToggle from "./theme/ThemeToggle";
import styles from "../styles/ExamShell.module.css";

type ExamShellProps<Q, A, N> = {
  definition: GameDefinition<Q, A, N>;
  scorePolicy: ExamScorePolicy;
  totalQuestions?: number;
  durationSec?: number;
  generateQuestionSet?: (rng: Rng, totalQuestions: number) => { question: Q; difficulty: number }[];
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ExamShell<Q, A, N>({
  definition,
  scorePolicy,
  totalQuestions = 80,
  durationSec = 600,
  generateQuestionSet,
}: ExamShellProps<Q, A, N>) {
  const {
    state,
    answer,
    bestScore,
    answeredCount,
    startExam,
    setAnswer,
    navigateTo,
    navigatePrev,
    navigateNext,
    submitExam,
    resetBest,
  } = useExamEngine({ definition, scorePolicy, totalQuestions, durationSec, generateQuestionSet });

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    document.title = `${definition.title} | Math Games`;
  }, [definition.title]);

  const isRunning = state.phase === "running";
  const isEnded = state.phase === "ended";
  const isIdle = state.phase === "idle";
  const isLowTime = isRunning && state.timeLeftSec <= 60;
  const currentSlot = state.slots[state.currentIndex];

  const handleSubmitClick = () => {
    const unanswered = state.slots.length - answeredCount;
    if (unanswered > 0) {
      setShowConfirm(true);
    } else {
      submitExam();
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirm(false);
    submitExam();
  };

  const handleNavigateNext = () => {
    navigateNext();
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

        {/* IDLE PHASE */}
        {isIdle && (
          <div className={styles.intro}>
            <p className={styles.introMessage}>
              {totalQuestions} questions in {Math.floor(durationSec / 60)} minutes. Scoring: +{scorePolicy.correct} correct, {scorePolicy.wrong} wrong, {scorePolicy.blank} blank.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.primaryAction} onClick={startExam}>
                Start Exam
              </button>
            </div>
          </div>
        )}

        {/* RUNNING PHASE */}
        {isRunning && (
          <>
            <div className={styles.statsRow}>
              <div className={styles.statPill}>
                <Trophy className={styles.statIcon} />
                {answeredCount}/{state.slots.length} answered
              </div>
              <div className={`${styles.statPill} ${styles.timerPill} ${isLowTime ? styles.timerAlert : ""}`}>
                <Timer className={styles.statIcon} />
                <span className={styles.timerText}>{formatTime(state.timeLeftSec)}</span>
              </div>
            </div>

            <div className={styles.questionArea}>
              <p className={styles.questionLabel}>
                Question {state.currentIndex + 1} of {state.slots.length}
              </p>
              <div className={styles.questionText}>
                {currentSlot ? definition.renderQuestion(currentSlot.question) : null}
              </div>
            </div>

            <div className={styles.inputArea}>
              {definition.renderAnswerInput ? (
                definition.renderAnswerInput({
                  value: answer as A,
                  onChange: (next: A) => setAnswer(String(next)),
                  onSubmit: handleNavigateNext,
                  disabled: false,
                  question: currentSlot?.question ?? null,
                })
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNavigateNext();
                  }}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer"
                  />
                </form>
              )}
            </div>

            <div className={styles.navRow}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={navigatePrev}
                disabled={state.currentIndex === 0}
              >
                Prev
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={navigateNext}
                disabled={state.currentIndex === state.slots.length - 1}
              >
                Next
              </button>
            </div>

            <div className={styles.questionGrid}>
              {state.slots.map((slot, i) => {
                let cellClass = styles.gridCell;
                if (i === state.currentIndex) {
                  cellClass += ` ${styles.gridCellCurrent}`;
                } else if (slot.status === "answered") {
                  cellClass += ` ${styles.gridCellAnswered}`;
                }
                return (
                  <button
                    key={i}
                    type="button"
                    className={cellClass}
                    onClick={() => navigateTo(i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className={styles.submitRow}>
              <button type="button" className={styles.dangerAction} onClick={handleSubmitClick}>
                Submit Exam
              </button>
            </div>
          </>
        )}

        {/* ENDED PHASE */}
        {isEnded && (
          <>
            <div className={styles.resultsSummary}>
              <p className={styles.scoreDisplay}>Score: {state.score}</p>
              <p className={styles.scoreMeta}>
                {state.totalCorrect} correct (+{state.totalCorrect * scorePolicy.correct}) | {state.totalWrong} wrong ({state.totalWrong * scorePolicy.wrong}) | {state.totalBlank} blank
              </p>
              <p className={styles.scoreMeta}>Best: {bestScore}</p>
            </div>

            <div className={styles.resultsList}>
              {state.results.map((result) => (
                <div key={result.index} className={styles.resultEntry}>
                  <span
                    className={`${styles.resultIcon} ${
                      result.outcome === "correct"
                        ? styles.resultCorrect
                        : result.outcome === "wrong"
                          ? styles.resultWrong
                          : styles.resultBlank
                    }`}
                  >
                    {result.outcome === "correct" ? "O" : result.outcome === "wrong" ? "X" : "-"}
                  </span>
                  <span>
                    {result.index + 1}. {result.questionLabel}
                  </span>
                  <span className={styles.resultDetail}>
                    {result.outcome === "blank"
                      ? `(${result.correctAnswerLabel})`
                      : result.outcome === "wrong"
                        ? `${result.userAnswer} -> ${result.correctAnswerLabel}`
                        : result.userAnswer}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.primaryAction} onClick={startExam}>
                Take Another Exam
              </button>
              <button type="button" className={styles.secondaryAction} onClick={resetBest}>
                Reset Best
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.confirmCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Submit Exam?</h3>
            <p className={styles.confirmMessage}>
              You have {state.slots.length - answeredCount} unanswered question{state.slots.length - answeredCount === 1 ? "" : "s"}. Blank answers score {scorePolicy.blank} points each.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.primaryAction} onClick={handleConfirmSubmit}>
                Submit
              </button>
              <button type="button" className={styles.secondaryAction} onClick={() => setShowConfirm(false)}>
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
