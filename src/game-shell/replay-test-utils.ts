/* eslint-disable @typescript-eslint/no-explicit-any -- test-only cross-game replay driver */
import { advanceDifficultyOnCorrect, type DifficultyState } from "./difficulty";
import { createRunSessionFromSeed } from "./session";
import type { GameDefinition } from "./types";

type AnyDefinition = GameDefinition<any, any, any>;
type AnswerFor = (question: any, correctAnswerLabel: string) => any;

type ReplayStep = {
  question: unknown;
  questionLabel: string;
  outcome: unknown;
  difficultyLevel: number;
  nextDifficultyThreshold: number;
};

export type ReplayTrace = {
  initialQuestion: unknown;
  initialDifficultyLevel: number;
  nextDifficultyThreshold: number;
  steps: ReplayStep[];
};

function questionLabel(definition: AnyDefinition, question: any) {
  return definition.getQuestionLabel?.(question) ?? definition.getCorrectAnswerLabel(question);
}

export function createReplayTrace(
  definition: AnyDefinition,
  seed: number,
  answerFor: AnswerFor,
  correctAnswers: number,
): ReplayTrace {
  const session = createRunSessionFromSeed(definition, seed);
  let question = session.initialQuestion;
  let difficulty: DifficultyState = {
    level: session.initialDifficultyLevel,
    nextThreshold: session.nextDifficultyThreshold,
  };
  const steps: ReplayStep[] = [];

  for (let totalCorrect = 1; totalCorrect <= correctAnswers; totalCorrect += 1) {
    const answer = answerFor(question, definition.getCorrectAnswerLabel(question));
    const outcome = definition.evaluateAnswer({ question, answer });
    if (outcome.kind !== "correct") {
      throw new Error(`Replay fixture did not solve ${definition.gameId}: ${questionLabel(definition, question)}`);
    }

    difficulty = advanceDifficultyOnCorrect(difficulty, totalCorrect, session.rng);
    const nextQuestion = definition.generateQuestion({
      rng: session.rng,
      difficultyLevel: difficulty.level,
      previousQuestion: question,
    });
    steps.push({
      question,
      questionLabel: questionLabel(definition, question),
      outcome,
      difficultyLevel: difficulty.level,
      nextDifficultyThreshold: difficulty.nextThreshold,
    });
    question = nextQuestion;
  }

  return {
    initialQuestion: session.initialQuestion,
    initialDifficultyLevel: session.initialDifficultyLevel,
    nextDifficultyThreshold: session.nextDifficultyThreshold,
    steps,
  };
}

function wrongAnswerFor(definition: AnyDefinition, question: any): unknown {
  switch (definition.gameId) {
    case "factor-rush":
      return [-1, -2, -3];
    case "target-24": {
      const [a, b, c, d] = question.numbers as [number, number, number, number];
      return `${a} - ${b} - ${c} - ${d}`;
    }
    default:
      return "-999999999";
  }
}

export function assertDefinitionPurity(definition: AnyDefinition, seed: number, answerFor: AnswerFor) {
  const inspected = createRunSessionFromSeed(definition, seed);
  const untouched = createRunSessionFromSeed(definition, seed);
  const inspectedQuestion = inspected.initialQuestion;

  definition.evaluateAnswer({
    question: inspectedQuestion,
    answer: answerFor(inspectedQuestion, definition.getCorrectAnswerLabel(inspectedQuestion)),
  });
  definition.evaluateAnswer({ question: inspectedQuestion, answer: wrongAnswerFor(definition, inspectedQuestion) });
  definition.evaluateAnswer({ question: inspectedQuestion, answer: definition.createInitialAnswer() });
  definition.renderQuestion(inspectedQuestion);
  definition.getQuestionLabel?.(inspectedQuestion);
  definition.getCorrectAnswerLabel(inspectedQuestion);

  const inspectedNext = definition.generateQuestion({
    rng: inspected.rng,
    difficultyLevel: inspected.initialDifficultyLevel,
    previousQuestion: inspectedQuestion,
  });
  const untouchedNext = definition.generateQuestion({
    rng: untouched.rng,
    difficultyLevel: untouched.initialDifficultyLevel,
    previousQuestion: untouched.initialQuestion,
  });

  if (JSON.stringify(inspectedNext) !== JSON.stringify(untouchedNext)) {
    throw new Error(`${definition.gameId} evaluation or presentation advanced the gameplay RNG`);
  }
}

type Expression = { value: number; text: string };

export function target24CorrectAnswer(question: { numbers: [number, number, number, number] }): string {
  const solve = (values: Expression[]): string | null => {
    if (values.length === 1) {
      return Math.abs(values[0].value - 24) < 1e-9 ? values[0].text : null;
    }

    for (let i = 0; i < values.length; i += 1) {
      for (let j = i + 1; j < values.length; j += 1) {
        const rest = values.filter((_, index) => index !== i && index !== j);
        const left = values[i];
        const right = values[j];
        const candidates: Expression[] = [
          { value: left.value + right.value, text: `(${left.text}+${right.text})` },
          { value: left.value - right.value, text: `(${left.text}-${right.text})` },
          { value: right.value - left.value, text: `(${right.text}-${left.text})` },
          { value: left.value * right.value, text: `(${left.text}*${right.text})` },
        ];
        if (Math.abs(right.value) > 1e-9) candidates.push({ value: left.value / right.value, text: `(${left.text}/${right.text})` });
        if (Math.abs(left.value) > 1e-9) candidates.push({ value: right.value / left.value, text: `(${right.text}/${left.text})` });

        for (const candidate of candidates) {
          const solution = solve([...rest, candidate]);
          if (solution) return solution;
        }
      }
    }
    return null;
  };

  const solution = solve(question.numbers.map((value) => ({ value, text: String(value) })));
  if (!solution) throw new Error(`No Target 24 solution for ${question.numbers.join(", ")}`);
  return solution;
}
