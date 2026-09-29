import { getLetterWithWord } from '../../helpers/vocabulary';
import type { ConsonantClass, VocabularyItem } from '../../types/learning';
import Button from '../Button';
import type { AnswerResult } from '../ResultIcon';

interface PracticeFeedbackProps {
  result: AnswerResult | null;
  correctAnswer: VocabularyItem;
  correctClass?: ConsonantClass;
  actionLabel: string;
  actionDisabled?: boolean;
  onAction: () => void;
}

const PracticeFeedback = ({
  result,
  correctAnswer,
  correctClass,
  actionLabel,
  actionDisabled = false,
  onAction,
}: PracticeFeedbackProps) => (
  <div className="sticky bottom-0 -mx-4 mt-6 -mb-12 border-t-2 border-line bg-surface px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
    <div className="mx-auto max-w-content">
      <div className="sr-only" role="status">
        {result === 'correct' && 'Correct.'}
        {result === 'incorrect' &&
          (correctClass ? (
            `Incorrect. The answer is group ${correctClass.group}, ${correctClass.shortName}.`
          ) : (
            <>
              Incorrect. The answer is <span lang="th">{getLetterWithWord(correctAnswer)}</span>.
            </>
          ))}
      </div>
      <Button variant={result === 'incorrect' ? 'danger' : 'primary'} fullWidth disabled={actionDisabled} onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  </div>
);

export default PracticeFeedback;
