export const PRIMES_UNDER_50 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

export const GAME_DURATION_SECONDS = 60;

export type CompositeQuestion = {
  number: number;
  factors: number[];
};

export type GameState = "idle" | "playing" | "correct" | "incorrect" | "gameover";

export function generateCompositeNumber(rng: () => number = Math.random): CompositeQuestion {
  const primes = [...PRIMES_UNDER_50];
  for (let i = primes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [primes[i], primes[j]] = [primes[j], primes[i]];
  }
  const factors = primes.slice(0, 3).sort((a, b) => a - b);
  const number = factors.reduce((acc, f) => acc * f, 1);
  return { number, factors };
}

export function isCorrectSelection(selection: number[], factors: number[]) {
  if (selection.length !== factors.length) return false;
  for (let i = 0; i < selection.length; i += 1) {
    if (selection[i] !== factors[i]) return false;
  }
  return true;
}

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
