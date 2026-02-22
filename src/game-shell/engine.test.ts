import { describe, expect, test } from "vitest";
import { createInitialGameEngineState, gameEngineReducer, type GameEngineState } from "./engine";

type Question = { label: string; answer: number };

function startRunningState(mode: "sprint" | "survival" = "sprint") {
  let state = createInitialGameEngineState<Question, number>({
    mode: "sprint",
    sprintMinutes: 1,
    initialDifficultyLevel: 1,
  });

  if (mode === "survival") {
    state = gameEngineReducer(state, { type: "SET_MODE", mode: "survival" });
  }

  state = gameEngineReducer(state, {
    type: "START_RUN",
    seed: 123,
    initialQuestion: { label: "2 + 2", answer: 4 },
    initialDifficultyLevel: 1,
    nextDifficultyThreshold: 2,
    message: "Go!",
  });

  return state;
}

function wrongEvent(state: GameEngineState<Question, number>) {
  return gameEngineReducer(state, {
    type: "SUBMIT_RESOLVED",
    isCorrect: false,
    normalizedAnswer: 5,
    scoreDelta: 0,
    nextQuestion: { label: "3 + 3", answer: 6 },
    nextDifficultyLevel: state.difficultyLevel,
    nextDifficultyThreshold: state.nextDifficultyThreshold,
    questionLabel: "2 + 2",
    correctAnswerLabel: "4",
    correctMessage: "Correct!",
    wrongMessage: "Missed",
  });
}

describe("gameEngineReducer", () => {
  test("sprint run ends when timer reaches zero", () => {
    let state = startRunningState("sprint");
    for (let i = 0; i < 60; i += 1) {
      state = gameEngineReducer(state, { type: "TICK" });
    }
    expect(state.phase).toBe("ended");
    expect(state.endReason).toBe("time");
    expect(state.timeLeftSec).toBe(0);
  });

  test("sprint run ends on third wrong answer", () => {
    let state = startRunningState("sprint");
    state = wrongEvent(state);
    state = wrongEvent(state);
    state = wrongEvent(state);
    expect(state.phase).toBe("ended");
    expect(state.endReason).toBe("wrong");
    expect(state.wrongAnswers).toBe(3);
  });

  test("survival run ends on first wrong answer", () => {
    let state = startRunningState("survival");
    state = wrongEvent(state);
    expect(state.phase).toBe("ended");
    expect(state.endReason).toBe("wrong");
    expect(state.wrongAnswers).toBe(1);
  });

  test("invalid answer leaves counts unchanged", () => {
    const state = startRunningState("sprint");
    const next = gameEngineReducer(state, {
      type: "SUBMIT_INVALID",
      message: "Invalid input",
    });
    expect(next.totalAnswered).toBe(0);
    expect(next.totalCorrect).toBe(0);
    expect(next.wrongAnswers).toBe(0);
    expect(next.score).toBe(0);
    expect(next.feedback.message).toBe("Invalid input");
  });
});
