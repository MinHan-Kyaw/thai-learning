import { classNames } from '../../helpers/classNames';
import { getLetterWithWord } from '../../helpers/vocabulary';
import type { VocabularyItem } from '../../types/learning';
import type { AnswerResult } from '../AnswerOption';
import Button from '../Button';

import styles from './index.module.css';

interface PracticeFeedbackProps {
  result: AnswerResult | null;
  correctAnswer: VocabularyItem;
  actionLabel: string;
  actionDisabled?: boolean;
  onAction: () => void;
}

const PracticeFeedback = ({ result, correctAnswer, actionLabel, actionDisabled = false, onAction }: PracticeFeedbackProps) => (
  <div className={classNames(styles.bar, result && styles[result])}>
    <div className={styles.inner}>
      <div className="visuallyHidden" role="status">
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
