import type { ConsonantClassId, ToneId } from '../types/learning';

export type Syllable = 'live' | 'dead';

// ponytail: open syllables only; a dead syllable from a long vowel + stop final (low class → falling) is not modelled.
const UNMARKED_TONES: Record<Syllable, Record<ConsonantClassId, ToneId>> = {
  live: { middle: 'mid', high: 'rising', low: 'mid' },
  dead: { middle: 'low', high: 'low', low: 'high' },
};

// High and low class consonants only take ่ and ้.
const MARKED_TONES: Record<string, Partial<Record<ConsonantClassId, ToneId>>> = {
  '่': { middle: 'low', high: 'low', low: 'falling' },
  '้': { middle: 'falling', high: 'falling', low: 'high' },
  '๊': { middle: 'high' },
  '๋': { middle: 'rising' },
};

export const getUnmarkedTone = (consonantClass: ConsonantClassId, syllable: Syllable): ToneId =>
  UNMARKED_TONES[syllable][consonantClass];

export const getMarkedTone = (consonantClass: ConsonantClassId, mark: string): ToneId | undefined =>
  MARKED_TONES[mark]?.[consonantClass];
