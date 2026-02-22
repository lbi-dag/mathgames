import GameShell from "../components/GameShell";
import { numberSenseGameDefinition } from "../games/number-sense/definition";

export default function NumberSenseSprintPage() {
  return <GameShell definition={numberSenseGameDefinition} />;
}
