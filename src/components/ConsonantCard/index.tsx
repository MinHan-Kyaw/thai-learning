import { assetUrl } from '../../helpers/assetUrl';
import type { Consonant, Word } from '../../types/learning';
import AudioButton from '../AudioButton';

import styles from './index.module.css';

interface ConsonantCardProps {
  consonant: Consonant;
  onPlayAudio: (word: Word) => void;
}

const ConsonantCard = ({ consonant, onPlayAudio }: ConsonantCardProps) => {
  const headingId = `consonant-${consonant.id}`;

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.character} lang="th">
        {consonant.character}
      </h3>
      <ul className={styles.words} role="list">
        {consonant.words.map((word) => (
          <li key={word.id} className={styles.word}>
            {word.image ? (
              <img className={styles.image} src={assetUrl(word.image)} alt={word.meaning} lang="my" loading="lazy" />
            ) : (
              <div className={styles.imagePlaceholder}>Picture coming soon</div>
            )}
            <p className={styles.thai} lang="th">
              {word.thai}
            </p>
            <p className={styles.burmese} lang="my">
              <span className={styles.meaning}>{word.meaning}</span>{' '}
              <span className={styles.pronunciation}>({word.pronunciation})</span>
            </p>
            {word.audio && (
              <div className={styles.audio}>
                <AudioButton label={`Play Thai audio for ${word.thai}`} onPlay={() => onPlayAudio(word)} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
};

export default ConsonantCard;
