import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

import ClassTabs from '../../components/ClassTabs';
import ConsonantCard from '../../components/ConsonantCard';
import { consonantClasses, consonants } from '../../data';
import { assetUrl } from '../../helpers/assetUrl';
import { getConsonantsByClass } from '../../helpers/vocabulary';
import { playAudio, stopAudio } from '../../services/audio';
import type { ConsonantClassId, Word } from '../../types/learning';

import styles from './index.module.css';

const DEFAULT_CLASS_ID: ConsonantClassId = 'middle';

const isConsonantClassId = (value: string | null): value is ConsonantClassId =>
  consonantClasses.some((consonantClass) => consonantClass.id === value);

const counts = Object.fromEntries(
  consonantClasses.map((consonantClass) => [consonantClass.id, getConsonantsByClass(consonants, consonantClass.id).length])
) as Record<ConsonantClassId, number>;

const handlePlayAudio = (word: Word) => {
  if (word.audio) {
    void playAudio(assetUrl(word.audio));
  }
};

const Consonants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedClassId = searchParams.get('class');
  const selectedClassId = isConsonantClassId(requestedClassId) ? requestedClassId : DEFAULT_CLASS_ID;
  const selectedClass = consonantClasses.find((consonantClass) => consonantClass.id === selectedClassId);
  const visibleConsonants = getConsonantsByClass(consonants, selectedClassId);

  useEffect(() => () => stopAudio(), []);

  return (
    <>
      <h1 className="visuallyHidden">Thai Consonants</h1>

      <ClassTabs
        classes={consonantClasses}
        counts={counts}
        selectedClassId={selectedClassId}
        onSelect={(classId) => setSearchParams({ class: classId }, { replace: true })}
      />

      {selectedClass && (
        <section className={styles.panel} aria-labelledby="consonant-class-title">
          <div className={styles.panelHeader}>
            <h2 id="consonant-class-title" className={styles.panelTitle}>
              {selectedClass.name}
            </h2>
            <span className={styles.tone}>{selectedClass.tone}</span>
            <span className={styles.burmeseName} lang="my">
              {selectedClass.burmeseName}
            </span>
          </div>
          <ul className={styles.grid} role="list">
            {visibleConsonants.map((consonant) => (
              <li key={consonant.id}>
                <ConsonantCard consonant={consonant} onPlayAudio={handlePlayAudio} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
};

export default Consonants;
