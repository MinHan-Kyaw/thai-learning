import { useId } from 'react';

import { classNames } from '../../helpers/classNames';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle = ({ label, description, checked, onChange }: ToggleProps) => {
  const descriptionId = useId();

  return (
    <>
      <button
        type="button"
        className="flex min-h-11 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl px-1"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        data-status={checked ? 'on' : 'off'}
        onClick={() => onChange(!checked)}
      >
        <span
          className={classNames(
            'flex h-6 w-10 items-center rounded-full p-0.5 transition-colors duration-150',
            checked ? 'bg-brand' : 'bg-ink-muted'
          )}
        >
          <span
            className={classNames('size-5 rounded-full bg-white transition-transform duration-150', checked && 'translate-x-4')}
          />
        </span>
        <span className={classNames('text-[0.6875rem] leading-none font-extrabold', checked ? 'text-brand' : 'text-ink-muted')}>
          {label}
        </span>
      </button>
      {description && (
        <span id={descriptionId} className="sr-only">
          {description}
        </span>
      )}
    </>
  );
};

export default Toggle;
