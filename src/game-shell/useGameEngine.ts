import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { advanceDifficultyOnCorrect, createInitialDifficultyState } from "./difficulty";
import {
  createInitialGameEngineState,
  gameEngineReducer,
  type GameEngineState,
  type GameOverReason,
} from "./engine";
import {
  getBestScore,
  getSprintMinutesForGame,
  resetBestScore,
  saveBestScore,
  setSprintMinutesForGame,
} from "./leaderboard";
import { createSeedFromTimestamp, createSeededRng, type Rng } from "./rng";
import { defaultScorePolicy } from "./scorePolicy";
import type { GameDefinition, GameMode, ScorePolicy, SprintMinutes } from "./types";

type UseGameEngineOptions<Q, A, N> = {
  definition: GameDefinition<Q, A, N>;
  scorePolicy?: ScorePolicy;
};

type UseGameEngineResult<Q, A, N> = {
  state: GameEngineState<Q, N>;
  answer: A;
  setAnswer: (next: A) => void;
  bestScore: number;
  startRun: () => void;
  submitAnswer: () => void;
  setMode: (mode: GameMode) => void;
  setSprintMinutes: (minutes: SprintMinutes) => void;
  endRun: () => void;
  resetBestForMode: () => void;
};

function defaultQuestionLabel(question: unknown) {
  if (question && typeof question === "object") {
    const text = (question as { text?: unknown }).text;
    if (typeof text === "string" && text.length > 0) {
      return text;
    }
    const numberValue = (question as { number?: unknown }).number;
    if (typeof numberValue === "number") {
      return String(numberValue);
    }
  }
  return "Question";
}

function createStartMessage(mode: GameMode, sprintMinutes: SprintMinutes) {
  if (mode === "sprint") {
    const suffix = sprintMinutes === 1 ? "" : "s";
    return `Go! ${sprintMinutes} minute${suffix} on the clock.`;
  }
  return "Go! Survival ends on your first wrong answer.";
}

function createEndMessage(mode: GameMode, reason: GameOverReason, score: number, totalCorrect: number, totalAnswered: number) {
  if (reason === "time") {
    return `Time! Final score: ${score} | Correct: ${totalCorrect}/${totalAnswered}`;
  }
  if (reason === "wrong") {
    if (mode === "survival") {
      return `Wrong answer ends Survival. Final score: ${score} | Correct: ${totalCorrect}/${totalAnswered}`;
    }
    return `Three wrong answers reached. Final score: ${score} | Correct: ${totalCorrect}/${totalAnswered}`;
  }
  return `Final score: ${score} | Correct: ${totalCorrect}/${totalAnswered}`;
}

export function useGameEngine<Q, A, N>({
  definition,
  scorePolicy = defaultScorePolicy,
}: UseGameEngineOptions<Q, A, N>): UseGameEngineResult<Q, A, N> {
  const initialMode: GameMode = "sprint";
  const initialSprintMinutes = getSprintMinutesForGame(definition.gameId);
  const initialDifficultyLevel = Math.max(1, Math.floor(definition.initialDifficulty ?? 1));

  const [state, dispatch] = useReducer(
    gameEngineReducer<Q, N>,
    createInitialGameEngineState<Q, N>({
      mode: initialMode,
      sprintMinutes: initialSprintMinutes,
      initialDifficultyLevel,
    }),
  );

  const [answer, setAnswer] = useState<A>(() => definition.createInitialAnswer());
  const rngRef = useRef<Rng>(() => Math.random());
  const phaseRef = useRef(state.phase);

  useEffect(() => {
    if (state.phase !== "running" || state.mode !== "sprint") return undefined;
    const intervalId = window.setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [state.mode, state.phase]);

  useEffect(() => {
    const previousPhase = phaseRef.current;
    if (previousPhase === "running" && state.phase === "ended") {
      const bestResult = saveBestScore(definition.gameId, state.mode, state.score);
      const summary = createEndMessage(state.mode, state.endReason, state.score, state.totalCorrect, state.totalAnswered);
      const suffix = bestResult.updated ? " New personal best!" : "";
      dispatch({
        type: "SET_FEEDBACK",
        message: `${summary}${suffix}`,
        tone: bestResult.updated ? "correct" : "",
      });
    }
    phaseRef.current = state.phase;
  }, [
    definition.gameId,
    state.endReason,
    state.mode,
    state.phase,
    state.score,
    state.totalAnswered,
    state.totalCorrect,
  ]);

  const startRun = useCallback(() => {
    if (state.phase === "running") return;

    const seed = createSeedFromTimestamp(Date.now());
    const rng = createSeededRng(seed);
    rngRef.current = rng;
    const difficultyState = createInitialDifficultyState(rng, definition.initialDifficulty ?? 1);
    const initialQuestion = definition.generateQuestion({
      rng,
      difficultyLevel: difficultyState.level,
      previousQuestion: null,
    });
    dispatch({
      type: "START_RUN",
      seed,
      initialQuestion,
      initialDifficultyLevel: difficultyState.level,
      nextDifficultyThreshold: difficultyState.nextThreshold,
      message: createStartMessage(state.mode, state.sprintMinutes),
    });
    setAnswer(definition.createInitialAnswer());
  }, [definition, state.mode, state.phase, state.sprintMinutes]);

  const submitAnswer = useCallback(() => {
    if (state.phase !== "running" || state.question === null) return;

    const outcome = definition.evaluateAnswer({ question: state.question, answer });
    if (outcome.kind === "invalid") {
      dispatch({
        type: "SUBMIT_INVALID",
        message: outcome.message,
      });
      return;
    }

    const isCorrect = outcome.kind === "correct";
    const nextTotalAnswered = state.totalAnswered + 1;
    const nextTotalCorrect = isCorrect ? state.totalCorrect + 1 : state.totalCorrect;

    const rawScoreDelta = scorePolicy({
      isCorrect,
      currentScore: state.score,
      totalCorrect: nextTotalCorrect,
      totalAnswered: nextTotalAnswered,
      difficultyLevel: state.difficultyLevel,
      mode: state.mode,
      timeLeftSec: state.timeLeftSec,
    });
    const scoreDelta = Number.isFinite(rawScoreDelta) ? rawScoreDelta : 0;

    const baseDifficultyState = {
      level: state.difficultyLevel,
      nextThreshold: state.nextDifficultyThreshold,
    };
    const nextDifficultyState = isCorrect
      ? advanceDifficultyOnCorrect(baseDifficultyState, nextTotalCorrect, rngRef.current)
      : baseDifficultyState;

    const nextWrongAnswers = isCorrect ? state.wrongAnswers : state.wrongAnswers + 1;
    const endsByWrong = nextWrongAnswers >= state.wrongLimit;
    const endsByTime = state.mode === "sprint" && state.timeLeftSec !== null && state.timeLeftSec <= 0;
    const willEnd = endsByWrong || endsByTime;

    const nextQuestion = willEnd
      ? null
      : definition.generateQuestion({
          rng: rngRef.current,
          difficultyLevel: nextDifficultyState.level,
          previousQuestion: state.question,
        });

    const questionLabel = definition.getQuestionLabel
      ? definition.getQuestionLabel(state.question)
      : defaultQuestionLabel(state.question);

    dispatch({
      type: "SUBMIT_RESOLVED",
      isCorrect,
      normalizedAnswer: outcome.normalizedAnswer,
      scoreDelta,
      nextQuestion,
      nextDifficultyLevel: nextDifficultyState.level,
      nextDifficultyThreshold: nextDifficultyState.nextThreshold,
      questionLabel,
      correctAnswerLabel: definition.getCorrectAnswerLabel(state.question),
      correctMessage: "Correct!",
      wrongMessage: `Missed: ${questionLabel} = ${definition.getCorrectAnswerLabel(state.question)}`,
    });
    setAnswer(definition.createInitialAnswer());
  }, [answer, definition, scorePolicy, state]);

  const setMode = useCallback(
    (mode: GameMode) => {
      if (mode === state.mode) return;
      dispatch({
        type: "SET_MODE",
        mode,
        message: `Switched to ${mode === "sprint" ? "Sprint" : "Survival"}. Press Start to play.`,
      });
      setAnswer(definition.createInitialAnswer());
    },
    [definition, state.mode],
  );

  const setSprintMinutes = useCallback(
    (minutes: SprintMinutes) => {
      if (minutes === state.sprintMinutes) return;
      setSprintMinutesForGame(definition.gameId, minutes);
      dispatch({
        type: "SET_SPRINT_MINUTES",
        minutes,
        message: `Sprint length set to ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      });
    },
    [definition.gameId, state.sprintMinutes],
  );

  const endRun = useCallback(() => {
    dispatch({ type: "END_RUN", reason: "manual" });
  }, []);

  const resetBestForMode = useCallback(() => {
    resetBestScore(definition.gameId, state.mode);
    dispatch({
      type: "SET_FEEDBACK",
      message: "Best score reset for this mode.",
      tone: "",
    });
  }, [definition.gameId, state.mode]);

  return useMemo(
    () => ({
      state,
      answer,
      setAnswer,
      bestScore: getBestScore(definition.gameId, state.mode),
      startRun,
      submitAnswer,
      setMode,
      setSprintMinutes,
      endRun,
      resetBestForMode,
    }),
    [answer, definition.gameId, endRun, resetBestForMode, setMode, setSprintMinutes, startRun, state, submitAnswer],
  );
}
