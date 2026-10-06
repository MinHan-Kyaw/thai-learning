import type { ReactNode } from 'react';

import ButtonLink from '../../components/Button/ButtonLink';
import ClassTable from '../../components/ClassTable';
import Syllable from '../../components/Syllable';
import ToneContour from '../../components/ToneContour';
import { consonantClasses, guide, toneById, toneMarks, tones, vowels } from '../../data';
import { getMarkedTone, getUnmarkedTone } from '../../helpers/tones';
import { combineVowel } from '../../helpers/vowels';
import type { ConsonantClassId, SyllableType, ToneId, Vowel } from '../../types/learning';

interface ToneRule {
  id: string;
  label: ReactNode;
  detail: string;
  spell: (consonant: string) => string;
  getTone: (consonantClass: ConsonantClassId) => ToneId | undefined;
}

const longVowel = vowels.find((vowel) => vowel.group === 'long') as Vowel;
const shortVowel = vowels.find((vowel) => vowel.group === 'short') as Vowel;

const SYLLABLE_TYPES: SyllableType[] = ['live', 'dead'];
const SYLLABLE_VOWELS: Record<SyllableType, Vowel> = { live: longVowel, dead: shortVowel };

const TONE_RULES: ToneRule[] = [
  ...SYLLABLE_TYPES.map((syllableType): ToneRule => ({
    id: syllableType,
    label: (
      <>
        {guide.syllables[syllableType].name}{' '}
        <span className="font-thai font-medium" lang="th">
          {guide.syllables[syllableType].thaiName}
        </span>
      </>
    ),
    detail: guide.syllables[syllableType].detail,
    spell: (consonant) => combineVowel(consonant, SYLLABLE_VOWELS[syllableType]),
    getTone: (consonantClass) => getUnmarkedTone(consonantClass, syllableType),
  })),
  ...toneMarks.map(({ mark, thaiName }): ToneRule => ({
    id: mark,
    label: (
      <span className="font-thai font-medium" lang="th">
        อ{mark} {thaiName}
      </span>
    ),
    detail: guide.tones.markDetail,
    spell: (consonant) => combineVowel(`${consonant}${mark}`, longVowel),
    getTone: (consonantClass) => getMarkedTone(consonantClass, mark),
  })),
];

const Tones = () => (
  <div className="flex flex-col gap-8">
    <section aria-labelledby="tones-title">
      <h1 id="tones-title" className="text-[1.75rem] font-extrabold">
        Thai Tones
      </h1>
      <p className="mt-1 text-ink-muted">{guide.tones.intro}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2" role="list" aria-label="The five tones">
        {tones.map((tone) => (
          <li key={tone.id} className="flex items-center gap-4 rounded-2xl border-2 border-line px-4 py-3 shadow-edge">
            <ToneContour pitch={tone.pitch} />
            <span className="flex flex-col">
              <span className="text-lg font-extrabold">{tone.name}</span>{' '}
              <span className="font-thai text-ink-muted" lang="th">
                {tone.thaiName}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>

    <section aria-labelledby="tone-rules-title">
      <h2 id="tone-rules-title" className="text-[1.375rem] font-extrabold">
        Tone rules
      </h2>
      <p className="mt-1 text-ink-muted">{guide.tones.rulesNote}</p>
      <div className="mt-4">
        <ClassTable
          consonantClasses={consonantClasses}
          firstColumnLabel={<span className="sr-only">Syllable</span>}
          labelledBy="tone-rules-title"
        >
          {TONE_RULES.map((rule) => (
            <tr key={rule.id} className="border-b border-line last:border-b-0">
              <th scope="row" className="px-2 py-2 text-left font-bold xs:px-3">
                {rule.label}{' '}
                <span className="block text-[0.8125rem] leading-[1.6] font-normal text-ink-muted">{rule.detail}</span>
              </th>
              {consonantClasses.map((consonantClass) => {
                const toneId = rule.getTone(consonantClass.id);

                return (
                  <td key={consonantClass.id} className="px-1 py-2 xs:px-2">
                    {toneId ? (
                      <Syllable text={rule.spell(consonantClass.exampleConsonant)} tone={toneById[toneId]} />
                    ) : (
                      <span className="text-ink-muted">
                        — <span className="sr-only">{guide.tones.notUsed}</span>
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </ClassTable>
      </div>
    </section>

    <ButtonLink to="/vowels" variant="secondary" fullWidth>
      Explore Vowels
    </ButtonLink>
  </div>
);

export default Tones;
