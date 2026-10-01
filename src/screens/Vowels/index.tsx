import { useSearchParams } from 'react-router';

import ClassTabs from '../../components/ClassTabs';
import { consonantClasses, vowelGroups, vowels } from '../../data';
import { combineVowel, getVowelLabel, isCombinable } from '../../helpers/vowels';
import type { VowelGroupId } from '../../types/learning';

const DEFAULT_GROUP_ID: VowelGroupId = 'short';

const isVowelGroupId = (value: string | null): value is VowelGroupId => vowelGroups.some((group) => group.id === value);

const counts = Object.fromEntries(
  vowelGroups.map((group) => [group.id, vowels.filter((vowel) => vowel.group === group.id).length])
) as Record<VowelGroupId, number>;

const tabs = vowelGroups.map((group) => ({
  id: group.id,
  label: (
    <span className="font-burmese text-[0.8125rem] leading-[1.8] whitespace-nowrap xs:text-base" lang="my">
      {group.burmeseName}
    </span>
  ),
}));

const Vowels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedGroupId = searchParams.get('group');
  const selectedGroupId = isVowelGroupId(requestedGroupId) ? requestedGroupId : DEFAULT_GROUP_ID;
  const group = vowelGroups.find((item) => item.id === selectedGroupId);
  const groupVowels = vowels.filter((vowel) => vowel.group === selectedGroupId);

  const handleSelectGroup = (groupId: VowelGroupId) => {
    if (groupId === selectedGroupId) {
      return;
    }
    setSearchParams({ group: groupId }, { replace: true });
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[1.75rem] font-extrabold">
        Thai Vowels<span className="ms-2 rounded-full bg-brand-light px-3 text-sm font-bold text-brand">{vowels.length}</span>
      </h1>

      <div className="sticky top-header z-5 -mx-4 bg-surface px-4 py-2">
        <ClassTabs
          items={tabs}
          counts={counts}
          selectedId={selectedGroupId}
          label="Vowel group"
          countLabel="vowels"
          onSelect={handleSelectGroup}
        />
      </div>

      {group && (
        <section aria-labelledby="vowel-group-title">
          <h2 id="vowel-group-title" className="text-[1.375rem] font-extrabold">
            <span className="font-burmese" lang="my">
              {group.burmeseName}
            </span>{' '}
            <span className="text-base font-bold text-ink-muted">{group.name}</span>
          </h2>
          <p className="mt-1 font-burmese leading-[1.8] text-ink-muted" lang="my">
            {group.note}
          </p>
          {group.rules && (
            <ul
              className="mt-2 grid gap-1 rounded-2xl bg-brand-light px-4 py-3"
              role="list"
              aria-label={`${group.name} tone rules`}
            >
              {group.rules.map((rule) => (
                <li key={rule} className="font-burmese leading-[1.8]" lang="my">
                  {rule}
                </li>
              ))}
            </ul>
          )}

          {groupVowels.every(isCombinable) ? (
            <div className="mt-4 overflow-x-auto rounded-2xl border-2 border-line">
              <table className="w-full border-collapse text-center" aria-labelledby="vowel-group-title">
                <thead>
                  <tr className="border-b-2 border-line bg-brand-light">
                    <th scope="col" className="px-2 py-2 text-left xs:px-3">
                      Vowel
                    </th>
                    {consonantClasses.map((consonantClass) => (
                      <th key={consonantClass.id} scope="col" className="px-1 py-2 font-bold xs:px-2">
                        {consonantClass.shortName}{' '}
                        <span className="font-thai font-medium text-brand" lang="th">
                          {consonantClass.exampleConsonant}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupVowels.map((vowel) => (
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
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="mt-4 grid grid-cols-4 gap-3" role="list" aria-labelledby="vowel-group-title">
              {groupVowels.map((vowel) => (
                <li
                  key={vowel.id}
                  className="flex min-h-18 flex-col items-center justify-center rounded-2xl border-2 border-line py-2 shadow-edge"
                >
                  <span className="font-thai text-3xl font-medium" lang="th">
                    {vowel.id}
                  </span>{' '}
                  <span className="text-sm font-bold text-ink-muted">{vowel.sound}</span>{' '}
                  <span className="font-burmese text-sm text-ink-muted" lang="my">
                    {vowel.pronunciation}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default Vowels;
