import type { ReactNode } from "react";

export type GameMode = "sprint" | "survival";
export type SprintMinutes = 1 | 3 | 5;
export type RunPhase = "idle" | "running" | "ended";

export type AnswerOutcome<N = unknown> =
  | { kind: "invalid"; message: string }
  | { kind: "correct"; normalizedAnswer: N }
  | { kind: "wrong"; normalizedAnswer: N };

export type ScorePolicy = (ctx: {
  isCorrect: boolean;
  currentScore: number;
  totalCorrect: number;
  totalAnswered: number;
  difficultyLevel: number;
  mode: GameMode;
  timeLeftSec: number | null;
}) => number;

export interface GameDefinition<Q, A, N = unknown> {
  gameId: string;
  title: string;
  subtitle?: string;
  initialDifficulty?: number;
  createInitialAnswer: () => A;
  generateQuestion: (ctx: { rng: () => number; difficultyLevel: number; previousQuestion: Q | null }) => Q;
  evaluateAnswer: (ctx: { question: Q; answer: A }) => AnswerOutcome<N>;
  renderQuestion: (question: Q | null) => ReactNode;
  getCorrectAnswerLabel: (question: Q) => string;
  getQuestionLabel?: (question: Q) => string;
  renderAnswerInput?: (props: {
    value: A;
    onChange: (next: A) => void;
    onSubmit: () => void;
    disabled: boolean;
  }) => ReactNode;
}
