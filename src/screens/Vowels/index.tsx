import { useSearchParams } from 'react-router';

import ClassTabs from '../../components/ClassTabs';
import VowelCard from '../../components/VowelCard';
import VowelTable from '../../components/VowelTable';
import { consonantClasses, vowelGroups, vowels } from '../../data';
import { isCombinable } from '../../helpers/vowels';
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
    <>
      <h1 className="sr-only">Thai Vowels</h1>

      <div className="sticky top-header z-5 -mx-4 -mt-2 bg-surface px-4 py-2">
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
        <section className="mt-4" aria-labelledby="vowel-group-title">
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
            <div className="mt-4">
              <VowelTable vowels={groupVowels} consonantClasses={consonantClasses} labelledBy="vowel-group-title" />
            </div>
          ) : (
            <ul className="mt-4 grid grid-cols-4 gap-3" role="list" aria-labelledby="vowel-group-title">
              {groupVowels.map((vowel) => (
                <li key={vowel.id}>
                  <VowelCard vowel={vowel} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
};

export default Vowels;
