import GameShell from "../components/GameShell";
import { primeFactorGameDefinition } from "../games/prime-factor-challenge/definition";

export default function PrimeFactorChallengePage() {
  return <GameShell definition={primeFactorGameDefinition} />;
}
