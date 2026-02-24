import GameShell from "../components/GameShell";
import { speedArithmeticGameDefinition } from "../games/speed-arithmetic/definition";

export default function SpeedArithmeticPage() {
  return <GameShell definition={speedArithmeticGameDefinition} />;
}
