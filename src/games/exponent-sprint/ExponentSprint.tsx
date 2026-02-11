import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Timer, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { evaluateAnswer, generateQuestion, type Question, type Stats } from "./logic";
import styles from "../../styles/ExponentSprint.module.css";

type HistoryEntry = {
  id: number;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
};

const SPRINT_TIME_SECONDS = 60;
const BEST_KEY = "exponentSprintBestScore";

function readStoredBestScore() {
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem(BEST_KEY);
  return stored ? parseInt(stored, 10) || 0 : 0;
}

export default function ExponentSprint() {
  const [stats, setStats] = useState<Stats>({ score: 0, streak: 0, totalAnswered: 0, totalCorrect: 0 });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: "" | "correct" | "wrong" }>({
    message: "",
    type: "",
  });
  const [timeLeft, setTimeLeft] = useState<number>(SPRINT_TIME_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [answerInput, setAnswerInput] = useState("");
  const [hasPlayed, setHasPlayed] = useState(false);

  const answerInputRef = useRef<HTMLInputElement>(null);
  const historyId = useRef(0);
  const timeLeftRef = useRef<number>(SPRINT_TIME_SECONDS);

  const startLabel = useMemo(() => {
    if (isRunning) return "Running...";
    return hasPlayed ? "Play Again" : "Start Game";
  }, [hasPlayed, isRunning]);
  const bestScore = readStoredBestScore();

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (isRunning) {
      answerInputRef.current?.focus();
    }
  }, [currentQuestion, isRunning]);

  const updateHistory = (entry: Omit<HistoryEntry, "id">) => {
    setHistory((prev) => {
      const next = [{ id: historyId.current++, ...entry }, ...prev];
      return next.slice(0, 20);
    });
  };

  const showFeedback = useCallback((message: string, type: "" | "correct" | "wrong") => {
    setFeedback({ message, type });
  }, []);

  const saveBestScore = useCallback(
    (newScore: number) => {
      if (typeof window === "undefined") return;
      const stored = window.localStorage.getItem(BEST_KEY);
      const best = stored ? parseInt(stored, 10) || 0 : 0;
      if (newScore > best) {
        window.localStorage.setItem(BEST_KEY, String(newScore));
        showFeedback("New personal best!", "correct");
      }
    },
    [showFeedback],
  );

  const startGame = () => {
    if (isRunning) return;
    setIsRunning(true);
    setHasPlayed(true);
    setStats({ score: 0, streak: 0, totalAnswered: 0, totalCorrect: 0 });
    setTimeLeft(SPRINT_TIME_SECONDS);
    setCurrentQuestion(null);
    setHistory([]);
    showFeedback("Go! 60 seconds on the clock.", "correct");
    setAnswerInput("");
    const initialQuestion = generateQuestion(Math.random, 0);
    setCurrentQuestion(initialQuestion);
  };

  const endGame = useCallback(
    (finalStats: Stats = stats) => {
      if (!isRunning) return;
      setIsRunning(false);
      setTimeLeft((prev) => Math.max(0, prev));
      const message = `Time! Final score: ${finalStats.score} | Score: ${finalStats.totalCorrect}/${finalStats.totalAnswered}`;
      showFeedback(message, "");
      saveBestScore(finalStats.score);
    },
    [isRunning, saveBestScore, showFeedback, stats],
  );

  useEffect(() => {
    if (!isRunning) return;
    const intervalId = window.setInterval(() => {
      const current = timeLeftRef.current;
      const next = Math.max(0, current - 1);
      timeLeftRef.current = next;
      setTimeLeft(next);
      if (next === 0) {
        endGame();
      }
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [endGame, isRunning]);

  const handleAnswerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isRunning || !currentQuestion) return;

    const result = evaluateAnswer(answerInput, currentQuestion, stats);

    if (result.status === "invalid") {
      showFeedback("Please enter a whole number.", "wrong");
      answerInputRef.current?.focus();
      return;
    }

    setStats(result.stats);

    if (result.status === "correct") {
      showFeedback("Correct!", "correct");
      updateHistory({
        question: currentQuestion.text,
        userAnswer: result.parsedAnswer ?? 0,
        correctAnswer: currentQuestion.answer,
        isCorrect: true,
      });
    } else {
      showFeedback(`Missed: ${currentQuestion.text} = ${currentQuestion.answer}`, "wrong");
      updateHistory({
        question: currentQuestion.text,
        userAnswer: result.parsedAnswer ?? 0,
        correctAnswer: currentQuestion.answer,
        isCorrect: false,
      });
    }

    setAnswerInput("");

    if (timeLeft <= 0) {
      endGame(result.stats);
    } else {
      setCurrentQuestion(generateQuestion(Math.random, result.stats.totalCorrect));
    }
  };

  const resetBestScore = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(BEST_KEY);
    showFeedback("Best score reset.", "");
  };

  const timerDisplay = useMemo(() => `${timeLeft}s`, [timeLeft]);
  const isLowTime = timeLeft <= 10;
  const timeProgress = useMemo(() => Math.max(0, Math.min(100, (timeLeft / SPRINT_TIME_SECONDS) * 100)), [timeLeft]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <Link className={styles.backLink} to="/">
            <span>&larr;</span>
            Back to games
          </Link>
          <h1 className={styles.title}>Exponent Sprint</h1>
          <p className={styles.subtitle}>Race through powers with bases below 10.</p>
        </header>

        <div className={styles.intro}>
          <div className={styles.introMessage}>
            Start with exponents 2-3. Every 5 correct answers unlocks higher exponents.
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.primaryAction} disabled={isRunning} onClick={startGame}>
              {startLabel}
            </button>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <Trophy className={styles.statIcon} />
            {stats.score}/{stats.totalAnswered}
          </div>
          <div className={styles.statPill}>
            <span className={styles.pillLabel}>Streak</span>
            <span className={styles.pillValue}>{stats.streak}</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.pillLabel}>Best</span>
            <span className={styles.pillValue}>{bestScore}</span>
          </div>
          <div className={`${styles.statPill} ${styles.timerPill} ${isLowTime ? styles.statPillAlert : ""}`}>
            <Timer className={styles.statIcon} />
            <span className={`${styles.timerText} ${isLowTime ? "" : styles.timerTextQuiet}`}>{timerDisplay}</span>
          </div>
        </div>

        <div className={styles.progressTrack}>
          <div className={styles.progressBar} style={{ width: `${timeProgress}%` }} />
        </div>

        <div className={styles.target}>
          <p className={styles.targetLabel}>Current Question</p>
          {currentQuestion ? (
            <p className={styles.targetNumber}>
              <span className={styles.targetBase}>{currentQuestion.base}</span>
              <sup className={styles.targetExponent}>{currentQuestion.exponent}</sup>
            </p>
          ) : (
            <p className={styles.targetNumber}>Press Start</p>
          )}
        </div>

        <form className={styles.answerForm} onSubmit={handleAnswerSubmit}>
          <input
            type="number"
            inputMode="numeric"
            className={styles.answerInput}
            placeholder="Type your answer, then press Enter"
            autoComplete="off"
            value={answerInput}
            onChange={(event) => setAnswerInput(event.target.value)}
            disabled={!isRunning}
            ref={answerInputRef}
          />
          <div className={styles.actions}>
            <button type="submit" className={styles.primaryAction} disabled={!isRunning}>
              Submit Answer
            </button>
          </div>
        </form>

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryAction} onClick={resetBestScore}>
            Reset Best
          </button>
        </div>

        {feedback.message && (
          <div
            className={`${styles.feedback} ${
              feedback.type === "correct" ? styles.feedbackCorrect : feedback.type === "wrong" ? styles.feedbackWrong : ""
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className={styles.history}>
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`${styles.historyEntry} ${entry.isCorrect ? styles.historyEntryCorrect : styles.historyEntryWrong}`}
            >
              {entry.isCorrect
                ? `[OK] ${entry.question} = ${entry.correctAnswer}`
                : `[X] ${entry.question} -> you: ${entry.userAnswer} (correct: ${entry.correctAnswer})`}
            </div>
          ))}
        </div>

        <div className={styles.footerRow}>Tip: exponents unlock every 5 correct answers.</div>
      </div>
    </div>
  );
}
