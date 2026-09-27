import { classNames } from '../../helpers/classNames';
import type { ConsonantClass, ConsonantClassId } from '../../types/learning';

import styles from './index.module.css';

interface ClassTabsProps {
  classes: ConsonantClass[];
  counts: Record<ConsonantClassId, number>;
  selectedClassId: ConsonantClassId;
  onSelect: (classId: ConsonantClassId) => void;
}

const ClassTabs = ({ classes, counts, selectedClassId, onSelect }: ClassTabsProps) => (
  <ul className={styles.tabs} aria-label="Consonant class" role="list">
    {classes.map((consonantClass) => {
      const isSelected = consonantClass.id === selectedClassId;

      return (
        <li key={consonantClass.id}>
          <button
            type="button"
            className={classNames(styles.tab, isSelected && styles.tabSelected)}
            aria-pressed={isSelected}
            onClick={() => onSelect(consonantClass.id)}
          >
            {consonantClass.shortName}{' '}
            <span className={styles.count}>
              {counts[consonantClass.id]} <span className="visuallyHidden">letters</span>
            </span>
          </button>
        </li>
      );
    })}
  </ul>
);

export default ClassTabs;
