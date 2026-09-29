import { Fragment, useEffect, useId, useRef, useState } from 'react';

import type { AnswerMode } from '../../types/learning';

export interface QuestionTypeOption {
  mode: AnswerMode;
  label: string;
  checked: boolean;
  unavailable?: boolean;
}

interface QuestionTypeOptionsProps {
  options: QuestionTypeOption[];
  onChange: (mode: AnswerMode, checked: boolean) => void;
}

const LEGEND = 'Question types';

const Checkboxes = ({ options, onChange }: QuestionTypeOptionsProps) => {
  const idPrefix = useId();

  return (
    <>
      <legend className="sr-only">{LEGEND}</legend>
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
    </>
  );
};

const QuestionTypeOptions = ({ options, onChange }: QuestionTypeOptionsProps) => {
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
        aria-label={LEGEND}
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
        <fieldset
          id={panelId}
          className="absolute top-full right-0 z-20 mt-1 flex w-40 flex-col rounded-2xl border-2 border-line bg-surface p-1 shadow-edge"
        >
          <Checkboxes options={options} onChange={onChange} />
        </fieldset>
      )}
    </div>
  );
};

export default QuestionTypeOptions;
