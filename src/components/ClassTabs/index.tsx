import type { ReactNode } from 'react';

import { classNames } from '../../helpers/classNames';

interface ClassTabsProps<T extends string> {
  items: { id: T; label: ReactNode }[];
  counts: Record<T, number>;
  selectedId: T;
  label: string;
  countLabel: string;
  onSelect: (id: T) => void;
}

const ClassTabs = <T extends string>({ items, counts, selectedId, label, countLabel, onSelect }: ClassTabsProps<T>) => (
  <ul className="flex gap-1 rounded-2xl bg-brand-light p-1 xs:gap-2" aria-label={label} role="list">
    {items.map((item) => {
      const isSelected = item.id === selectedId;

      return (
        <li key={item.id} className="min-w-0 flex-1">
          <button
            type="button"
            className={classNames(
              'flex min-h-14 w-full cursor-pointer flex-wrap items-center justify-center gap-x-1 rounded-xl border-2 px-0.5 py-2 font-bold xs:gap-x-2 xs:px-2',
              isSelected
                ? 'border-brand-border bg-surface text-brand shadow-edge-brand-soft'
                : 'border-transparent bg-transparent text-ink-muted hover:text-brand'
            )}
            aria-pressed={isSelected}
            onClick={() => onSelect(item.id)}
          >
            {item.label}{' '}
            <span
              className={classNames(
                'inline-grid h-6 min-w-6 place-items-center rounded-full px-1 text-[0.8125rem] leading-none font-extrabold xs:h-7 xs:min-w-7',
                isSelected ? 'bg-brand text-white' : 'bg-surface text-ink-muted'
              )}
            >
              {counts[item.id]} <span className="sr-only">{countLabel}</span>
            </span>
          </button>
        </li>
      );
    })}
  </ul>
);

export default ClassTabs;
