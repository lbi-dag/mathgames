export type Question = {
  base: number;
  exponent: number;
  answer: number;
  text: string;
};

export type Stats = {
  score: number;
  streak: number;
  totalAnswered: number;
  totalCorrect: number;
};

export type EvaluationStatus = "invalid" | "correct" | "wrong";

export type EvaluationResult = {
  status: EvaluationStatus;
  parsedAnswer: number | null;
  stats: Stats;
};

const MIN_BASE = 2;
const MAX_BASE = 9;
const MIN_EXPONENT = 2;
const MAX_EXPONENT = 9;
const MAX_ANSWER = 10000;
const STARTING_MAX_EXPONENT = 3;
const CORRECTS_PER_STEP = 5;

type ExponentPair = {
  base: number;
  exponent: number;
  answer: number;
};

const PAIRS_BY_EXPONENT: Map<number, ExponentPair[]> = (() => {
  const map = new Map<number, ExponentPair[]>();
  for (let exponent = MIN_EXPONENT; exponent <= MAX_EXPONENT; exponent += 1) {
    const pairs: ExponentPair[] = [];
    for (let base = MIN_BASE; base <= MAX_BASE; base += 1) {
      const answer = Math.pow(base, exponent);
      if (answer <= MAX_ANSWER) {
        pairs.push({ base, exponent, answer });
      }
    }
    if (pairs.length > 0) {
      map.set(exponent, pairs);
    }
  }
  return map;
})();

function maxExponentForCorrect(totalCorrect: number) {
  const safeCorrect = Math.max(0, Math.floor(totalCorrect || 0));
  const unlocked = STARTING_MAX_EXPONENT + Math.floor(safeCorrect / CORRECTS_PER_STEP);
  return Math.min(MAX_EXPONENT, Math.max(MIN_EXPONENT, unlocked));
}

export function maxExponentForDifficulty(difficultyLevel: number) {
  const safeDifficulty = Math.max(1, Math.floor(difficultyLevel || 1));
  const unlocked = STARTING_MAX_EXPONENT + (safeDifficulty - 1);
  return Math.min(MAX_EXPONENT, Math.max(MIN_EXPONENT, unlocked));
}

function allowedPairs(maxExponent: number) {
  const pairs: ExponentPair[] = [];
  for (let exponent = MIN_EXPONENT; exponent <= maxExponent; exponent += 1) {
    const list = PAIRS_BY_EXPONENT.get(exponent);
    if (list) {
      pairs.push(...list);
    }
  }
  return pairs;
}

export function randomInt(min: number, max: number, rng: () => number = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function generateQuestion(rng: () => number = Math.random, totalCorrect: number = 0): Question {
  const maxExponent = maxExponentForCorrect(totalCorrect);
  return generateQuestionFromExponentLimit(rng, maxExponent);
}

export function generateQuestionForDifficulty(rng: () => number = Math.random, difficultyLevel: number = 1): Question {
  const maxExponent = maxExponentForDifficulty(difficultyLevel);
  return generateQuestionFromExponentLimit(rng, maxExponent);
}

function generateQuestionFromExponentLimit(rng: () => number, maxExponent: number): Question {
  const pool = allowedPairs(maxExponent);
  const fallback = pool.length > 0 ? pool : allowedPairs(STARTING_MAX_EXPONENT);
  const options = fallback.length > 0 ? fallback : allowedPairs(MIN_EXPONENT);
  const choice = options[randomInt(0, options.length - 1, rng)];
  return {
    base: choice.base,
    exponent: choice.exponent,
    answer: choice.answer,
    text: `${choice.base}^${choice.exponent}`,
  };
}

export function parseIntegerAnswer(rawInput: unknown) {
  const normalized = rawInput?.toString().trim();
  if (!normalized) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || !Number.isInteger(value)) return null;
  return value;
}

export function evaluateAnswer(rawInput: unknown, currentQuestion: Question | null, stats: Stats): EvaluationResult {
  const parsedAnswer = parseIntegerAnswer(rawInput);
  const baseStats: Stats = {
    score: stats.score || 0,
    streak: stats.streak || 0,
    totalAnswered: stats.totalAnswered || 0,
    totalCorrect: stats.totalCorrect || 0,
  };

  if (parsedAnswer === null || !currentQuestion) {
    return { status: "invalid", parsedAnswer, stats: { ...baseStats } };
  }

  const isCorrect = parsedAnswer === currentQuestion.answer;
  const updatedStats: Stats = { ...baseStats, totalAnswered: baseStats.totalAnswered + 1 };

  if (isCorrect) {
    updatedStats.score += 1;
    updatedStats.streak += 1;
    updatedStats.totalCorrect += 1;
    return { status: "correct", parsedAnswer, stats: updatedStats };
  }

  updatedStats.streak = 0;
  return { status: "wrong", parsedAnswer, stats: updatedStats };
}
