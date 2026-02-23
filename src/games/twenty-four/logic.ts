export type TwentyFourQuestion = {
  numbers: [number, number, number, number];
  text: string;
  solution: string;
};

type Fraction = {
  numerator: number;
  denominator: number;
};

type SolveState = {
  value: Fraction;
  expression: string;
};

type DifficultyConfig = {
  min: number;
  max: number;
};

const TARGET_VALUE = 24;
const MAX_GENERATION_ATTEMPTS = 250;

const DIFFICULTY_TABLE: Record<number, DifficultyConfig> = {
  1: { min: 1, max: 6 },
  2: { min: 1, max: 8 },
  3: { min: 1, max: 10 },
  4: { min: 1, max: 13 },
};

function normalizeDifficultyLevel(difficultyLevel: number) {
  if (!Number.isFinite(difficultyLevel)) return 1;
  return Math.max(1, Math.floor(difficultyLevel));
}

function difficultyConfigForLevel(level: number): DifficultyConfig {
  const normalized = normalizeDifficultyLevel(level);
  if (normalized <= 1) return DIFFICULTY_TABLE[1];
  if (normalized === 2) return DIFFICULTY_TABLE[2];
  if (normalized === 3) return DIFFICULTY_TABLE[3];
  return DIFFICULTY_TABLE[4];
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

function reduceFraction(value: Fraction): Fraction {
  if (value.denominator === 0) {
    return value;
  }

  const sign = value.denominator < 0 ? -1 : 1;
  const numerator = value.numerator * sign;
  const denominator = value.denominator * sign;
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function add(a: Fraction, b: Fraction): Fraction {
  return reduceFraction({
    numerator: a.numerator * b.denominator + b.numerator * a.denominator,
    denominator: a.denominator * b.denominator,
  });
}

function subtract(a: Fraction, b: Fraction): Fraction {
  return reduceFraction({
    numerator: a.numerator * b.denominator - b.numerator * a.denominator,
    denominator: a.denominator * b.denominator,
  });
}

function multiply(a: Fraction, b: Fraction): Fraction {
  return reduceFraction({
    numerator: a.numerator * b.numerator,
    denominator: a.denominator * b.denominator,
  });
}

function divide(a: Fraction, b: Fraction): Fraction | null {
  if (b.numerator === 0) return null;
  return reduceFraction({
    numerator: a.numerator * b.denominator,
    denominator: a.denominator * b.numerator,
  });
}

function isTargetValue(value: Fraction) {
  return value.denominator !== 0 && value.numerator === TARGET_VALUE * value.denominator;
}

function formatQuestionNumbers(numbers: [number, number, number, number]) {
  return numbers.join(" • ");
}

function sortSignature(numbers: readonly number[]) {
  return [...numbers].sort((a, b) => a - b).join(",");
}

export function randomInt(min: number, max: number, rng: () => number = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function searchSolution(states: SolveState[]): string | null {
  if (states.length === 1) {
    return isTargetValue(states[0].value) ? states[0].expression : null;
  }

  for (let i = 0; i < states.length; i += 1) {
    for (let j = i + 1; j < states.length; j += 1) {
      const left = states[i];
      const right = states[j];
      const rest = states.filter((_, index) => index !== i && index !== j);

      const operations: Array<SolveState | null> = [
        {
          value: add(left.value, right.value),
          expression: `(${left.expression}+${right.expression})`,
        },
        {
          value: subtract(left.value, right.value),
          expression: `(${left.expression}-${right.expression})`,
        },
        {
          value: subtract(right.value, left.value),
          expression: `(${right.expression}-${left.expression})`,
        },
        {
          value: multiply(left.value, right.value),
          expression: `(${left.expression}*${right.expression})`,
        },
        divide(left.value, right.value)
          ? {
              value: divide(left.value, right.value) as Fraction,
              expression: `(${left.expression}/${right.expression})`,
            }
          : null,
        divide(right.value, left.value)
          ? {
              value: divide(right.value, left.value) as Fraction,
              expression: `(${right.expression}/${left.expression})`,
            }
          : null,
      ];

      for (const result of operations) {
        if (!result) continue;
        const solved = searchSolution([...rest, result]);
        if (solved) return solved;
      }
    }
  }

  return null;
}

export function findSolutionExpression(numbers: [number, number, number, number]): string | null {
  const initial: SolveState[] = numbers.map((value) => ({
    value: { numerator: value, denominator: 1 },
    expression: String(value),
  }));
  return searchSolution(initial);
}

export function generateQuestionForDifficulty(
  rng: () => number = Math.random,
  difficultyLevel: number = 1,
  previousQuestion: TwentyFourQuestion | null = null
): TwentyFourQuestion {
  const config = difficultyConfigForLevel(difficultyLevel);
  const previousSignature = previousQuestion ? sortSignature(previousQuestion.numbers) : null;

  let fallbackQuestion: TwentyFourQuestion | null = null;

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const candidate: [number, number, number, number] = [
      randomInt(config.min, config.max, rng),
      randomInt(config.min, config.max, rng),
      randomInt(config.min, config.max, rng),
      randomInt(config.min, config.max, rng),
    ];

    if (previousSignature && sortSignature(candidate) === previousSignature) {
      continue;
    }

    const solution = findSolutionExpression(candidate);
    if (!solution) continue;

    const question: TwentyFourQuestion = {
      numbers: candidate,
      text: formatQuestionNumbers(candidate),
      solution,
    };

    if (!fallbackQuestion) {
      fallbackQuestion = question;
    }

    return question;
  }

  if (fallbackQuestion) {
    return fallbackQuestion;
  }

  const guaranteed: [number, number, number, number] = [3, 3, 8, 8];
  return {
    numbers: guaranteed,
    text: formatQuestionNumbers(guaranteed),
    solution: "(8/(3-(8/3)))",
  };
}

type ParseResult = {
  valid: boolean;
  value?: Fraction;
  usedNumbers?: number[];
  message?: string;
};

type Token =
  | { type: "number"; value: number }
  | { type: "operator"; value: "+" | "-" | "*" | "/" }
  | { type: "lparen" }
  | { type: "rparen" };

function tokenize(rawExpression: string): { tokens: Token[]; error: string | null } {
  const tokens: Token[] = [];

  for (let index = 0; index < rawExpression.length; ) {
    const char = rawExpression[index];

    if (char.trim() === "") {
      index += 1;
      continue;
    }

    if (/[0-9]/.test(char)) {
      let end = index + 1;
      while (end < rawExpression.length && /[0-9]/.test(rawExpression[end])) {
        end += 1;
      }
      const value = Number(rawExpression.slice(index, end));
      tokens.push({ type: "number", value });
      index = end;
      continue;
    }

    if (char === "+" || char === "-" || char === "*" || char === "/") {
      tokens.push({ type: "operator", value: char });
      index += 1;
      continue;
    }

    if (char === "(") {
      tokens.push({ type: "lparen" });
      index += 1;
      continue;
    }

    if (char === ")") {
      tokens.push({ type: "rparen" });
      index += 1;
      continue;
    }

    return {
      tokens: [],
      error: `Unsupported character: ${char}`,
    };
  }

  return { tokens, error: null };
}

export function evaluateTwentyFourExpression(rawExpression: string, question: TwentyFourQuestion): ParseResult {
  const expression = rawExpression.trim();
  if (!expression) {
    return { valid: false, message: "Enter an expression before submitting." };
  }

  const { tokens, error } = tokenize(expression);
  if (error) {
    return { valid: false, message: error };
  }

  let index = 0;
  const usedNumbers: number[] = [];

  const parseExpression = (): Fraction | null => {
    let value = parseTerm();
    if (!value) return null;

    while (index < tokens.length && tokens[index].type === "operator" && (tokens[index].value === "+" || tokens[index].value === "-")) {
      const operator = tokens[index].value;
      index += 1;
      const right = parseTerm();
      if (!right) return null;
      value = operator === "+" ? add(value, right) : subtract(value, right);
    }

    return value;
  };

  const parseTerm = (): Fraction | null => {
    let value = parseFactor();
    if (!value) return null;

    while (index < tokens.length && tokens[index].type === "operator" && (tokens[index].value === "*" || tokens[index].value === "/")) {
      const operator = tokens[index].value;
      index += 1;
      const right = parseFactor();
      if (!right) return null;
      if (operator === "*") {
        value = multiply(value, right);
      } else {
        const quotient = divide(value, right);
        if (!quotient) return null;
        value = quotient;
      }
    }

    return value;
  };

  const parseFactor = (): Fraction | null => {
    const token = tokens[index];
    if (!token) return null;

    if (token.type === "number") {
      index += 1;
      usedNumbers.push(token.value);
      return { numerator: token.value, denominator: 1 };
    }

    if (token.type === "operator" && token.value === "-") {
      index += 1;
      const value = parseFactor();
      if (!value) return null;
      return reduceFraction({ numerator: -value.numerator, denominator: value.denominator });
    }

    if (token.type === "lparen") {
      index += 1;
      const value = parseExpression();
      if (!value) return null;
      if (tokens[index]?.type !== "rparen") {
        return null;
      }
      index += 1;
      return value;
    }

    return null;
  };

  const value = parseExpression();
  if (!value || index !== tokens.length) {
    return {
      valid: false,
      message: "Could not parse expression. Use numbers, + - * /, and parentheses.",
    };
  }

  const required = [...question.numbers].sort((a, b) => a - b).join(",");
  const provided = [...usedNumbers].sort((a, b) => a - b).join(",");

  if (required !== provided) {
    return {
      valid: false,
      message: "Use each of the 4 numbers exactly once.",
    };
  }

  return {
    valid: true,
    value,
    usedNumbers,
  };
}

export function isTwentyFour(value: Fraction) {
  return isTargetValue(value);
}
