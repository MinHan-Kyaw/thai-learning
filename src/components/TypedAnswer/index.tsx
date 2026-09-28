import { useId, type FormEvent } from 'react';

import { classNames } from '../../helpers/classNames';
import { getLetterWithWord } from '../../helpers/vocabulary';
import type { VocabularyItem } from '../../types/learning';
import ResultIcon, { type AnswerResult } from '../ResultIcon';

interface TypedAnswerProps {
  value: string;
  answered: boolean;
  result: AnswerResult | null;
  correctAnswer: VocabularyItem;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const STATUS_CLASS_NAMES: Record<AnswerResult | 'default', string> = {
  default: 'border-line-strong bg-surface focus:border-selected',
  correct: 'border-brand bg-brand-light',
  incorrect: 'border-error bg-error-light',
};

const TypedAnswer = ({ value, answered, result, correctAnswer, onChange, onSubmit }: TypedAnswerProps) => {
  const inputId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor={inputId}>
        Your answer in Thai
      </label>
      <div className="relative">
        <input
          id={inputId}
          className={classNames(
            'min-h-[4.75rem] w-full rounded-2xl border-2 px-12 py-2 text-center font-thai text-[1.625rem] leading-[1.3] font-medium text-ink shadow-edge read-only:cursor-default',
            STATUS_CLASS_NAMES[result ?? 'default']
          )}
          type="text"
          lang="th"
          value={value}
          readOnly={answered}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          data-status={result ?? 'default'}
          onChange={(event) => onChange(event.target.value)}
        />
        {result && <ResultIcon result={result} className="absolute top-1/2 right-4 -translate-y-1/2" />}
      </div>
      {result === 'incorrect' && (
        <p className="text-center text-ink-muted">
          Correct answer:{' '}
          <span className="font-thai text-xl font-medium text-ink" lang="th">
            {getLetterWithWord(correctAnswer)}
          </span>
        </p>
      )}
    </form>
  );
};

export default TypedAnswer;
