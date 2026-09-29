import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getVocabulary } from '../helpers/vocabulary';

import { consonantClasses, consonants } from '.';

const THAI_TEXT = /^[\u0E00-\u0E7F ]+$/;
const MYANMAR_SCRIPT = /[\u1000-\u109F]/;
const INVISIBLE_CHARACTERS = /[\u200B-\u200D\uFEFF]/;
const VISUAL_ORDER_VOWEL_SIGN_E = /(^|[^\u1000-\u109F])\u1031/;

// The source PDF gives these pronunciations in Latin script; the project owner still needs to supply Burmese.
const PENDING_BURMESE_PRONUNCIATION = ['ฝ-ฝา', 'ฟ-ฟัน'];

const vocabulary = getVocabulary(consonants);
const publicFileExists = (path: string) => existsSync(join(process.cwd(), 'public', path));

describe('consonant classes', () => {
  it('defines the middle, high and low classes', () => {
    expect(consonantClasses.map((consonantClass) => consonantClass.id)).toEqual(['middle', 'high', 'low']);
  });

  it('numbers the classes as groups 1 (middle), 2 (high) and 3 (low)', () => {
    expect(consonantClasses.map((consonantClass) => consonantClass.group)).toEqual([1, 2, 3]);
  });

  it('gives every class a name, short name, Burmese name and tone', () => {
    consonantClasses.forEach((consonantClass) => {
      expect(consonantClass.name).not.toBe('');
      expect(consonantClass.name).toContain(consonantClass.shortName);
      expect(consonantClass.burmeseName).toMatch(MYANMAR_SCRIPT);
      expect(consonantClass.tone).not.toBe('');
    });
  });
});

describe('consonants', () => {
  it('contains all 44 Thai consonants split 9 / 11 / 24 across the classes', () => {
    const countByClass = (classId: string) => consonants.filter((consonant) => consonant.class === classId).length;

    expect(consonants).toHaveLength(44);
    expect(countByClass('middle')).toBe(9);
    expect(countByClass('high')).toBe(11);
    expect(countByClass('low')).toBe(24);
  });

  it('uses unique ids that match the consonant character', () => {
    expect(new Set(consonants.map((consonant) => consonant.id)).size).toBe(consonants.length);
    consonants.forEach((consonant) => {
      expect(consonant.id).toBe(consonant.character);
      expect(consonant.character).toMatch(/^[\u0E01-\u0E2E]$/);
    });
  });

  it('references a known class', () => {
    const classIds = consonantClasses.map((consonantClass) => consonantClass.id);

    consonants.forEach((consonant) => expect(classIds).toContain(consonant.class));
  });

  it('has at least one word per consonant', () => {
    consonants.forEach((consonant) => expect(consonant.words.length).toBeGreaterThan(0));
  });
});

describe('vocabulary', () => {
  it('uses unique, stable ids in the form "<consonant>-<word>"', () => {
    expect(new Set(vocabulary.map((word) => word.id)).size).toBe(vocabulary.length);
    vocabulary.forEach((word) => expect(word.id).toBe(`${word.consonant}-${word.thai}`));
  });

  it('writes every word in Thai script', () => {
    vocabulary.forEach((word) => expect(word.thai).toMatch(THAI_TEXT));
  });

  it('gives every word a manually provided pronunciation and meaning', () => {
    vocabulary.forEach((word) => {
      expect(word.pronunciation.trim()).not.toBe('');
      expect(word.meaning.trim()).not.toBe('');
    });
  });

  it('writes pronunciations in Burmese script', () => {
    vocabulary
      .filter((word) => !PENDING_BURMESE_PRONUNCIATION.includes(word.id))
      .forEach((word) => expect(word.pronunciation, word.id).toMatch(MYANMAR_SCRIPT));
  });

  it('keeps the pending Burmese pronunciation list up to date', () => {
    const pending = vocabulary.filter((word) => !MYANMAR_SCRIPT.test(word.pronunciation)).map((word) => word.id);

    expect(pending).toEqual(PENDING_BURMESE_PRONUNCIATION);
  });

  it('stores Burmese text in Unicode logical order without invisible characters', () => {
    vocabulary.forEach((word) => {
      [word.pronunciation, word.meaning].forEach((text) => {
        expect(text, word.id).not.toMatch(INVISIBLE_CHARACTERS);
        expect(text, word.id).not.toMatch(VISUAL_ORDER_VOWEL_SIGN_E);
      });
    });
  });

  it('references an SVG image that exists for every word', () => {
    vocabulary.forEach((word) => {
      expect(word.image, word.id).toMatch(/^\/images\/words\/[a-z]+\.svg$/);
      expect(publicFileExists(word.image as string), word.image).toBe(true);
    });
  });

  it('keeps SVG images free of scripts, event handlers and external references', () => {
    vocabulary.forEach((word) => {
      const svg = readFileSync(join(process.cwd(), 'public', word.image as string), 'utf-8');

      expect(svg, word.image).toMatch(/^<svg[^>]*viewBox="0 0 32 32"/);
      expect(svg, word.image).not.toMatch(/<script|<foreignObject|\son[a-z]+=|href="(?!#)/i);
    });
  });

  it('references audio that exists for every word', () => {
    vocabulary.forEach((word) => {
      expect(word.audio, word.id).toBeDefined();
      expect(publicFileExists(word.audio as string), word.audio).toBe(true);
    });
  });
});
