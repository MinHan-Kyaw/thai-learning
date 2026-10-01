import { consonants, vowels } from '../data';
import type { Vowel } from '../types/learning';

import { combineVowel, generateVowelQuestions, getSyllableTone, getVowelAnswer, getVowelLabel, isCombinable } from './vowels';

const vowel = (id: string): Vowel => vowels.find((item) => item.id === id) as Vowel;
const seededRandom =
  (seed = 1) =>
  () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

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

describe('generateVowelQuestions', () => {
  it('asks the requested number of distinct consonant + vowel combinations', () => {
    const questions = generateVowelQuestions(consonants, vowels, { questionCount: 30, random: seededRandom() });

    expect(questions).toHaveLength(30);
    expect(new Set(questions.map((question) => question.id)).size).toBe(30);
    questions.forEach((question) => {
      expect(isCombinable(question.vowel)).toBe(true);
      expect(question.syllable).toBe(combineVowel(question.consonant.character, question.vowel));
    });
  });

  it('randomizes the combinations', () => {
    const first = generateVowelQuestions(consonants, vowels, { random: seededRandom(1) }).map((question) => question.id);
    const second = generateVowelQuestions(consonants, vowels, { random: seededRandom(2) }).map((question) => question.id);

    expect(first).not.toEqual(second);
  });

  it('mixes spelling and tone questions', () => {
    const kinds = new Set(
      generateVowelQuestions(consonants, vowels, { random: seededRandom() }).map((question) => question.kind)
    );

    expect(kinds).toEqual(new Set(['spell', 'tone']));
  });

  it('offers unique spelling options of the same consonant, including the answer', () => {
    generateVowelQuestions(consonants, vowels, { questionCount: 30, random: seededRandom() }).forEach((question) => {
      if (question.kind !== 'spell') {
        return;
      }
      expect(question.options).toHaveLength(3);
      expect(new Set(question.options).size).toBe(3);
      expect(question.options).toContain(question.syllable);
      question.options.forEach((option) => expect(option).toContain(question.consonant.character));
    });
  });

  it('answers with the syllable for spelling and the tone for tone questions', () => {
    generateVowelQuestions(consonants, vowels, { random: seededRandom() }).forEach((question) => {
      expect(getVowelAnswer(question)).toBe(question.kind === 'spell' ? question.syllable : question.tone);
    });
  });
});
