import { assetUrl } from '../../helpers/assetUrl';
import type { Consonant, Word } from '../../types/learning';
import AudioButton from '../AudioButton';

interface ConsonantCardProps {
  consonant: Consonant;
  onPlayAudio: (word: Word) => void;
}

const ConsonantCard = ({ consonant, onPlayAudio }: ConsonantCardProps) => {
  const headingId = `consonant-${consonant.id}`;

  return (
    <article
      className="flex h-full flex-col items-center gap-1 rounded-3xl border-2 border-line bg-surface px-3 py-4 text-center shadow-edge"
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className="font-thai text-[3.5rem] leading-[1.2] font-medium text-ink" lang="th">
        {consonant.character}
      </h3>
      <ul className="flex w-full flex-col gap-4" role="list">
        {consonant.words.map((word) => (
          <li key={word.id} className="flex flex-col items-center">
            {word.image ? (
              <img
                className="mb-2 aspect-square w-26 rounded-2xl object-contain"
                src={assetUrl(word.image)}
                alt={word.meaning}
                lang="my"
                loading="lazy"
              />
            ) : (
              <div className="mb-2 grid aspect-square w-26 place-items-center rounded-2xl border-2 border-dashed border-line-strong p-2 text-xs text-ink-muted">
                Picture coming soon
              </div>
            )}
            <p className="font-thai text-2xl font-medium" lang="th">
              {word.thai}
            </p>
            <p className="font-burmese leading-[1.8]" lang="my">
              <span className="text-[1.0625rem] font-bold text-brand">{word.meaning}</span>{' '}
              <span className="text-[0.9375rem] whitespace-nowrap text-ink-muted">({word.pronunciation})</span>
            </p>
            {word.audio && (
              <div className="mt-2">
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
