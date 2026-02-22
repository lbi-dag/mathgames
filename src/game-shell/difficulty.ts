import { randomInt, type Rng } from "./rng";

export type DifficultyState = {
  level: number;
  nextThreshold: number;
};

export function clampDifficulty(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

export function createInitialDifficultyState(rng: Rng, initialDifficulty: number = 1): DifficultyState {
  const level = clampDifficulty(initialDifficulty);
  return {
    level,
    nextThreshold: randomInt(rng, 2, 3),
  };
}

export function advanceDifficultyOnCorrect(
  state: DifficultyState,
  totalCorrect: number,
  rng: Rng,
): DifficultyState {
  let level = state.level;
  let nextThreshold = state.nextThreshold;
  while (totalCorrect >= nextThreshold) {
    level += 1;
    nextThreshold += randomInt(rng, 2, 3);
  }
  return { level, nextThreshold };
}
