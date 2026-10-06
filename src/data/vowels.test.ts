import { consonantClasses, consonants, vowelGroups, vowels } from '.';

const MYANMAR_SCRIPT = /^[\u1000-\u109F]+$/;
const INVISIBLE_CHARACTERS = /[\u200B-\u200D\uFEFF]/;
const VISUAL_ORDER_VOWEL_SIGN_E = /(^|[^\u1000-\u109F])\u1031/;

// Vowels whose Burmese pronunciation the source doesn't give yet; confirmed by the owner.
const PENDING_BURMESE_PRONUNCIATION: string[] = [];

describe('consonant class examples', () => {
  it('uses an example consonant from each class', () => {
    consonantClasses.forEach((consonantClass) => {
      const consonant = consonants.find((item) => item.character === consonantClass.exampleConsonant);

      expect(consonant?.class).toBe(consonantClass.id);
      expect(consonantClass.exampleSound).toMatch(/^[a-z]+$/);
    });
  });
});

describe('vowels', () => {
  it('contains 32 vowels split 12 / 12 / 4 / 4 across the groups', () => {
    const countByGroup = (groupId: string) => vowels.filter((vowel) => vowel.group === groupId).length;

    expect(vowelGroups.map((group) => group.id)).toEqual(['short', 'long', 'extra', 'standalone']);
    expect(vowels).toHaveLength(32);
    expect(vowelGroups.map((group) => countByGroup(group.id))).toEqual([12, 12, 4, 4]);
  });

  it('uses unique Thai ids', () => {
    expect(new Set(vowels.map((vowel) => vowel.id)).size).toBe(vowels.length);
    vowels.forEach((vowel) => expect(vowel.id).toMatch(/^[\u0E00-\u0E7F-]+$/));
  });

  it('writes combinable vowels with one dash for the consonant and standalone vowels without it', () => {
    vowels.forEach((vowel) => expect(vowel.id.split('-').length - 1, vowel.id).toBe(vowel.group === 'standalone' ? 0 : 1));
  });

  it('gives every vowel an English sound', () => {
    vowels.forEach((vowel) => expect(vowel.sound, vowel.id).toMatch(/^[a-z]+$/));
  });

  it('gives every vowel a Burmese pronunciation unless it is pending', () => {
    vowels
      .filter((vowel) => !PENDING_BURMESE_PRONUNCIATION.includes(vowel.id))
      .forEach((vowel) => expect(vowel.pronunciation, vowel.id).toMatch(MYANMAR_SCRIPT));
  });

  it('keeps the pending Burmese pronunciation list up to date', () => {
    const pending = vowels.filter((vowel) => !MYANMAR_SCRIPT.test(vowel.pronunciation)).map((vowel) => vowel.id);

    expect(pending).toEqual(PENDING_BURMESE_PRONUNCIATION);
  });

  it('stores Burmese pronunciation in Unicode logical order without invisible characters', () => {
    vowels.forEach((vowel) => {
      expect(vowel.pronunciation, vowel.id).not.toMatch(INVISIBLE_CHARACTERS);
      expect(vowel.pronunciation, vowel.id).not.toMatch(VISUAL_ORDER_VOWEL_SIGN_E);
    });
  });

  it('states one tone per consonant group for short and long vowels', () => {
    vowelGroups
      .filter((group) => group.tones)
      .forEach((group) => {
        expect(group.tones).toHaveLength(consonantClasses.length);
      });
    expect(vowelGroups.filter((group) => group.tones).map((group) => group.id)).toEqual(['short', 'long']);
  });

  it('gives every group a name and short name', () => {
    vowelGroups.forEach((group) => {
      expect(group.name).not.toBe('');
      expect(group.shortName).not.toBe('');
    });
  });
});
