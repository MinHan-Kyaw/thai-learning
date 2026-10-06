import { classNames } from '../../helpers/classNames';
import { combineVowel, getVowelLabel } from '../../helpers/vowels';
import type { ConsonantClass, Vowel } from '../../types/learning';

interface VowelTableProps {
  vowels: Vowel[];
  consonantClasses: ConsonantClass[];
  tones?: string[];
  labelledBy: string;
}

const VowelTable = ({ vowels, consonantClasses, tones, labelledBy }: VowelTableProps) => (
  <div className="overflow-x-auto rounded-2xl border-2 border-line">
    <table className="w-full border-collapse text-center" aria-labelledby={labelledBy}>
      <thead>
        <tr className={classNames('bg-brand-light', !tones && 'border-b-2 border-line')}>
          <th scope="col" className="px-2 py-2 text-left xs:px-3">
            Vowel
          </th>
          {consonantClasses.map((consonantClass) => (
            <th key={consonantClass.id} scope="col" className="px-1 py-2 font-bold whitespace-nowrap xs:px-2">
              {consonantClass.shortName}{' '}
              <span className="font-thai font-medium text-brand" lang="th">
                {consonantClass.exampleConsonant}
              </span>
            </th>
          ))}
        </tr>
        {tones && (
          <tr className="border-b-2 border-line bg-brand-light">
            <th scope="row" className="px-2 pb-2 text-left text-sm font-bold text-ink-muted xs:px-3">
              Tone
            </th>
            {consonantClasses.map(({ id }, index) => (
              <td key={id} className="px-1 pb-2 xs:px-2">
                <span className="inline-block rounded-full border-2 border-brand-border bg-surface px-2 text-xs font-extrabold text-brand">
                  {tones[index]}
                </span>
              </td>
            ))}
          </tr>
        )}
      </thead>
      <tbody>
        {vowels.map((vowel) => (
          <tr key={vowel.id} className="border-b border-line last:border-b-0">
            <th scope="row" className="px-2 py-2 text-left xs:px-3">
              <span className="block font-thai text-2xl font-medium" lang="th">
                {getVowelLabel(vowel)}
              </span>{' '}
              <span className="text-sm font-bold text-ink-muted">{vowel.sound}</span>{' '}
              <span className="font-burmese text-sm font-normal text-brand" lang="my">
                {vowel.pronunciation}
              </span>
            </th>
            {consonantClasses.map(({ id, exampleConsonant, exampleSound }) => (
              <td key={id} className="px-1 py-2 xs:px-2">
                <span className="block font-thai text-2xl font-medium" lang="th">
                  {combineVowel(exampleConsonant, vowel)}
                </span>{' '}
                <span className="text-sm font-bold text-ink-muted">
                  {exampleSound}
                  {vowel.sound}
                </span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default VowelTable;
