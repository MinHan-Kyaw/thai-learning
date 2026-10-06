import type { Vowel } from '../../types/learning';

interface VowelCardProps {
  vowel: Vowel;
}

const VowelCard = ({ vowel }: VowelCardProps) => (
  <article
    className="flex h-full min-h-18 flex-col items-center justify-center rounded-2xl border-2 border-line py-2 shadow-edge"
    aria-labelledby={`vowel-${vowel.id}`}
  >
    <h3 id={`vowel-${vowel.id}`} className="font-thai text-3xl font-medium" lang="th">
      {vowel.id}
    </h3>{' '}
    <span className="text-sm font-bold text-ink-muted">{vowel.sound}</span>{' '}
    <span className="font-burmese text-sm text-brand" lang="my">
      {vowel.pronunciation}
    </span>
  </article>
);

export default VowelCard;
