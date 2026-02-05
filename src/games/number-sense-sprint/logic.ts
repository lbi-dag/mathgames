export type QuestionType = "add" | "sub" | "mul1" | "mul2";

export type Question = {
  text: string;
  answer: number;
  type: QuestionType;
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

export const QUESTION_TYPES: QuestionType[] = ["add", "sub", "mul1", "mul2"];

const MAX_DIFFICULTY = 6;
const MULTIPLY_SYMBOL = "\u00d7";

function clampDifficulty(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_DIFFICULTY, Math.max(1, Math.floor(value)));
}

function additionRange(difficulty: number) {
  const boost = Math.max(0, difficulty - 1);
  const min = 10 + boost * 8;
  const max = 99 + boost * 25;
  return [min, max] as const;
}

function singleDigitRange(difficulty: number) {
  const boost = Math.max(0, difficulty - 1);
  const min = 2 + Math.min(boost, 4);
  const max = 9 + Math.min(boost * 2, 8);
  return [min, max] as const;
}

function multiDigitTimesSingleRange(difficulty: number) {
  const boost = Math.max(0, difficulty - 1);
  const firstMin = 10 + boost * 12;
  const firstMax = 99 + boost * 22;
  const secondMin = 2 + Math.min(boost, 3);
  const secondMax = 9 + Math.min(boost, 5);
  return { firstMin, firstMax, secondMin, secondMax };
}

export function randomInt(min: number, max: number, rng: () => number = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function generateQuestion(
  rng: () => number = Math.random,
  forcedType: QuestionType | null = null,
  difficulty: number = 1,
): Question {
  const type = forcedType ?? QUESTION_TYPES[randomInt(0, QUESTION_TYPES.length - 1, rng)];
  const level = clampDifficulty(difficulty ?? 1);
  let a = 1;
  let b = 1;
  let text = "1 + 1";
  let answer = 2;

  switch (type) {
    case "add": {
      const [min, max] = additionRange(level);
      a = randomInt(min, max, rng);
      b = randomInt(min, max, rng);
      text = `${a} + ${b}`;
      answer = a + b;
      break;
    }
    case "sub": {
      const [min, max] = additionRange(level);
      a = randomInt(min, max, rng);
      b = randomInt(min, max, rng);
      if (b > a) {
        [a, b] = [b, a];
      }
      text = `${a} - ${b}`;
      answer = a - b;
      break;
    }
    case "mul1": {
      const [min, max] = singleDigitRange(level);
      a = randomInt(min, max, rng);
      b = randomInt(min, max, rng);
      text = `${a} ${MULTIPLY_SYMBOL} ${b}`;
      answer = a * b;
      break;
    }
    case "mul2": {
      const ranges = multiDigitTimesSingleRange(level);
      a = randomInt(ranges.firstMin, ranges.firstMax, rng);
      b = randomInt(ranges.secondMin, ranges.secondMax, rng);
      text = `${a} ${MULTIPLY_SYMBOL} ${b}`;
      answer = a * b;
      break;
    }
    default:
      break;
  }

  return { text, answer, type };
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
