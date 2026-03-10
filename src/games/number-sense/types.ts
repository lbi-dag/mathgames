import type { Rng } from "../../game-shell/rng";

export type Rational = {
  num: number;
  den: number;
};

export type NumberSenseQuestion = {
  text: string;
  answer: Rational;
  isApproximate: boolean;
  answerFormat: "integer" | "fraction";
  category: string;
};

export type GeneratorEntry = {
  id: string;
  minDifficulty: number;
  generate: (rng: Rng, difficulty: number) => NumberSenseQuestion;
};
