export type Target24Question = {
  numbers: [number, number, number, number];
};

type Token =
  | { kind: "number"; value: number }
  | { kind: "operator"; value: "+" | "-" | "*" | "/" }
  | { kind: "paren"; value: "(" | ")" };

type EvalResult =
  | { ok: true; value: number; usedNumbers: number[] }
  | { ok: false; message: string };

const TARGET_VALUE = 24;
const EPSILON = 1e-9;

function randomInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function shuffle<T>(rng: () => number, values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getDifficultyRange(difficultyLevel: number) {
  if (difficultyLevel <= 2) return { min: 1, max: 9 };
  if (difficultyLevel <= 4) return { min: 1, max: 13 };
  return { min: 1, max: 20 };
}

function tokenizeExpression(input: string): Token[] | null {
  const tokens: Token[] = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index];
    if (char === " ") {
      index += 1;
      continue;
    }

    if (/[0-9]/.test(char)) {
      let end = index + 1;
      while (end < input.length && /[0-9]/.test(input[end])) {
        end += 1;
      }
      const raw = input.slice(index, end);
      tokens.push({ kind: "number", value: Number.parseInt(raw, 10) });
      index = end;
      continue;
    }

    if (char === "+" || char === "-" || char === "*" || char === "/") {
      tokens.push({ kind: "operator", value: char });
      index += 1;
      continue;
    }

    if (char === "(" || char === ")") {
      tokens.push({ kind: "paren", value: char });
      index += 1;
      continue;
    }

    return null;
  }

  return tokens;
}

function precedence(operator: "+" | "-" | "*" | "/") {
  return operator === "+" || operator === "-" ? 1 : 2;
}

function toPostfix(tokens: Token[]): Token[] | null {
  const output: Token[] = [];
  const operators: Token[] = [];

  for (const token of tokens) {
    if (token.kind === "number") {
      output.push(token);
      continue;
    }

    if (token.kind === "operator") {
      while (operators.length > 0) {
        const top = operators[operators.length - 1];
        if (top.kind !== "operator") break;
        if (precedence(top.value) < precedence(token.value)) break;
        output.push(operators.pop() as Token);
      }
      operators.push(token);
      continue;
    }

    if (token.value === "(") {
      operators.push(token);
      continue;
    }

    let matched = false;
    while (operators.length > 0) {
      const next = operators.pop() as Token;
      if (next.kind === "paren" && next.value === "(") {
        matched = true;
        break;
      }
      output.push(next);
    }

    if (!matched) {
      return null;
    }
  }

  while (operators.length > 0) {
    const next = operators.pop() as Token;
    if (next.kind === "paren") return null;
    output.push(next);
  }

  return output;
}

function evaluatePostfix(postfix: Token[]): EvalResult {
  const stack: number[] = [];
  const usedNumbers: number[] = [];

  for (const token of postfix) {
    if (token.kind === "number") {
      stack.push(token.value);
      usedNumbers.push(token.value);
      continue;
    }

    if (token.kind !== "operator") {
      return { ok: false, message: "Invalid expression." };
    }

    if (stack.length < 2) {
      return { ok: false, message: "Invalid expression." };
    }

    const right = stack.pop() as number;
    const left = stack.pop() as number;

    if (token.value === "/" && Math.abs(right) < EPSILON) {
      return { ok: false, message: "Division by zero is not allowed." };
    }

    const nextValue =
      token.value === "+"
        ? left + right
        : token.value === "-"
          ? left - right
          : token.value === "*"
            ? left * right
            : left / right;

    stack.push(nextValue);
  }

  if (stack.length !== 1) {
    return { ok: false, message: "Invalid expression." };
  }

  return { ok: true, value: stack[0], usedNumbers };
}

function hasValidTokenFlow(tokens: Token[]) {
  if (tokens.length === 0) return false;

  let openParens = 0;
  let previous: Token | null = null;

  for (const token of tokens) {
    if (token.kind === "number") {
      if (previous && previous.kind === "number") return false;
      if (previous && previous.kind === "paren" && previous.value === ")") return false;
      previous = token;
      continue;
    }

    if (token.kind === "operator") {
      if (!previous || previous.kind === "operator") return false;
      if (previous.kind === "paren" && previous.value === "(") return false;
      previous = token;
      continue;
    }

    if (token.value === "(") {
      if (previous && (previous.kind === "number" || (previous.kind === "paren" && previous.value === ")"))) {
        return false;
      }
      openParens += 1;
      previous = token;
      continue;
    }

    if (!previous || previous.kind === "operator" || (previous.kind === "paren" && previous.value === "(")) {
      return false;
    }

    openParens -= 1;
    if (openParens < 0) return false;
    previous = token;
  }

  if (openParens !== 0 || !previous) return false;
  if (previous.kind === "operator") return false;
  if (previous.kind === "paren" && previous.value === "(") return false;

  return true;
}

function sameMultiset(left: number[], right: number[]) {
  if (left.length !== right.length) return false;
  const leftSorted = [...left].sort((a, b) => a - b);
  const rightSorted = [...right].sort((a, b) => a - b);
  return leftSorted.every((value, index) => value === rightSorted[index]);
}

export function evaluateTarget24Expression(expression: string, question: Target24Question): EvalResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { ok: false, message: "Type an expression before submitting." };
  }

  const tokens = tokenizeExpression(trimmed);
  if (!tokens) {
    return { ok: false, message: "Use only numbers, parentheses, and + - * /." };
  }

  if (!hasValidTokenFlow(tokens)) {
    return { ok: false, message: "The expression format is invalid." };
  }

  const postfix = toPostfix(tokens);
  if (!postfix) {
    return { ok: false, message: "The expression format is invalid." };
  }

  const evaluated = evaluatePostfix(postfix);
  if (!evaluated.ok) {
    return evaluated;
  }

  if (!sameMultiset(evaluated.usedNumbers, question.numbers)) {
    return {
      ok: false,
      message: `Use each number exactly once: ${question.numbers.join(", ")}.`,
    };
  }

  return evaluated;
}

function canMake24(numbers: number[]) {
  const solve = (values: number[]): boolean => {
    if (values.length === 1) {
      return Math.abs(values[0] - TARGET_VALUE) < EPSILON;
    }

    for (let i = 0; i < values.length; i += 1) {
      for (let j = 0; j < values.length; j += 1) {
        if (i === j) continue;

        const remaining = values.filter((_, index) => index !== i && index !== j);
        const a = values[i];
        const b = values[j];
        const nextCandidates: number[] = [a + b, a - b, a * b];
        if (Math.abs(b) > EPSILON) {
          nextCandidates.push(a / b);
        }

        for (const candidate of nextCandidates) {
          if (solve([...remaining, candidate])) return true;
        }
      }
    }

    return false;
  };

  return solve(numbers);
}

export function generateTarget24Question(rng: () => number, difficultyLevel: number): Target24Question {
  const { min, max } = getDifficultyRange(difficultyLevel);

  for (let attempt = 0; attempt < 500; attempt += 1) {
    const candidate: [number, number, number, number] = [
      randomInt(rng, min, max),
      randomInt(rng, min, max),
      randomInt(rng, min, max),
      randomInt(rng, min, max),
    ];

    if (!canMake24(candidate)) continue;

    const shuffled = shuffle(rng, candidate) as [number, number, number, number];
    return { numbers: shuffled };
  }

  return { numbers: [8, 8, 3, 3] };
}

export function formatNumbersForPrompt(question: Target24Question) {
  return question.numbers.join("   ");
}
