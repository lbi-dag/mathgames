import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Play, RefreshCw, Timer, Trophy, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  type CompositeQuestion,
  GAME_DURATION_SECONDS,
  generateCompositeNumber,
  type GameState,
  formatTime,
  isCorrectSelection,
  PRIMES_UNDER_50,
} from "./logic";
import styles from "./PrimeFactorChallenge.module.css";

export default function PrimeFactorChallenge() {
  const [question, setQuestion] = useState<CompositeQuestion>(() => generateCompositeNumber());
  const [selectedPrimes, setSelectedPrimes] = useState<Set<number>>(new Set());
  const [gameState, setGameState] = useState<GameState>("idle");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const accuracy = useMemo(() => {
    if (questionsAnswered === 0) return 0;
    return Math.round((score / questionsAnswered) * 100);
  }, [questionsAnswered, score]);

  useEffect(() => {
    if (gameState !== "playing" && gameState !== "correct" && gameState !== "incorrect") {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
          }
          setGameState("gameover");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  const resetRound = useCallback(() => {
    setQuestion(generateCompositeNumber());
    setSelectedPrimes(new Set());
  }, []);

  const startGame = useCallback(() => {
    resetRound();
    setGameState("playing");
    setTimeLeft(GAME_DURATION_SECONDS);
    setScore(0);
    setQuestionsAnswered(0);
  }, [resetRound]);

  const togglePrime = (prime: number) => {
    if (gameState !== "playing") return;

    setSelectedPrimes((prev) => {
      const next = new Set(prev);
      if (next.has(prime)) {
        next.delete(prime);
      } else if (next.size < 3) {
        next.add(prime);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (selectedPrimes.size !== 3 || gameState !== "playing") return;

    const selected = Array.from(selectedPrimes).sort((a, b) => a - b);
    const isCorrect = isCorrectSelection(selected, question.factors);

    setQuestionsAnswered((prev) => prev + 1);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setGameState(isCorrect ? "correct" : "incorrect");
  };

  const handleNextQuestion = useCallback(() => {
    resetRound();
    setGameState("playing");
  }, [resetRound]);

  const handleNewGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const timeProgress = Math.max(0, Math.min(100, (timeLeft / GAME_DURATION_SECONDS) * 100));
  const selectionCountClass =
    selectedPrimes.size === 3 ? `${styles.selectionCount} ${styles.selectionReady}` : styles.selectionCount;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <Link className={styles.backLink} to="/">
            <span>&larr;</span>
            Back to games
          </Link>
          <h1 className={styles.title}>Prime Factor Challenge</h1>
          <p className={styles.subtitle}>Find the 3 prime factors of the number below</p>
        </header>

        <div className={styles.intro}>
          <span className={styles.introIcon}>
            <Timer className={styles.statIcon} />
          </span>
          <p>You have 60 seconds to answer as many questions as you can.</p>
          <p className={styles.footerRow}>Each question asks you to find exactly 3 prime factors.</p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={startGame}
              disabled={gameState === "playing"}
            >
              <Play className={styles.statIcon} />
              {gameState === "playing" ? "Running..." : "Start Game"}
            </button>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={`${styles.statPill} ${styles.timerPill} ${timeLeft <= 10 ? styles.statPillAlert : ""}`}>
            <Timer className={styles.statIcon} />
            <span className={`${styles.timerText} ${timeLeft <= 10 ? "" : styles.timerTextQuiet}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className={styles.statPill}>
            <Trophy className={styles.statIcon} />
            {score}/{questionsAnswered}
          </div>
        </div>

        <div className={styles.progressTrack}>
          <div className={styles.progressBar} style={{ width: `${timeProgress}%` }} />
        </div>

        <div className={styles.target}>
          <p className={styles.targetLabel}>Find the prime factors of</p>
          <p className={styles.targetNumber}>{question.number}</p>
        </div>

        <div className={styles.selectionRow}>
          Selected: <span className={selectionCountClass}>{selectedPrimes.size}/3</span>
        </div>

        <div className={styles.primeGrid}>
          {PRIMES_UNDER_50.map((prime) => {
            const isSelected = selectedPrimes.has(prime);
            const isDisabled = gameState !== "playing" || (!isSelected && selectedPrimes.size >= 3);
            return (
              <button
                key={prime}
                type="button"
                className={[
                  styles.primeButton,
                  isSelected ? styles.primeButtonSelected : "",
                  isDisabled && !isSelected ? styles.primeButtonDisabled : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => togglePrime(prime)}
                disabled={gameState !== "playing"}
              >
                {prime}
              </button>
            );
          })}
        </div>

        {gameState !== "playing" && gameState !== "idle" && (
          <div
            className={[
              styles.resultCard,
              gameState === "gameover"
                ? styles.resultNeutral
                : gameState === "correct"
                  ? styles.resultCorrect
                  : styles.resultWrong,
            ].join(" ")}
          >
            <div className={styles.resultTitle}>
              {gameState === "gameover" ? (
                <Trophy className={styles.statIcon} />
              ) : gameState === "correct" ? (
                <Check className={styles.statIcon} />
              ) : (
                <X className={styles.statIcon} />
              )}
              {gameState === "gameover" ? "Time's up!" : gameState === "correct" ? "Correct!" : "Not quite..."}
            </div>
            {gameState === "gameover" ? (
              <>
                <p className={styles.resultScore}>{score}</p>
                <p className={styles.resultEquation}>
                  out of {questionsAnswered} questions correct
                </p>
                {questionsAnswered > 0 && <p className={styles.footerRow}>Accuracy: {accuracy}%</p>}
              </>
            ) : (
              <p className={styles.resultEquation}>
                {question.number} = {question.factors.join(" × ")}
              </p>
            )}
          </div>
        )}

        <div className={styles.actions}>
          {gameState === "gameover" ? (
            <button type="button" className={styles.primaryAction} onClick={handleNewGame}>
              <RefreshCw className={styles.statIcon} />
              Play Again
            </button>
          ) : gameState === "playing" ? (
            <button
              type="button"
              className={styles.primaryAction}
              onClick={handleSubmit}
              disabled={selectedPrimes.size !== 3}
            >
              Submit Answer
            </button>
          ) : gameState === "idle" ? null : (
            <button type="button" className={styles.secondaryAction} onClick={handleNextQuestion}>
              Next Question
            </button>
          )}
        </div>

        <div className={styles.footerRow}>Pick exactly three primes to match the composite number.</div>
      </div>
    </div>
  );
}
