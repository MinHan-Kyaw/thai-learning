import { consonantClasses, consonants, vowelGroups, vowels } from '.';

const MYANMAR_SCRIPT = /^[\u1000-\u109F]+$/;
const INVISIBLE_CHARACTERS = /[\u200B-\u200D\uFEFF]/;
const MYANMAR_TEXT = /^[\u1000-\u109F ]+$/;
const VISUAL_ORDER_VOWEL_SIGN_E = /(^|[^\u1000-\u109F])\u1031/;

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

  // Drafted by Claude at the owner's request (2026-10-01); see the content review log.
  it('gives every vowel an English sound and a Burmese pronunciation in logical order', () => {
    vowels.forEach((vowel) => {
      expect(vowel.sound, vowel.id).toMatch(/^[a-z]+$/);
      expect(vowel.pronunciation, vowel.id).toMatch(MYANMAR_SCRIPT);
      expect(vowel.pronunciation, vowel.id).not.toMatch(INVISIBLE_CHARACTERS);
      expect(vowel.pronunciation, vowel.id).not.toMatch(VISUAL_ORDER_VOWEL_SIGN_E);
    });
  });

  it('states one tone rule per consonant group', () => {
    vowelGroups
      .filter((group) => group.id !== 'standalone')
      .forEach((group) => {
        expect(group.rules).toHaveLength(consonantClasses.length);
        consonantClasses.forEach((consonantClass, index) => {
          expect(group.rules?.[index]).toContain(`Group ${consonantClass.group} (${consonantClass.shortName} Consonants)`);
        });
      });
  });

  it('gives standalone vowels no tone rules', () => {
    expect(vowelGroups.find((group) => group.id === 'standalone')?.rules).toBeUndefined();
  });

  it('gives every group a name and note', () => {
    vowelGroups.forEach((group) => {
      expect(group.name).not.toBe('');
      expect(group.burmeseName).toMatch(MYANMAR_TEXT);
      expect(group.note).toMatch(MYANMAR_TEXT);
    });
  });
});
