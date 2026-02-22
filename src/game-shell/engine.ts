import type { GameMode, RunPhase, SprintMinutes } from "./types";

export type GameOverReason = "time" | "wrong" | "manual" | null;
export type FeedbackTone = "" | "correct" | "wrong";

export type HistoryEntry<N = unknown> = {
  id: number;
  questionLabel: string;
  correctAnswerLabel: string;
  outcome: "correct" | "wrong";
  normalizedAnswer: N;
};

export type GameEngineState<Q, N = unknown> = {
  phase: RunPhase;
  mode: GameMode;
  sprintMinutes: SprintMinutes;
  timeLeftSec: number | null;
  score: number;
  streak: number;
  totalAnswered: number;
  totalCorrect: number;
  wrongAnswers: number;
  wrongLimit: number;
  difficultyLevel: number;
  nextDifficultyThreshold: number;
  question: Q | null;
  feedback: { message: string; tone: FeedbackTone };
  history: HistoryEntry<N>[];
  nextHistoryId: number;
  endReason: GameOverReason;
  runSeed: number | null;
};

type SetModeEvent = {
  type: "SET_MODE";
  mode: GameMode;
  message?: string;
};

type SetSprintMinutesEvent = {
  type: "SET_SPRINT_MINUTES";
  minutes: SprintMinutes;
  message?: string;
};

type StartRunEvent<Q> = {
  type: "START_RUN";
  seed: number;
  initialQuestion: Q;
  initialDifficultyLevel: number;
  nextDifficultyThreshold: number;
  message: string;
};

type TickEvent = {
  type: "TICK";
};

type SubmitInvalidEvent = {
  type: "SUBMIT_INVALID";
  message: string;
};

type SubmitResolvedEvent<Q, N> = {
  type: "SUBMIT_RESOLVED";
  isCorrect: boolean;
  normalizedAnswer: N;
  scoreDelta: number;
  nextQuestion: Q | null;
  nextDifficultyLevel: number;
  nextDifficultyThreshold: number;
  questionLabel: string;
  correctAnswerLabel: string;
  correctMessage: string;
  wrongMessage: string;
};

type EndRunEvent = {
  type: "END_RUN";
  reason: Exclude<GameOverReason, null>;
};

type SetFeedbackEvent = {
  type: "SET_FEEDBACK";
  message: string;
  tone: FeedbackTone;
};

export type GameEngineEvent<Q, N = unknown> =
  | SetModeEvent
  | SetSprintMinutesEvent
  | StartRunEvent<Q>
  | TickEvent
  | SubmitInvalidEvent
  | SubmitResolvedEvent<Q, N>
  | EndRunEvent
  | SetFeedbackEvent;

type InitialStateOptions = {
  mode?: GameMode;
  sprintMinutes?: SprintMinutes;
  initialDifficultyLevel?: number;
};

const DEFAULT_MODE: GameMode = "sprint";
const DEFAULT_SPRINT_MINUTES: SprintMinutes = 1;

function secondsForSprint(minutes: SprintMinutes) {
  return minutes * 60;
}

function wrongLimitForMode(mode: GameMode) {
  return mode === "sprint" ? 3 : 1;
}

function clampDifficultyLevel(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

function assertNever(value: never): never {
  throw new Error(`Unhandled event variant: ${JSON.stringify(value)}`);
}

function resetRunState<Q, N>(
  state: GameEngineState<Q, N>,
  options: { mode?: GameMode; sprintMinutes?: SprintMinutes; feedbackMessage?: string } = {},
): GameEngineState<Q, N> {
  const mode = options.mode ?? state.mode;
  const sprintMinutes = options.sprintMinutes ?? state.sprintMinutes;
  return {
    ...state,
    phase: "idle",
    mode,
    sprintMinutes,
    timeLeftSec: mode === "sprint" ? secondsForSprint(sprintMinutes) : null,
    score: 0,
    streak: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    wrongAnswers: 0,
    wrongLimit: wrongLimitForMode(mode),
    question: null,
    history: [],
    endReason: null,
    runSeed: null,
    nextHistoryId: 0,
    feedback: {
      message: options.feedbackMessage ?? "",
      tone: "",
    },
  };
}

export function createInitialGameEngineState<Q, N = unknown>(options: InitialStateOptions = {}): GameEngineState<Q, N> {
  const mode = options.mode ?? DEFAULT_MODE;
  const sprintMinutes = options.sprintMinutes ?? DEFAULT_SPRINT_MINUTES;
  const initialDifficultyLevel = clampDifficultyLevel(options.initialDifficultyLevel ?? 1);

  return {
    phase: "idle",
    mode,
    sprintMinutes,
    timeLeftSec: mode === "sprint" ? secondsForSprint(sprintMinutes) : null,
    score: 0,
    streak: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    wrongAnswers: 0,
    wrongLimit: wrongLimitForMode(mode),
    difficultyLevel: initialDifficultyLevel,
    nextDifficultyThreshold: 2,
    question: null,
    feedback: { message: "", tone: "" },
    history: [],
    nextHistoryId: 0,
    endReason: null,
    runSeed: null,
  };
}

export function gameEngineReducer<Q, N>(
  state: GameEngineState<Q, N>,
  event: GameEngineEvent<Q, N>,
): GameEngineState<Q, N> {
  switch (event.type) {
    case "SET_MODE": {
      if (state.phase === "running") return state;
      return resetRunState(state, {
        mode: event.mode,
        feedbackMessage: event.message,
      });
    }

    case "SET_SPRINT_MINUTES": {
      if (state.phase === "running") return state;
      return resetRunState(state, {
        sprintMinutes: event.minutes,
        feedbackMessage: event.message,
      });
    }

    case "START_RUN": {
      return {
        ...state,
        phase: "running",
        score: 0,
        streak: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        wrongAnswers: 0,
        wrongLimit: wrongLimitForMode(state.mode),
        question: event.initialQuestion,
        history: [],
        nextHistoryId: 0,
        feedback: { message: event.message, tone: "correct" },
        endReason: null,
        runSeed: event.seed,
        difficultyLevel: clampDifficultyLevel(event.initialDifficultyLevel),
        nextDifficultyThreshold: Math.max(2, Math.floor(event.nextDifficultyThreshold)),
        timeLeftSec: state.mode === "sprint" ? secondsForSprint(state.sprintMinutes) : null,
      };
    }

    case "TICK": {
      if (state.phase !== "running" || state.mode !== "sprint" || state.timeLeftSec === null) {
        return state;
      }

      const nextTime = Math.max(0, state.timeLeftSec - 1);
      if (nextTime > 0) {
        return { ...state, timeLeftSec: nextTime };
      }

      return {
        ...state,
        phase: "ended",
        endReason: "time",
        timeLeftSec: 0,
      };
    }

    case "SUBMIT_INVALID": {
      if (state.phase !== "running") return state;
      return {
        ...state,
        feedback: {
          message: event.message,
          tone: "wrong",
        },
      };
    }

    case "SUBMIT_RESOLVED": {
      if (state.phase !== "running" || state.question === null) {
        return state;
      }

      const totalAnswered = state.totalAnswered + 1;
      const totalCorrect = event.isCorrect ? state.totalCorrect + 1 : state.totalCorrect;
      const score = state.score + event.scoreDelta;
      const wrongAnswers = event.isCorrect ? state.wrongAnswers : state.wrongAnswers + 1;
      const streak = event.isCorrect ? state.streak + 1 : 0;

      const historyEntry: HistoryEntry<N> = {
        id: state.nextHistoryId,
        questionLabel: event.questionLabel,
        correctAnswerLabel: event.correctAnswerLabel,
        outcome: event.isCorrect ? "correct" : "wrong",
        normalizedAnswer: event.normalizedAnswer,
      };
      const history = [historyEntry, ...state.history].slice(0, 25);

      const shouldEndByWrong = wrongAnswers >= state.wrongLimit;
      const shouldEndByTime = state.mode === "sprint" && state.timeLeftSec !== null && state.timeLeftSec <= 0;
      const shouldEnd = shouldEndByWrong || shouldEndByTime;

      return {
        ...state,
        totalAnswered,
        totalCorrect,
        score,
        streak,
        wrongAnswers,
        history,
        nextHistoryId: state.nextHistoryId + 1,
        difficultyLevel: event.nextDifficultyLevel,
        nextDifficultyThreshold: event.nextDifficultyThreshold,
        question: shouldEnd ? state.question : event.nextQuestion,
        phase: shouldEnd ? "ended" : "running",
        endReason: shouldEnd ? (shouldEndByTime ? "time" : "wrong") : null,
        feedback: {
          message: event.isCorrect ? event.correctMessage : event.wrongMessage,
          tone: event.isCorrect ? "correct" : "wrong",
        },
      };
    }

    case "END_RUN": {
      if (state.phase !== "running") return state;
      return {
        ...state,
        phase: "ended",
        endReason: event.reason,
      };
    }

    case "SET_FEEDBACK": {
      return {
        ...state,
        feedback: {
          message: event.message,
          tone: event.tone,
        },
      };
    }

    default:
      return assertNever(event);
  }
}
