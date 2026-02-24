import GameShell from "../components/GameShell";
import { powerBlitzGameDefinition } from "../games/power-blitz/definition";

export default function PowerBlitzPage() {
  return <GameShell definition={powerBlitzGameDefinition} />;
}
