import type { ScorePolicy } from "./types";

export const defaultScorePolicy: ScorePolicy = ({ isCorrect }) => (isCorrect ? 1 : 0);
