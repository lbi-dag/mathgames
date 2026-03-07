import { describe, expect, test } from "vitest";
import {
  computeExamScore,
  createInitialExamState,
  examEngineReducer,
  type ExamEngineState,
  type ExamQuestionSlot,
} from "./exam-engine";

type Q = { text: string; answer: number };

function makeSlots(count: number): ExamQuestionSlot<Q>[] {
  return Array.from({ length: count }, (_, i) => ({
    question: { text: `${i + 1} + 1`, answer: i + 2 },
    answer: "",
    status: "blank" as const,
    difficulty: 1,
  }));
}

function startedState(totalQuestions = 5, durationSec = 60): ExamEngineState<Q> {
  const state = createInitialExamState<Q>(totalQuestions, durationSec);
  return examEngineReducer(state, {
    type: "EXAM_START",
    slots: makeSlots(totalQuestions),
    seed: 42,
    durationSec,
  });
}

describe("examEngineReducer", () => {
  test("initial state is idle with no slots", () => {
    const state = createInitialExamState<Q>(80, 600);
    expect(state.phase).toBe("idle");
    expect(state.slots).toHaveLength(0);
    expect(state.timeLeftSec).toBe(600);
    expect(state.totalQuestions).toBe(80);
  });

  test("EXAM_START transitions to running", () => {
    const state = startedState(5, 60);
    expect(state.phase).toBe("running");
    expect(state.slots).toHaveLength(5);
    expect(state.currentIndex).toBe(0);
    expect(state.timeLeftSec).toBe(60);
    expect(state.runSeed).toBe(42);
  });

  test("EXAM_START is no-op while running", () => {
    const state = startedState();
    const next = examEngineReducer(state, {
      type: "EXAM_START",
      slots: makeSlots(3),
      seed: 99,
      durationSec: 30,
    });
    expect(next).toBe(state);
  });

  test("EXAM_TICK decrements timer", () => {
    const state = startedState(5, 10);
    const next = examEngineReducer(state, { type: "EXAM_TICK" });
    expect(next.timeLeftSec).toBe(9);
  });

  test("EXAM_TICK stops at zero", () => {
    let state = startedState(5, 2);
    state = examEngineReducer(state, { type: "EXAM_TICK" });
    expect(state.timeLeftSec).toBe(1);
    state = examEngineReducer(state, { type: "EXAM_TICK" });
    expect(state.timeLeftSec).toBe(0);
    // Phase stays running — the hook is responsible for auto-submit
    expect(state.phase).toBe("running");
  });

  test("EXAM_TICK is no-op in idle phase", () => {
    const state = createInitialExamState<Q>(5, 60);
    const next = examEngineReducer(state, { type: "EXAM_TICK" });
    expect(next).toBe(state);
  });

  test("EXAM_NAVIGATE changes currentIndex", () => {
    const state = startedState(5);
    const next = examEngineReducer(state, { type: "EXAM_NAVIGATE", index: 3 });
    expect(next.currentIndex).toBe(3);
  });

  test("EXAM_NAVIGATE clamps to valid range", () => {
    const state = startedState(5);
    const tooHigh = examEngineReducer(state, { type: "EXAM_NAVIGATE", index: 99 });
    expect(tooHigh.currentIndex).toBe(4);
    const tooLow = examEngineReducer(state, { type: "EXAM_NAVIGATE", index: -5 });
    expect(tooLow.currentIndex).toBe(0);
  });

  test("EXAM_NAVIGATE is no-op in idle phase", () => {
    const state = createInitialExamState<Q>(5, 60);
    const next = examEngineReducer(state, { type: "EXAM_NAVIGATE", index: 2 });
    expect(next).toBe(state);
  });

  test("EXAM_SET_ANSWER updates current slot", () => {
    const state = startedState(5);
    const next = examEngineReducer(state, { type: "EXAM_SET_ANSWER", answer: "42" });
    expect(next.slots[0].answer).toBe("42");
    expect(next.slots[0].status).toBe("answered");
  });

  test("EXAM_SET_ANSWER marks blank when cleared", () => {
    let state = startedState(5);
    state = examEngineReducer(state, { type: "EXAM_SET_ANSWER", answer: "42" });
    state = examEngineReducer(state, { type: "EXAM_SET_ANSWER", answer: "" });
    expect(state.slots[0].answer).toBe("");
    expect(state.slots[0].status).toBe("blank");
  });

  test("EXAM_SET_ANSWER is no-op in idle phase", () => {
    const state = createInitialExamState<Q>(5, 60);
    const next = examEngineReducer(state, { type: "EXAM_SET_ANSWER", answer: "42" });
    expect(next).toBe(state);
  });

  test("EXAM_SUBMIT transitions to ended with results", () => {
    const state = startedState(3);
    const next = examEngineReducer(state, {
      type: "EXAM_SUBMIT",
      results: [
        { index: 0, questionLabel: "1+1", correctAnswerLabel: "2", userAnswer: "2", outcome: "correct", points: 5 },
        { index: 1, questionLabel: "2+1", correctAnswerLabel: "3", userAnswer: "4", outcome: "wrong", points: -4 },
        { index: 2, questionLabel: "3+1", correctAnswerLabel: "4", userAnswer: "", outcome: "blank", points: 0 },
      ],
      score: 1,
      totalCorrect: 1,
      totalWrong: 1,
      totalBlank: 1,
    });
    expect(next.phase).toBe("ended");
    expect(next.score).toBe(1);
    expect(next.totalCorrect).toBe(1);
    expect(next.totalWrong).toBe(1);
    expect(next.totalBlank).toBe(1);
    expect(next.results).toHaveLength(3);
  });

  test("EXAM_SUBMIT is no-op in idle phase", () => {
    const state = createInitialExamState<Q>(5, 60);
    const next = examEngineReducer(state, {
      type: "EXAM_SUBMIT",
      results: [],
      score: 0,
      totalCorrect: 0,
      totalWrong: 0,
      totalBlank: 0,
    });
    expect(next).toBe(state);
  });

  test("navigate then set answer updates correct slot", () => {
    let state = startedState(5);
    state = examEngineReducer(state, { type: "EXAM_NAVIGATE", index: 2 });
    state = examEngineReducer(state, { type: "EXAM_SET_ANSWER", answer: "7" });
    expect(state.slots[0].status).toBe("blank");
    expect(state.slots[2].answer).toBe("7");
    expect(state.slots[2].status).toBe("answered");
  });
});

describe("computeExamScore", () => {
  test("computes UIL-style scoring", () => {
    const policy = { correct: 5, wrong: -4, blank: 0 };
    expect(computeExamScore(policy, 50, 10, 20)).toBe(50 * 5 + 10 * -4 + 20 * 0);
    expect(computeExamScore(policy, 50, 10, 20)).toBe(210);
  });

  test("can produce negative scores", () => {
    const policy = { correct: 5, wrong: -4, blank: 0 };
    expect(computeExamScore(policy, 0, 20, 60)).toBe(-80);
  });

  test("all blank scores zero", () => {
    const policy = { correct: 5, wrong: -4, blank: 0 };
    expect(computeExamScore(policy, 0, 0, 80)).toBe(0);
  });
});
