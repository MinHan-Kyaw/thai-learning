import { classNames } from '../../helpers/classNames';

import styles from './index.module.css';

export type AnswerResult = 'correct' | 'incorrect';

interface AnswerOptionProps {
  thai: string;
  pronunciation: string;
  selected: boolean;
  result?: AnswerResult | null;
  disabled?: boolean;
  onSelect: () => void;
}

const RESULT_LABELS: Record<AnswerResult, string> = {
  correct: 'Correct',
  incorrect: 'Incorrect',
};

const RESULT_ICON_PATHS: Record<AnswerResult, string> = {
  correct: 'M3 8.5l3 3 7-7',
  incorrect: 'M4 4l8 8M12 4l-8 8',
};

const AnswerOption = ({ thai, pronunciation, selected, result = null, disabled = false, onSelect }: AnswerOptionProps) => (
  <button
    type="button"
    className={classNames(
      styles.option,
      selected && !result && styles.selected,
      result && styles[result],
      disabled && !result && styles.dimmed
    )}
    aria-pressed={selected}
    disabled={disabled}
    onClick={onSelect}
  >
    <span className={styles.thai} lang="th">
      {thai}
    </span>{' '}
    <span className={styles.pronunciation} lang="my">
      {pronunciation}
    </span>{' '}
    {result && (
      <span className={styles.badge}>
        <svg className={styles.badgeIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d={RESULT_ICON_PATHS[result]} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="visuallyHidden">{RESULT_LABELS[result]}</span>
      </span>
    )}
  </button>
);

export default AnswerOption;
