import GameShell from "../components/GameShell";
import { factorRushGameDefinition } from "../games/factor-rush/definition";

export default function FactorRushPage() {
  return <GameShell definition={factorRushGameDefinition} />;
}
