import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

import ClassTabs from '../../components/ClassTabs';
import ConsonantCard from '../../components/ConsonantCard';
import { consonantClasses, consonants } from '../../data';
import { assetUrl } from '../../helpers/assetUrl';
import { getConsonantsByClass } from '../../helpers/vocabulary';
import { playAudio, stopAudio } from '../../services/audio';
import type { ConsonantClassId, Word } from '../../types/learning';

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

  const handleSelectClass = (classId: ConsonantClassId) => {
    if (classId === selectedClassId) {
      return;
    }
    setSearchParams({ class: classId }, { replace: true });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <h1 className="sr-only">Thai Consonants</h1>

      <div className="sticky top-header z-5 -mx-4 -mt-2 bg-surface px-4 py-2">
        <ClassTabs classes={consonantClasses} counts={counts} selectedClassId={selectedClassId} onSelect={handleSelectClass} />
      </div>

      {selectedClass && (
        <section className="mt-4" aria-labelledby="consonant-class-title">
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 id="consonant-class-title" className="text-[1.375rem] font-extrabold">
              {selectedClass.name}
            </h2>
            <span className="rounded-full bg-brand-light px-3 text-sm font-bold text-brand">{selectedClass.tone}</span>
            <span className="font-burmese leading-[1.8] text-ink-muted" lang="my">
              {selectedClass.burmeseName}
            </span>
          </div>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,13rem),1fr))] gap-4" role="list">
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
