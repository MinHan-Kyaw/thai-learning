import type { ReactNode } from 'react';

import { classNames } from '../../helpers/classNames';
import ResultIcon, { type AnswerResult } from '../ResultIcon';

type AnswerStatus = 'default' | 'selected' | AnswerResult;

interface AnswerOptionProps {
  children: ReactNode;
  selected: boolean;
  result?: AnswerResult | null;
  disabled?: boolean;
  compact?: boolean;
  onSelect: () => void;
}

const STATUS_CLASS_NAMES: Record<AnswerStatus, string> = {
  default:
    'border-line bg-surface shadow-edge enabled:hover:bg-brand-light enabled:active:translate-y-[3px] enabled:active:shadow-[0_1px_0_var(--color-line)]',
  selected: 'border-selected bg-selected-light shadow-edge-selected',
  correct: 'border-brand bg-brand-light shadow-edge-brand',
  incorrect: 'border-error bg-error-light shadow-edge-error',
};

const AnswerOption = ({ children, selected, result = null, disabled = false, compact = false, onSelect }: AnswerOptionProps) => {
  const status: AnswerStatus = result ?? (selected ? 'selected' : 'default');

  return (
    <button
      type="button"
      className={classNames(
        'relative flex min-h-[4.75rem] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 py-2 text-ink transition-[background-color,border-color,transform] duration-150 disabled:cursor-default',
        compact ? 'px-3' : 'px-12',
        STATUS_CLASS_NAMES[status],
        disabled && !result && 'opacity-60'
      )}
      data-status={status}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      {children}{' '}
      {result && (
        <ResultIcon
          result={result}
          className={compact ? 'absolute top-2 right-2' : 'absolute top-1/2 right-4 -translate-y-1/2'}
        />
      )}
    </button>
  );
};

export default AnswerOption;
