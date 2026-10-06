import type { Vowel } from '../types/learning';

const PLACEHOLDER = '-';

// Fonts can't stack a Thai mark on a dash, so a mark that sits on the consonant is shown on a dotted circle.
const MARK_ON_PLACEHOLDER = /-(?=[\u0E31\u0E33-\u0E3A\u0E47-\u0E4E])/;

export const getVowelLabel = (vowel: Vowel): string => vowel.id.replace(MARK_ON_PLACEHOLDER, '\u25CC');

export const isCombinable = (vowel: Vowel): boolean => vowel.group !== 'standalone';

export const combineVowel = (consonant: string, vowel: Vowel): string => vowel.id.replace(PLACEHOLDER, consonant);
