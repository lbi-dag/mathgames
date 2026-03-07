import type { ExamScorePolicy, RunPhase } from "./types";

export type ExamSlotStatus = "blank" | "answered";

export type ExamQuestionSlot<Q> = {
  question: Q;
  answer: string;
  status: ExamSlotStatus;
  difficulty: number;
};

export type ExamResult = {
  index: number;
  questionLabel: string;
  correctAnswerLabel: string;
  userAnswer: string;
  outcome: "correct" | "wrong" | "blank";
  points: number;
};

export type ExamEngineState<Q> = {
  phase: RunPhase;
  slots: ExamQuestionSlot<Q>[];
  currentIndex: number;
  timeLeftSec: number;
  totalQuestions: number;
  durationSec: number;
  runSeed: number | null;
  // Populated after submit
  results: ExamResult[];
  score: number;
  totalCorrect: number;
  totalWrong: number;
  totalBlank: number;
};

type ExamStartEvent<Q> = {
  type: "EXAM_START";
  slots: ExamQuestionSlot<Q>[];
  seed: number;
  durationSec: number;
};

type ExamTickEvent = {
  type: "EXAM_TICK";
};

type ExamNavigateEvent = {
  type: "EXAM_NAVIGATE";
  index: number;
};

type ExamSetAnswerEvent = {
  type: "EXAM_SET_ANSWER";
  answer: string;
};

type ExamSubmitEvent = {
  type: "EXAM_SUBMIT";
  results: ExamResult[];
  score: number;
  totalCorrect: number;
  totalWrong: number;
  totalBlank: number;
};

export type ExamEngineEvent<Q> =
  | ExamStartEvent<Q>
  | ExamTickEvent
  | ExamNavigateEvent
  | ExamSetAnswerEvent
  | ExamSubmitEvent;

export function createInitialExamState<Q>(
  totalQuestions: number,
  durationSec: number,
): ExamEngineState<Q> {
  return {
    phase: "idle",
    slots: [],
    currentIndex: 0,
    timeLeftSec: durationSec,
    totalQuestions,
    durationSec,
    runSeed: null,
    results: [],
    score: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalBlank: 0,
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled exam event: ${JSON.stringify(value)}`);
}

export function examEngineReducer<Q>(
  state: ExamEngineState<Q>,
  event: ExamEngineEvent<Q>,
): ExamEngineState<Q> {
  switch (event.type) {
    case "EXAM_START": {
      if (state.phase === "running") return state;
      return {
        ...state,
        phase: "running",
        slots: event.slots,
        currentIndex: 0,
        timeLeftSec: event.durationSec,
        runSeed: event.seed,
        results: [],
        score: 0,
        totalCorrect: 0,
        totalWrong: 0,
        totalBlank: 0,
      };
    }

    case "EXAM_TICK": {
      if (state.phase !== "running") return state;
      const nextTime = Math.max(0, state.timeLeftSec - 1);
      if (nextTime > 0) {
        return { ...state, timeLeftSec: nextTime };
      }
      // Time's up — just set to 0. The hook will auto-submit.
      return { ...state, timeLeftSec: 0 };
    }

    case "EXAM_NAVIGATE": {
      if (state.phase !== "running") return state;
      const clamped = Math.max(0, Math.min(event.index, state.slots.length - 1));
      return { ...state, currentIndex: clamped };
    }

    case "EXAM_SET_ANSWER": {
      if (state.phase !== "running") return state;
      if (state.slots.length === 0) return state;
      const slots = [...state.slots];
      const current = slots[state.currentIndex];
      slots[state.currentIndex] = {
        ...current,
        answer: event.answer,
        status: event.answer.trim() === "" ? "blank" : "answered",
      };
      return { ...state, slots };
    }

    case "EXAM_SUBMIT": {
      if (state.phase !== "running") return state;
      return {
        ...state,
        phase: "ended",
        results: event.results,
        score: event.score,
        totalCorrect: event.totalCorrect,
        totalWrong: event.totalWrong,
        totalBlank: event.totalBlank,
      };
    }

    default:
      return assertNever(event);
  }
}

export function computeExamScore(scorePolicy: ExamScorePolicy, totalCorrect: number, totalWrong: number, totalBlank: number) {
  return totalCorrect * scorePolicy.correct + totalWrong * scorePolicy.wrong + totalBlank * scorePolicy.blank;
}
