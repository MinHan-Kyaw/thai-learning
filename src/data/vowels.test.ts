import { getUnmarkedTone } from '../helpers/tones';
import { getSyllable } from '../helpers/vowels';
import type { Vowel } from '../types/learning';

import { consonantClasses, consonants, guide, toneMarks, tones, vowelGroups, vowels } from '.';

const THAI_TEXT = /^[\u0E00-\u0E7F]+$/;
const MYANMAR_SCRIPT = /^[\u1000-\u109F]+$/;
const INVISIBLE_CHARACTERS = /[\u200B-\u200D\uFEFF]/;
const VISUAL_ORDER_VOWEL_SIGN_E = /(^|[^\u1000-\u109F])\u1031/;

// Vowels whose Burmese pronunciation the source doesn't give yet; confirmed by the owner.
const PENDING_BURMESE_PRONUNCIATION: string[] = [];

describe('tones', () => {
  it('defines the five Thai tones', () => {
    expect(tones.map((tone) => tone.id)).toEqual(['mid', 'low', 'falling', 'high', 'rising']);
  });

  it('gives every tone a name, Thai name and pitch from 1 to 5', () => {
    tones.forEach((tone) => {
      expect(tone.name).not.toBe('');
      expect(tone.thaiName).toMatch(THAI_TEXT);
      tone.pitch.forEach((level) => expect(level).toBeGreaterThanOrEqual(1));
      tone.pitch.forEach((level) => expect(level).toBeLessThanOrEqual(5));
    });
  });

  it('defines the four tone marks', () => {
    expect(toneMarks.map((toneMark) => toneMark.mark)).toEqual(['่', '้', '๊', '๋']);
    toneMarks.forEach((toneMark) => expect(toneMark.thaiName).toMatch(THAI_TEXT));
  });

  it('matches each class tone to its live-syllable tone', () => {
    consonantClasses.forEach((consonantClass) => {
      const tone = tones.find((item) => item.id === getUnmarkedTone(consonantClass.id, 'live'));

      expect(consonantClass.tone).toBe(tone?.name);
    });
  });

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

  it('states one tone rule per consonant group for short and long vowels that matches the tone rules', () => {
    vowelGroups
      .filter((group) => group.rules)
      .forEach((group) => {
        const vowel = vowels.find((item) => item.group === group.id) as Vowel;

        expect(group.rules).toHaveLength(consonantClasses.length);
        consonantClasses.forEach((consonantClass, index) => {
          const tone = tones.find((item) => item.id === getUnmarkedTone(consonantClass.id, getSyllable(vowel)));
          const rule = group.rules?.[index] ?? '';

          expect(rule).toMatch(new RegExp(`^Gp ${consonantClass.group} \\+ `));
          expect(rule.toLowerCase()).toContain(tone?.name.toLowerCase());
        });
      });
    expect(vowelGroups.filter((group) => group.rules).map((group) => group.id)).toEqual(['short', 'long']);
  });

  it('gives every group a name and short name', () => {
    vowelGroups.forEach((group) => {
      expect(group.name).not.toBe('');
      expect(group.shortName).not.toBe('');
    });
  });
});

describe('guide', () => {
  const texts = [...Object.values(guide.syllables).flatMap(({ name, detail }) => [name, detail]), ...Object.values(guide.tones)];

  it('explains the rules in Burmese', () => {
    texts.forEach((text) => {
      expect(text).toMatch(/[\u1000-\u109F]/);
      expect(text).not.toMatch(INVISIBLE_CHARACTERS);
      expect(text).not.toMatch(VISUAL_ORDER_VOWEL_SIGN_E);
    });
  });

  it('gives the Thai terms for live and dead syllables', () => {
    expect(guide.syllables.live.thaiName).toBe('คำเป็น');
    expect(guide.syllables.dead.thaiName).toBe('คำตาย');
  });
});
