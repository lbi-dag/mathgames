import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Timer, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { evaluateAnswer, generateQuestion, type Question, type Stats } from "./logic";
import styles from "../../styles/NumberSenseSprint.module.css";

type ModeKey = "sprint" | "survival";

type ModeConfig = {
  label: string;
  tag: string;
  hasTimer: boolean;
  startingLives: number | null;
  bestKey: string;
};

type HistoryEntry = {
  id: number;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
};

const MAX_DIFFICULTY = 6;
const SPRINT_TIME_SECONDS = 60;
const BEST_KEY_PREFIX = "numberSenseBest:";
const LEGACY_SPRINT_KEY = "numberSenseSprintBestScore";

const MODES: Record<ModeKey, ModeConfig> = {
  sprint: {
    label: "Sprint",
    tag: "Sprint Mode",
    hasTimer: true,
    startingLives: null,
    bestKey: `${BEST_KEY_PREFIX}sprint`,
  },
  survival: {
    label: "Survival",
    tag: "Survival Mode",
    hasTimer: false,
    startingLives: 3,
    bestKey: `${BEST_KEY_PREFIX}survival`,
  },
};

function clampDifficulty(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_DIFFICULTY, Math.max(1, Math.floor(value)));
}

function calculateDifficulty(mode: ModeKey, totalCorrect: number) {
  if (mode !== "survival") return 1;
  return clampDifficulty(1 + Math.floor(totalCorrect / 4));
}

function readStoredBestScore(mode: ModeKey) {
  if (typeof window === "undefined") return 0;
  const key = MODES[mode].bestKey;
  const stored = window.localStorage.getItem(key);
  const baseBest = stored ? parseInt(stored, 10) || 0 : 0;
  const legacy = mode === "sprint" ? window.localStorage.getItem(LEGACY_SPRINT_KEY) : null;
  const legacyBest = legacy ? parseInt(legacy, 10) || 0 : 0;
  return Math.max(baseBest, legacyBest);
}

export default function NumberSenseSprint() {
  const [currentMode, setCurrentMode] = useState<ModeKey>("sprint");
  const [stats, setStats] = useState<Stats>({ score: 0, streak: 0, totalAnswered: 0, totalCorrect: 0 });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: "" | "correct" | "wrong" }>({
    message: "",
    type: "",
  });
  const [timeLeft, setTimeLeft] = useState<number | null>(SPRINT_TIME_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [lives, setLives] = useState<number | null>(MODES.sprint.startingLives);
  const [answerInput, setAnswerInput] = useState("");
  const [hasPlayed, setHasPlayed] = useState(false);

  const answerInputRef = useRef<HTMLInputElement>(null);
  const historyId = useRef(0);
  const timeLeftRef = useRef<number | null>(SPRINT_TIME_SECONDS);

  const startLabel = useMemo(() => {
    if (isRunning) return "Running...";
    return hasPlayed ? "Play Again" : "Start Game";
  }, [hasPlayed, isRunning]);
  const bestScore = readStoredBestScore(currentMode);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentMode !== "sprint") return;
    const key = MODES[currentMode].bestKey;
    const stored = window.localStorage.getItem(key);
    const baseBest = stored ? parseInt(stored, 10) || 0 : 0;
    const legacy = window.localStorage.getItem(LEGACY_SPRINT_KEY);
    const legacyBest = legacy ? parseInt(legacy, 10) || 0 : 0;
    if (legacyBest > baseBest) {
      window.localStorage.setItem(key, String(legacyBest));
    }
  }, [currentMode]);

  useEffect(() => {
    if (isRunning) {
      answerInputRef.current?.focus();
    }
  }, [currentQuestion, isRunning]);

  const updateHistory = (entry: Omit<HistoryEntry, "id">) => {
    setHistory((prev) => {
      const next = [{ id: historyId.current++, ...entry }, ...prev];
      return next.slice(0, 25);
    });
  };

  const showFeedback = useCallback((message: string, type: "" | "correct" | "wrong") => {
    setFeedback({ message, type });
  }, []);

  const resetStateForMode = (mode: ModeKey) => {
    setStats({ score: 0, streak: 0, totalAnswered: 0, totalCorrect: 0 });
    setLives(MODES[mode].startingLives);
    setTimeLeft(MODES[mode].hasTimer ? SPRINT_TIME_SECONDS : null);
    setCurrentQuestion(null);
  };

  const saveBestScore = useCallback((mode: ModeKey, newScore: number) => {
    if (typeof window === "undefined") return;
    const key = MODES[mode].bestKey;
    const stored = window.localStorage.getItem(key);
    const best = stored ? parseInt(stored, 10) || 0 : 0;
    if (newScore > best) {
      window.localStorage.setItem(key, String(newScore));
      if (mode === "sprint") {
        window.localStorage.setItem(LEGACY_SPRINT_KEY, String(newScore));
      }
      showFeedback("New personal best!", "correct");
    }
  }, [showFeedback]);

  const startGame = () => {
    if (isRunning) return;
    setIsRunning(true);
    setHasPlayed(true);
    resetStateForMode(currentMode);
    setHistory([]);
    const startMessage =
      currentMode === "sprint"
        ? "Go! 60 seconds on the clock."
        : "Go! You have 3 lives. Difficulty increases as you score.";
    showFeedback(startMessage, "correct");
    setAnswerInput("");
    const initialQuestion = generateQuestion(Math.random, null, 1);
    setCurrentQuestion(initialQuestion);
  };

  const endGame = useCallback(
    (reason: "time" | "out_of_lives" | "manual", finalStats: Stats = stats) => {
      if (!isRunning) return;
      setIsRunning(false);
      if (MODES[currentMode].hasTimer) {
        setTimeLeft((prev) => (prev === null ? 0 : Math.max(0, prev)));
      }
      let message = "";
      if (currentMode === "sprint") {
        message = `Time! Final score: ${finalStats.score} | Score: ${finalStats.totalCorrect}/${finalStats.totalAnswered}`;
      } else if (reason === "out_of_lives") {
        message = `Out of lives! Final score: ${finalStats.score} | Correct: ${finalStats.totalCorrect}/${finalStats.totalAnswered}`;
      } else {
        message = `Final score: ${finalStats.score} | Correct: ${finalStats.totalCorrect}/${finalStats.totalAnswered}`;
      }
      showFeedback(message, "");
      saveBestScore(currentMode, finalStats.score);
    },
    [currentMode, isRunning, saveBestScore, showFeedback, stats]
  );

  useEffect(() => {
    if (!isRunning || !MODES[currentMode].hasTimer) return;
    const intervalId = window.setInterval(() => {
      const current = timeLeftRef.current;
      if (current === null) return;
      const next = Math.max(0, current - 1);
      timeLeftRef.current = next;
      setTimeLeft(next);
      if (next === 0) {
        endGame("time");
      }
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [currentMode, endGame, isRunning]);

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
      if (currentMode === "survival") {
        const nextLives = Math.max(0, (lives ?? 0) - 1);
        setLives(nextLives);
        if (nextLives <= 0) {
          endGame("out_of_lives", result.stats);
          return;
        }
      }
    }

    const nextDifficulty = calculateDifficulty(currentMode, result.stats.totalCorrect);
    setAnswerInput("");

    if (MODES[currentMode].hasTimer && timeLeft !== null && timeLeft <= 0) {
      endGame("time", result.stats);
    } else {
      setCurrentQuestion(generateQuestion(Math.random, null, nextDifficulty));
    }
  };

  const resetBestScore = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(MODES[currentMode].bestKey);
    showFeedback("Best score reset for this mode.", "");
  };

  const switchMode = (mode: ModeKey) => {
    if (mode === currentMode) return;
    setIsRunning(false);
    setCurrentMode(mode);
    setHasPlayed(false);
    resetStateForMode(mode);
    setHistory([]);
    setAnswerInput("");
    showFeedback(`Switched to ${MODES[mode].label}. Press Start to play.`, "");
  };

  const timerDisplay = useMemo(() => {
    if (!MODES[currentMode].hasTimer) return "--";
    if (timeLeft === null) return "--";
    return `${timeLeft}s`;
  }, [currentMode, timeLeft]);
  const isLowTime = MODES[currentMode].hasTimer && timeLeft !== null && timeLeft <= 10;
  const timeProgress = useMemo(() => {
    if (!MODES[currentMode].hasTimer || timeLeft === null) return 0;
    return Math.max(0, Math.min(100, (timeLeft / SPRINT_TIME_SECONDS) * 100));
  }, [currentMode, timeLeft]);
  const introMessage =
    currentMode === "sprint"
      ? "Go for speed. Answer as many questions as you can before the clock hits zero."
      : "Three lives. Difficulty increases as you score.";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <Link className={styles.backLink} to="/">
            <span>&larr;</span>
            Back to games
          </Link>
          <h1 className={styles.title}>Number Sense Sprint</h1>
        </header>
        <div className={styles.intro}>
          <div className={styles.modeRow}>
                          <div className={styles.tag}>Game Mode:</div>
            <div className={styles.modeToggle}>
              <button
                type="button"
                className={`${styles.modeBtn} ${currentMode === "sprint" ? styles.modeBtnActive : ""}`}
                onClick={() => switchMode("sprint")}
              >
                Sprint
              </button>

              <button
                type="button"
                className={`${styles.modeBtn} ${currentMode === "survival" ? styles.modeBtnActive : ""}`}
                onClick={() => switchMode("survival")}
              >
                Survival
              </button>
            </div>
          
          <div className={styles.introMessage}>{introMessage}</div>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryAction}
              disabled={isRunning}
              onClick={startGame}
            >
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
          <div
            className={`${styles.statPill} ${styles.pillHighlight} ${
              currentMode === "survival" ? "" : styles.hidden
            }`}
          >
            <span className={styles.pillLabel}>Lives</span>
            <span className={styles.pillValue}>{lives ?? 0}</span>
          </div>
          <div
            className={`${styles.statPill} ${styles.timerPill} ${
              isLowTime ? styles.statPillAlert : ""
            } ${MODES[currentMode].hasTimer ? "" : styles.hidden}`}
          >
            <Timer className={styles.statIcon} />
            <span className={`${styles.timerText} ${isLowTime ? "" : styles.timerTextQuiet}`}>{timerDisplay}</span>
          </div>
        </div>

        {MODES[currentMode].hasTimer && (
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${timeProgress}%` }} />
          </div>
        )}

        <div className={styles.target}>
          <p className={styles.targetLabel}>Current Question</p>
          <p className={styles.targetNumber}>{currentQuestion ? currentQuestion.text : "Press Start"}</p>
        </div>

        <form className={styles.answerForm} onSubmit={handleAnswerSubmit}>
          <input
            type="number"
            inputMode="numeric"
            className={styles.answerInput}
            placeholder="Type your answer, then tap Submit or press Enter"
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
              feedback.type === "correct"
                ? styles.feedbackCorrect
                : feedback.type === "wrong"
                  ? styles.feedbackWrong
                  : ""
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className={styles.history}>
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`${styles.historyEntry} ${
                entry.isCorrect ? styles.historyEntryCorrect : styles.historyEntryWrong
              }`}
            >
              {entry.isCorrect
                ? `[OK] ${entry.question} = ${entry.correctAnswer}`
                : `[X] ${entry.question} -> you: ${entry.userAnswer} (correct: ${entry.correctAnswer})`}
            </div>
          ))}
        </div>

        <div className={styles.footerRow}>Pro tip: tap Submit or press Enter after each answer.</div>
      </div>
    </div>
  );
}
