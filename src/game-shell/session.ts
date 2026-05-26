import { createInitialDifficultyState } from "./difficulty";
import type { ExamQuestionSlot } from "./exam-engine";
import { createSeedFromTimestamp, createSeededRng, type Rng } from "./rng";
import type { GameDefinition } from "./types";

export type RunSessionStart<Q> = {
  seed: number;
  rng: Rng;
  initialQuestion: Q;
  initialDifficultyLevel: number;
  nextDifficultyThreshold: number;
};

type ExamQuestionSetEntry<Q> = {
  question: Q;
  difficulty: number;
};

type CreateExamSlotsOptions<Q, A, N> = {
  definition: GameDefinition<Q, A, N>;
  seed: number;
  totalQuestions: number;
  generateQuestionSet?: (rng: Rng, totalQuestions: number) => ExamQuestionSetEntry<Q>[];
};

type CreateExamSessionOptions<Q, A, N> = Omit<CreateExamSlotsOptions<Q, A, N>, "seed"> & {
  timestamp?: number;
};

export type ExamSessionStart<Q> = {
  seed: number;
  slots: ExamQuestionSlot<Q>[];
};

// This is the shared boundary where runtime wall-clock time becomes a deterministic gameplay seed.
export function createSessionSeed(timestamp: number = Date.now()) {
  return createSeedFromTimestamp(timestamp);
}

export function createRunSessionFromSeed<Q, A, N>(
  definition: GameDefinition<Q, A, N>,
  seed: number,
): RunSessionStart<Q> {
  const rng = createSeededRng(seed);
  const difficultyState = createInitialDifficultyState(rng, definition.initialDifficulty ?? 1);
  const initialQuestion = definition.generateQuestion({
    rng,
    difficultyLevel: difficultyState.level,
    previousQuestion: null,
  });

  return {
    seed,
    rng,
    initialQuestion,
    initialDifficultyLevel: difficultyState.level,
    nextDifficultyThreshold: difficultyState.nextThreshold,
  };
}

export function createRunSession<Q, A, N>(
  definition: GameDefinition<Q, A, N>,
  timestamp: number = Date.now(),
): RunSessionStart<Q> {
  return createRunSessionFromSeed(definition, createSessionSeed(timestamp));
}

export function getExamDifficultyForPosition(index: number, totalQuestions: number): number {
  const fraction = index / totalQuestions;
  if (fraction < 0.25) return index < totalQuestions * 0.125 ? 1 : 2;
  if (fraction < 0.5) return 3;
  if (fraction < 0.75) return 4;
  return index < totalQuestions * 0.875 ? 5 : 6;
}

export function createExamSlotsFromSeed<Q, A, N>({
  definition,
  seed,
  totalQuestions,
  generateQuestionSet,
}: CreateExamSlotsOptions<Q, A, N>): ExamQuestionSlot<Q>[] {
  const rng = createSeededRng(seed);

  if (generateQuestionSet) {
    return generateQuestionSet(rng, totalQuestions).map(({ question, difficulty }) => ({
      question,
      answer: "",
      status: "blank",
      difficulty,
    }));
  }

  const slots: ExamQuestionSlot<Q>[] = [];
  let previousQuestion: Q | null = null;
  for (let i = 0; i < totalQuestions; i += 1) {
    const difficulty = getExamDifficultyForPosition(i, totalQuestions);
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

  return slots;
}

export function createExamSession<Q, A, N>({
  definition,
  totalQuestions,
  generateQuestionSet,
  timestamp = Date.now(),
}: CreateExamSessionOptions<Q, A, N>): ExamSessionStart<Q> {
  const seed = createSessionSeed(timestamp);
  return {
    seed,
    slots: createExamSlotsFromSeed({
      definition,
      seed,
      totalQuestions,
      generateQuestionSet,
    }),
  };
}
