import type { Consonant } from '../types/learning';

import { getConsonantsByClass, getLetterWithWord, getVocabulary } from './vocabulary';

const consonants: Consonant[] = [
  {
    id: 'ก',
    character: 'ก',
    class: 'middle',
    words: [{ id: 'ก-ไก่', thai: 'ไก่', pronunciation: 'ကောကိုင်', meaning: 'ကြက်' }],
  },
  {
    id: 'ข',
    character: 'ข',
    class: 'high',
    words: [{ id: 'ข-ไข่', thai: 'ไข่', pronunciation: 'ခေါခိုင်', meaning: 'ဥ' }],
  },
];

describe('getConsonantsByClass', () => {
  it('returns only consonants of the given class', () => {
    expect(getConsonantsByClass(consonants, 'high').map((consonant) => consonant.id)).toEqual(['ข']);
  });
});

describe('getVocabulary', () => {
  it('flattens words and keeps a reference to their consonant and its class', () => {
    expect(getVocabulary(consonants)).toEqual([
      { id: 'ก-ไก่', thai: 'ไก่', pronunciation: 'ကောကိုင်', meaning: 'ကြက်', consonant: 'ก', consonantClass: 'middle' },
      { id: 'ข-ไข่', thai: 'ไข่', pronunciation: 'ခေါခိုင်', meaning: 'ဥ', consonant: 'ข', consonantClass: 'high' },
    ]);
  });
});

describe('getLetterWithWord', () => {
  it('shows the letter followed by its word in brackets, matching the recited letter name', () => {
    expect(getLetterWithWord({ consonant: 'ญ', thai: 'หญิง' })).toBe('ญ (หญิง)');
  });
});
