import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  computeExamScore,
  createInitialExamState,
  examEngineReducer,
  type ExamEngineState,
  type ExamQuestionSlot,
  type ExamResult,
} from "./exam-engine";
import { getBestScore, resetBestScore, saveBestScore } from "./leaderboard";
import { createSeedFromTimestamp, createSeededRng, type Rng } from "./rng";
import type { ExamScorePolicy, GameDefinition } from "./types";

type UseExamEngineOptions<Q, A, N> = {
  definition: GameDefinition<Q, A, N>;
  scorePolicy: ExamScorePolicy;
  totalQuestions?: number;
  durationSec?: number;
  generateQuestionSet?: (rng: Rng, totalQuestions: number) => { question: Q; difficulty: number }[];
};

type UseExamEngineResult<Q> = {
  state: ExamEngineState<Q>;
  answer: string;
  bestScore: number;
  answeredCount: number;
  startExam: () => void;
  setAnswer: (value: string) => void;
  navigateTo: (index: number) => void;
  navigatePrev: () => void;
  navigateNext: () => void;
  submitExam: () => void;
  resetBest: () => void;
};

function getDifficultyForPosition(index: number, totalQuestions: number): number {
  const fraction = index / totalQuestions;
  if (fraction < 0.25) return index < totalQuestions * 0.125 ? 1 : 2;
  if (fraction < 0.5) return 3;
  if (fraction < 0.75) return 4;
  return index < totalQuestions * 0.875 ? 5 : 6;
}

export function useExamEngine<Q, A, N>({
  definition,
  scorePolicy,
  totalQuestions = 80,
  durationSec = 600,
  generateQuestionSet,
}: UseExamEngineOptions<Q, A, N>): UseExamEngineResult<Q> {
  const [state, dispatch] = useReducer(
    examEngineReducer<Q>,
    createInitialExamState<Q>(totalQuestions, durationSec),
  );

  const submittedRef = useRef(false);

  // Timer
  useEffect(() => {
    if (state.phase !== "running") return undefined;
    const intervalId = window.setInterval(() => {
      dispatch({ type: "EXAM_TICK" });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [state.phase]);

  // Auto-submit when time expires
  const submitExamRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (state.phase === "running" && state.timeLeftSec <= 0 && !submittedRef.current) {
      submitExamRef.current();
    }
  }, [state.phase, state.timeLeftSec]);

  const startExam = useCallback(() => {
    if (state.phase === "running") return;

    submittedRef.current = false;
    const seed = createSeedFromTimestamp(Date.now());
    const rng = createSeededRng(seed);

    let slots: ExamQuestionSlot<Q>[];

    if (generateQuestionSet) {
      // Use game-specific structured exam generation
      slots = generateQuestionSet(rng, totalQuestions).map(({ question, difficulty }) => ({
        question,
        answer: "",
        status: "blank" as const,
        difficulty,
      }));
    } else {
      // Fallback: generic position-based generation
      slots = [];
      let previousQuestion: Q | null = null;
      for (let i = 0; i < totalQuestions; i++) {
        const difficulty = getDifficultyForPosition(i, totalQuestions);
        const question = definition.generateQuestion({
          rng,
          difficultyLevel: difficulty,
          previousQuestion,
        });
        slots.push({
          question,
          answer: "",
          status: "blank",
          difficulty,
        });
        previousQuestion = question;
      }
    }

    dispatch({
      type: "EXAM_START",
      slots,
      seed,
      durationSec,
    });
  }, [definition, durationSec, generateQuestionSet, state.phase, totalQuestions]);

  const setAnswer = useCallback((value: string) => {
    dispatch({ type: "EXAM_SET_ANSWER", answer: value });
  }, []);

  const navigateTo = useCallback((index: number) => {
    dispatch({ type: "EXAM_NAVIGATE", index });
  }, []);

  const navigatePrev = useCallback(() => {
    dispatch({ type: "EXAM_NAVIGATE", index: state.currentIndex - 1 });
  }, [state.currentIndex]);

  const navigateNext = useCallback(() => {
    dispatch({ type: "EXAM_NAVIGATE", index: state.currentIndex + 1 });
  }, [state.currentIndex]);

  const submitExam = useCallback(() => {
    if (state.phase !== "running") return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    const results: ExamResult[] = [];
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalBlank = 0;

    for (let i = 0; i < state.slots.length; i++) {
      const slot = state.slots[i];
      const questionLabel = definition.getQuestionLabel
        ? definition.getQuestionLabel(slot.question)
        : slot.question && typeof slot.question === "object" && "text" in slot.question
          ? String((slot.question as { text: string }).text)
          : `Question ${i + 1}`;
      const correctAnswerLabel = definition.getCorrectAnswerLabel(slot.question);

      if (slot.status === "blank") {
        totalBlank++;
        results.push({
          index: i,
          questionLabel,
          correctAnswerLabel,
          userAnswer: "",
          outcome: "blank",
          points: scorePolicy.blank,
        });
        continue;
      }

      // Evaluate the answer using the game definition
      const outcome = definition.evaluateAnswer({
        question: slot.question,
        answer: slot.answer as A,
      });

      if (outcome.kind === "correct") {
        totalCorrect++;
        results.push({
          index: i,
          questionLabel,
          correctAnswerLabel,
          userAnswer: slot.answer,
          outcome: "correct",
          points: scorePolicy.correct,
        });
      } else {
        // Both "wrong" and "invalid" are scored as wrong
        totalWrong++;
        results.push({
          index: i,
          questionLabel,
          correctAnswerLabel,
          userAnswer: slot.answer,
          outcome: "wrong",
          points: scorePolicy.wrong,
        });
      }
    }

    const score = computeExamScore(scorePolicy, totalCorrect, totalWrong, totalBlank);

    saveBestScore(definition.gameId, "exam", score, undefined, { allowNegative: true });

    dispatch({
      type: "EXAM_SUBMIT",
      results,
      score,
      totalCorrect,
      totalWrong,
      totalBlank,
    });
  }, [definition, scorePolicy, state.phase, state.slots]);

  // Keep the ref in sync for auto-submit
  submitExamRef.current = submitExam;

  const resetBest = useCallback(() => {
    resetBestScore(definition.gameId, "exam");
  }, [definition.gameId]);

  const currentSlot = state.slots[state.currentIndex];
  const answer = currentSlot?.answer ?? "";
  const answeredCount = state.slots.filter((s) => s.status === "answered").length;

  return useMemo(
    () => ({
      state,
      answer,
      bestScore: getBestScore(definition.gameId, "exam"),
      answeredCount,
      startExam,
      setAnswer,
      navigateTo,
      navigatePrev,
      navigateNext,
      submitExam,
      resetBest,
    }),
    [answer, answeredCount, definition.gameId, navigateNext, navigatePrev, navigateTo, resetBest, setAnswer, startExam, state, submitExam],
  );
}
