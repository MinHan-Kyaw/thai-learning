import { Fragment, useEffect, useId, useRef, useState } from 'react';

import type { AnswerMode } from '../../types/learning';

export interface QuestionTypeOption {
  mode: AnswerMode;
  label: string;
  checked: boolean;
  unavailable?: boolean;
}

export interface QuestionCount {
  value: number;
  min: number;
  max: number;
  step: number;
}

interface PracticeSettingsProps {
  questionCount: QuestionCount;
  onQuestionCountChange: (count: number) => void;
  questionTypes?: QuestionTypeOption[];
  onQuestionTypeChange: (mode: AnswerMode, checked: boolean) => void;
}

const STEPPER_BUTTON_CLASS_NAME =
  'grid size-11 cursor-pointer place-items-center rounded-full border-2 border-line-strong text-xl leading-none font-extrabold text-brand hover:bg-brand-light disabled:cursor-not-allowed disabled:text-ink-muted disabled:opacity-50 disabled:hover:bg-transparent';

const QuestionCountStepper = ({ value, min, max, step, onChange }: QuestionCount & { onChange: (count: number) => void }) => {
  const labelId = useId();

  return (
    <div className="flex items-center justify-between gap-2 px-2">
      <span id={labelId} className="text-sm font-bold text-ink">
        Questions
      </span>
      <div className="flex items-center gap-1" role="group" aria-labelledby={labelId}>
        <button
          type="button"
          className={STEPPER_BUTTON_CLASS_NAME}
          aria-label="Fewer questions"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
        >
          −
        </button>
        <span className="w-8 text-center text-lg font-extrabold" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          className={STEPPER_BUTTON_CLASS_NAME}
          aria-label="More questions"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
        >
          +
        </button>
      </div>
    </div>
  );
};

const QuestionTypeCheckboxes = ({
  options,
  onChange,
}: {
  options: QuestionTypeOption[];
  onChange: (mode: AnswerMode, checked: boolean) => void;
}) => {
  const idPrefix = useId();

  return (
    <fieldset className="mt-1 border-t-2 border-line pt-1">
      <legend className="sr-only">Question types</legend>
      {options.map(({ mode, label, checked, unavailable = false }) => (
        <Fragment key={mode}>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-bold text-ink has-disabled:cursor-not-allowed has-disabled:opacity-50">
            <input
              type="checkbox"
              className="size-4 cursor-[inherit] accent-brand"
              checked={checked && !unavailable}
              disabled={unavailable}
              aria-describedby={unavailable ? `${idPrefix}-${mode}-unavailable` : undefined}
              onChange={(event) => onChange(mode, event.target.checked)}
            />
            {label}
          </label>
          {unavailable && (
            <span id={`${idPrefix}-${mode}-unavailable`} className="sr-only">
              Not available in this browser
            </span>
          )}
        </Fragment>
      ))}
    </fieldset>
  );
};

const PracticeSettings = ({
  questionCount,
  onQuestionCountChange,
  questionTypes,
  onQuestionTypeChange,
}: PracticeSettingsProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="grid size-11 cursor-pointer place-items-center rounded-full text-ink-muted hover:bg-brand-light hover:text-brand"
        aria-label="Practice settings"
        aria-expanded={open}
        aria-controls={panelId}
        ref={buttonRef}
        onClick={() => setOpen(!open)}
      >
        <svg className="size-5" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <circle cx="10" cy="4" r="1.75" fill="currentColor" />
          <circle cx="10" cy="10" r="1.75" fill="currentColor" />
          <circle cx="10" cy="16" r="1.75" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute top-full right-0 z-20 mt-1 flex w-56 flex-col rounded-2xl border-2 border-line bg-surface p-1 shadow-edge"
        >
          <QuestionCountStepper {...questionCount} onChange={onQuestionCountChange} />
          {questionTypes && <QuestionTypeCheckboxes options={questionTypes} onChange={onQuestionTypeChange} />}
        </div>
      )}
    </div>
  );
};

export default PracticeSettings;
