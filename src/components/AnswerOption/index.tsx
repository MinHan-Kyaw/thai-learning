import { classNames } from '../../helpers/classNames';

export type AnswerResult = 'correct' | 'incorrect';

type AnswerStatus = 'default' | 'selected' | AnswerResult;

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

const STATUS_CLASS_NAMES: Record<AnswerStatus, string> = {
  default:
    'border-line bg-surface shadow-edge enabled:hover:bg-brand-light enabled:active:translate-y-[3px] enabled:active:shadow-[0_1px_0_var(--color-line)]',
  selected: 'border-selected bg-selected-light shadow-edge-selected',
  correct: 'border-brand bg-brand-light shadow-edge-brand',
  incorrect: 'border-error bg-error-light shadow-edge-error',
};

const AnswerOption = ({ thai, pronunciation, selected, result = null, disabled = false, onSelect }: AnswerOptionProps) => {
  const status: AnswerStatus = result ?? (selected ? 'selected' : 'default');

  return (
    <button
      type="button"
      className={classNames(
        'relative flex min-h-[4.75rem] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 px-12 py-2 text-ink transition-[background-color,border-color,transform] duration-150 disabled:cursor-default',
        STATUS_CLASS_NAMES[status],
        disabled && !result && 'opacity-60'
      )}
      data-status={status}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="font-thai text-[1.625rem] leading-[1.3] font-medium" lang="th">
        {thai}
      </span>{' '}
      <span className="font-burmese text-[1.0625rem] leading-[1.8] text-ink-muted" lang="my">
        {pronunciation}
      </span>{' '}
      {result && (
        <span
          className={classNames(
            'absolute top-1/2 right-4 grid size-7 -translate-y-1/2 place-items-center rounded-full text-white',
            result === 'correct' ? 'bg-brand' : 'bg-error'
          )}
        >
          <svg className="size-4" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d={RESULT_ICON_PATHS[result]} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="sr-only">{RESULT_LABELS[result]}</span>
        </span>
      )}
    </button>
  );
};

export default AnswerOption;
