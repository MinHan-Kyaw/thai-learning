import { combineVowel, getVowelLabel } from '../../helpers/vowels';
import type { ConsonantClass, Vowel } from '../../types/learning';
import ClassTable from '../ClassTable';

interface VowelTableProps {
  vowels: Vowel[];
  consonantClasses: ConsonantClass[];
  labelledBy: string;
}

const VowelTable = ({ vowels, consonantClasses, labelledBy }: VowelTableProps) => (
  <ClassTable consonantClasses={consonantClasses} firstColumnLabel="Vowel" labelledBy={labelledBy}>
    {vowels.map((vowel) => (
      <tr key={vowel.id} className="border-b border-line last:border-b-0">
        <th scope="row" className="px-2 py-2 text-left xs:px-3">
          <span className="block font-thai text-2xl font-medium" lang="th">
            {getVowelLabel(vowel)}
          </span>{' '}
          <span className="text-sm font-bold text-ink-muted">{vowel.sound}</span>{' '}
          <span className="font-burmese text-sm font-normal text-ink-muted" lang="my">
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
  </ClassTable>
);

export default VowelTable;
