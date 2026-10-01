import type { ReactNode } from 'react';

interface CheckboxChipsProps<T extends string> {
  legend: string;
  options: { id: T; label: ReactNode; checked: boolean }[];
  onChange: (id: T, checked: boolean) => void;
}

// At least one option stays checked: the last checked chip can't be unticked.
const CheckboxChips = <T extends string>({ legend, options, onChange }: CheckboxChipsProps<T>) => {
  const checkedCount = options.filter((option) => option.checked).length;

  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{legend}</legend>
      {options.map(({ id, label, checked }) => (
        <label
          key={id}
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-line px-3 font-bold text-ink-muted has-checked:border-brand-border has-checked:bg-brand-light has-checked:text-brand has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-selected has-disabled:cursor-default"
        >
          <input
            type="checkbox"
            className="size-4 cursor-[inherit] accent-brand"
            checked={checked}
            disabled={checked && checkedCount === 1}
            onChange={(event) => onChange(id, event.target.checked)}
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
};

export default CheckboxChips;
