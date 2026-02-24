import GameShell from "../components/GameShell";
import { target24GameDefinition } from "../games/target-24/definition";

export default function Target24Page() {
  return <GameShell definition={target24GameDefinition} />;
}
