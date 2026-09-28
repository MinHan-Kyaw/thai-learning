import { classNames } from '../../helpers/classNames';
import { getLetterWithWord } from '../../helpers/vocabulary';
import type { VocabularyItem } from '../../types/learning';
import Button from '../Button';
import type { AnswerResult } from '../ResultIcon';

interface PracticeFeedbackProps {
  result: AnswerResult | null;
  correctAnswer: VocabularyItem;
  actionLabel: string;
  actionDisabled?: boolean;
  onAction: () => void;
}

const BAR_CLASS_NAMES: Record<AnswerResult | 'none', string> = {
  none: 'border-line bg-surface',
  correct: 'border-brand-border bg-brand-light',
  incorrect: 'border-error-border bg-error-light',
};

const PracticeFeedback = ({ result, correctAnswer, actionLabel, actionDisabled = false, onAction }: PracticeFeedbackProps) => (
  <div
    className={classNames(
      'sticky bottom-0 -mx-4 mt-6 -mb-12 border-t-2 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]',
      BAR_CLASS_NAMES[result ?? 'none']
    )}
  >
    <div className="mx-auto max-w-content">
      <div className="sr-only" role="status">
        {result === 'correct' && 'Correct.'}
        {result === 'incorrect' && (
          <>
            Incorrect. The answer is <span lang="th">{getLetterWithWord(correctAnswer)}</span>.
          </>
        )}
      </div>
      <Button variant={result === 'incorrect' ? 'danger' : 'primary'} fullWidth disabled={actionDisabled} onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  </div>
);

export default PracticeFeedback;
