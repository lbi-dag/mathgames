import GameShell from "../components/GameShell";
import { numberSenseGameDefinition, numberSenseScorePolicy } from "../games/number-sense/definition";

export default function NumberSensePage() {
  return <GameShell definition={numberSenseGameDefinition} scorePolicy={numberSenseScorePolicy} />;
}
