import { ANSWER_OPTION_COUNT, QUESTION_COUNT } from '../constants/practice';
import type { Consonant, ToneId, Vowel, VowelQuestion } from '../types/learning';

import { randomizeArray } from './randomizeArray';
import { getUnmarkedTone, type Syllable } from './tones';

const PLACEHOLDER = '-';

// Fonts can't stack a Thai mark on a dash, so a mark that sits on the consonant is shown on a dotted circle.
const MARK_ON_PLACEHOLDER = /-(?=[\u0E31\u0E33-\u0E3A\u0E47-\u0E4E])/;

export const getVowelLabel = (vowel: Vowel): string => vowel.id.replace(MARK_ON_PLACEHOLDER, '\u25CC');

export const isCombinable = (vowel: Vowel): boolean => vowel.group !== 'standalone';

export const combineVowel = (consonant: string, vowel: Vowel): string => vowel.id.replace(PLACEHOLDER, consonant);

export const getSyllable = (vowel: Vowel): Syllable => (vowel.group === 'short' ? 'dead' : 'live');

export const getSyllableTone = (consonant: Pick<Consonant, 'class'>, vowel: Vowel): ToneId =>
  getUnmarkedTone(consonant.class, getSyllable(vowel));

export const generateVowelQuestions = (
  consonants: readonly Consonant[],
  vowels: readonly Vowel[],
  { questionCount = QUESTION_COUNT, optionCount = ANSWER_OPTION_COUNT, random = Math.random } = {}
): VowelQuestion[] => {
  const combinable = vowels.filter(isCombinable);
  const pairs = consonants.flatMap((consonant) => combinable.map((vowel) => ({ consonant, vowel })));

  return randomizeArray(pairs, random)
    .slice(0, questionCount)
    .map(({ consonant, vowel }): VowelQuestion => {
      const syllable = combineVowel(consonant.character, vowel);
      const base = { id: syllable, consonant, vowel, syllable, tone: getSyllableTone(consonant, vowel) };

      if (random() < 0.5) {
        return { ...base, kind: 'tone' };
      }
      const distractors = randomizeArray(
        combinable.filter((other) => other !== vowel),
        random
      )
        .slice(0, optionCount - 1)
        .map((other) => combineVowel(consonant.character, other));

      return { ...base, kind: 'spell', options: randomizeArray([syllable, ...distractors], random) };
    });
};

export const getVowelAnswer = (question: VowelQuestion): string =>
  question.kind === 'spell' ? question.syllable : question.tone;
