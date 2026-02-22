export const PRIMES_UNDER_50 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

export const GAME_DURATION_SECONDS = 60;

export type CompositeQuestion = {
  number: number;
  factors: number[];
};

export type GameState = "idle" | "playing" | "gameover";

export type CompositeNumberOptions = {
  rng?: () => number;
  roundIndex?: number;
};

const COMPOSITE_QUESTIONS: CompositeQuestion[] = (() => {
  const questions: CompositeQuestion[] = [];
  for (let i = 0; i < PRIMES_UNDER_50.length - 2; i += 1) {
    for (let j = i + 1; j < PRIMES_UNDER_50.length - 1; j += 1) {
      for (let k = j + 1; k < PRIMES_UNDER_50.length; k += 1) {
        const factors = [PRIMES_UNDER_50[i], PRIMES_UNDER_50[j], PRIMES_UNDER_50[k]];
        questions.push({
          number: factors[0] * factors[1] * factors[2],
          factors,
        });
      }
    }
  }
  questions.sort((a, b) => a.number - b.number);
  return questions;
})();

export function generateCompositeNumber(options: CompositeNumberOptions = {}): CompositeQuestion {
  const { rng = Math.random, roundIndex } = options;
  if (roundIndex !== undefined) {
    const safeIndex = Math.max(0, Math.min(Math.floor(roundIndex), COMPOSITE_QUESTIONS.length - 1));
    const question = COMPOSITE_QUESTIONS[safeIndex];
    return { number: question.number, factors: [...question.factors] };
  }

  const primes = [...PRIMES_UNDER_50];
  for (let i = primes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [primes[i], primes[j]] = [primes[j], primes[i]];
  }
  const factors = primes.slice(0, 3).sort((a, b) => a - b);
  const number = factors.reduce((acc, f) => acc * f, 1);
  return { number, factors };
}

export function generateCompositeNumberForDifficulty(options: { rng?: () => number; difficultyLevel?: number } = {}) {
  const { rng = Math.random, difficultyLevel = 1 } = options;
  const safeDifficulty = Math.max(1, Math.floor(difficultyLevel || 1));
  const maxPoolSize = Math.min(PRIMES_UNDER_50.length, 6 + (safeDifficulty - 1) * 3);
  const pool = PRIMES_UNDER_50.slice(0, Math.max(3, maxPoolSize));

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const factors = shuffled.slice(0, 3).sort((a, b) => a - b);
  return {
    number: factors.reduce((acc, value) => acc * value, 1),
    factors,
  };
}

export function isCorrectSelection(selection: number[], factors: number[]) {
  if (selection.length !== factors.length) return false;
  const sortedSelection = [...selection].sort((a, b) => a - b);
  const sortedFactors = [...factors].sort((a, b) => a - b);
  for (let i = 0; i < sortedSelection.length; i += 1) {
    if (sortedSelection[i] !== sortedFactors[i]) return false;
  }
  return true;
}

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

