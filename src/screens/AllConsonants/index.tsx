import { useEffect } from 'react';

import ConsonantCard from '../../components/ConsonantCard';
import { consonants } from '../../data';
import { assetUrl } from '../../helpers/assetUrl';
import { playAudio, stopAudio } from '../../services/audio';
import type { Word } from '../../types/learning';

const handlePlayAudio = (word: Word) => {
  if (word.audio) {
    void playAudio(assetUrl(word.audio));
  }
};

const AllConsonants = () => {
  useEffect(() => () => stopAudio(), []);

  return (
    <main className="min-h-dvh p-3">
      <h1 className="sr-only">All Thai consonants</h1>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.75rem,1fr))] gap-2" aria-label="All Thai consonants" role="list">
        {consonants.map((consonant) => (
          <li key={consonant.id}>
            <ConsonantCard consonant={consonant} onPlayAudio={handlePlayAudio} size="compact" />
          </li>
        ))}
      </ul>
    </main>
  );
};

export default AllConsonants;
