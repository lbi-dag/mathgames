import GameShell from "../components/GameShell";
import { exponentGameDefinition } from "../games/exponent-sprint/definition";

export default function ExponentSprintPage() {
  return <GameShell definition={exponentGameDefinition} />;
}
