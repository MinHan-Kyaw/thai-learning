import { classNames } from '../../helpers/classNames';
import type { ConsonantClass, ConsonantClassId } from '../../types/learning';

interface ClassTabsProps {
  classes: ConsonantClass[];
  counts: Record<ConsonantClassId, number>;
  selectedClassId: ConsonantClassId;
  onSelect: (classId: ConsonantClassId) => void;
}

const ClassTabs = ({ classes, counts, selectedClassId, onSelect }: ClassTabsProps) => (
  <ul className="grid grid-cols-3 gap-2 rounded-2xl bg-brand-light p-1" aria-label="Consonant class" role="list">
    {classes.map((consonantClass) => {
      const isSelected = consonantClass.id === selectedClassId;

      return (
        <li key={consonantClass.id}>
          <button
            type="button"
            className={classNames(
              'flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 font-bold',
              isSelected
                ? 'border-brand-border bg-surface text-brand shadow-edge-brand-soft'
                : 'border-transparent bg-transparent text-ink-muted hover:text-brand'
            )}
            aria-pressed={isSelected}
            onClick={() => onSelect(consonantClass.id)}
          >
            {consonantClass.shortName}{' '}
            <span
              className={classNames(
                'inline-grid h-7 min-w-7 place-items-center rounded-full px-1 text-[0.8125rem] leading-none font-extrabold',
                isSelected ? 'bg-brand text-white' : 'bg-surface text-ink-muted'
              )}
            >
              {counts[consonantClass.id]} <span className="sr-only">letters</span>
            </span>
          </button>
        </li>
      );
    })}
  </ul>
);

export default ClassTabs;
