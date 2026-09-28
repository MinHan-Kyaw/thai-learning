import { classNames } from '../../helpers/classNames';

export type AnswerResult = 'correct' | 'incorrect';

interface ResultIconProps {
  result: AnswerResult;
  className?: string;
}

const RESULT_LABELS: Record<AnswerResult, string> = {
  correct: 'Correct',
  incorrect: 'Incorrect',
};

const RESULT_ICON_PATHS: Record<AnswerResult, string> = {
  correct: 'M3 8.5l3 3 7-7',
  incorrect: 'M4 4l8 8M12 4l-8 8',
};

const ResultIcon = ({ result, className }: ResultIconProps) => (
  <span
    className={classNames(
      'grid size-7 shrink-0 place-items-center rounded-full text-white',
      result === 'correct' ? 'bg-brand' : 'bg-error',
      className
    )}
    data-status={result}
  >
    <svg className="size-4" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={RESULT_ICON_PATHS[result]} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
    <span className="sr-only">{RESULT_LABELS[result]}</span>
  </span>
);

export default ResultIcon;
