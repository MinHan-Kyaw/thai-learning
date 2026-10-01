import { vowels } from '../data';
import type { Vowel } from '../types/learning';

import { combineVowel, getSyllableTone, getVowelLabel, isCombinable } from './vowels';

const vowel = (id: string): Vowel => vowels.find((item) => item.id === id) as Vowel;
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

describe('getSyllableTone', () => {
  it('treats short vowels as dead and long and extra vowels as live', () => {
    expect(getSyllableTone({ class: 'low' }, vowel('-ะ'))).toBe('high');
    expect(getSyllableTone({ class: 'high' }, vowel('-า'))).toBe('rising');
    expect(getSyllableTone({ class: 'high' }, vowel('ไ-'))).toBe('rising');
  });
});
