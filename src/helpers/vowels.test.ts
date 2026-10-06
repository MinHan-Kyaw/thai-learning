import { consonantClasses, vowelGroups, vowels } from '../data';
import type { Vowel, VowelGroup, VowelGroupId } from '../types/learning';

import { combineVowel, getToneRules, getVowelLabel, isCombinable } from './vowels';

const vowel = (id: string): Vowel => vowels.find((item) => item.id === id) as Vowel;
const vowelGroup = (id: VowelGroupId): VowelGroup => vowelGroups.find((item) => item.id === id) as VowelGroup;
describe('combineVowel', () => {
  it('writes the consonant in place of the dash', () => {
    expect(combineVowel('ก', vowel('-ะ'))).toBe('กะ');
    expect(combineVowel('ข', vowel('เ-ือะ'))).toBe('เขือะ');
    expect(combineVowel('ค', vowel('-อ'))).toBe('คอ');
    expect(combineVowel('ม', vowel('ใ-'))).toBe('ใม');
  });
});

describe('getVowelLabel', () => {
  it('keeps the dash where the vowel sits beside the consonant', () => {
    expect(['-ะ', 'เ-', 'แ-ะ', '-อ', 'ใ-', 'เ-า'].map((id) => getVowelLabel(vowel(id)))).toEqual([
      '-ะ',
      'เ-',
      'แ-ะ',
      '-อ',
      'ใ-',
      'เ-า',
    ]);
  });

  describe('given a mark above or below the consonant', () => {
    it('shows the mark on a dotted circle', () => {
      expect(['-ิ', '-ุ', 'เ-ีย', '-ัวะ', '-ำ'].map((id) => getVowelLabel(vowel(id)))).toEqual([
        '◌ิ',
        '◌ุ',
        'เ◌ีย',
        '◌ัวะ',
        '◌ำ',
      ]);
    });
  });
});

describe('isCombinable', () => {
  it('excludes the standalone vowels ฤ ฤๅ ฦ ฦๅ', () => {
    expect(vowels.filter((item) => !isCombinable(item)).map((item) => item.id)).toEqual(['ฤ', 'ฤๅ', 'ฦ', 'ฦๅ']);
  });
});

describe('getToneRules', () => {
  it('joins the consonant groups that take the same tone', () => {
    expect(getToneRules(vowelGroup('short'), consonantClasses)).toEqual([
      'G1 / G2 + Short Vowel → Low Tone',
      'G3 + Short Vowel → High Tone',
    ]);
    expect(getToneRules(vowelGroup('long'), consonantClasses)).toEqual([
      'G1 / G3 + Long Vowel → Mid Tone',
      'G2 + Long Vowel → Rising Tone',
    ]);
  });
});
