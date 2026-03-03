import ExamShell from "../components/ExamShell";
import {
  generateNumberSenseExamSet,
  numberSenseExamScorePolicy,
  numberSenseGameDefinition,
} from "../games/number-sense/definition";

export default function NumberSensePage() {
  return (
    <ExamShell
      definition={numberSenseGameDefinition}
      scorePolicy={numberSenseExamScorePolicy}
      totalQuestions={80}
      durationSec={600}
      generateQuestionSet={generateNumberSenseExamSet}
    />
  );
}
