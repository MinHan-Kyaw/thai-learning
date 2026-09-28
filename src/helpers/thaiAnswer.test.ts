import { buildVocabularyItem } from '../tests/fixtures';

import { isSpokenAnswerCorrect, isTypedAnswerCorrect, normalizeThai, pickTranscript } from './thaiAnswer';

const kai = buildVocabularyItem();

describe('normalizeThai', () => {
  it('ignores spaces, brackets and invisible characters', () => {
    expect(normalizeThai(' ก (ไก่)\u200B ')).toBe('กไก่');
  });

  it('treats sara am the same as its two-part spelling', () => {
    expect(normalizeThai('น้ำ')).toBe(normalizeThai('น้ํา'));
  });
});

describe('isTypedAnswerCorrect', () => {
  it('accepts the word, the letter with the word, and the recited letter name', () => {
    ['ไก่', 'ก (ไก่)', 'กไก่', 'กอ ไก่'].forEach((typed) => expect(isTypedAnswerCorrect(kai, typed)).toBe(true));
  });

  it('rejects a different word or a missing tone mark', () => {
    ['ไข่', 'ไก', 'ไก่ไก่', ''].forEach((typed) => expect(isTypedAnswerCorrect(kai, typed)).toBe(false));
  });
});

describe('isSpokenAnswerCorrect', () => {
  it('accepts a transcript that contains the word', () => {
    expect(isSpokenAnswerCorrect(kai, 'กอไก่')).toBe(true);
  });

  it('rejects a transcript without the word', () => {
    expect(isSpokenAnswerCorrect(kai, 'ไข่')).toBe(false);
    expect(isSpokenAnswerCorrect(kai, ' ')).toBe(false);
  });
});

describe('pickTranscript', () => {
  describe('given one of the alternatives matches', () => {
    it('picks it', () => {
      expect(pickTranscript(kai, ['ไข่', 'กอ ไก่'])).toBe('กอ ไก่');
    });
  });

  describe('given no alternative matches', () => {
    it('picks the most likely one', () => {
      expect(pickTranscript(kai, ['ไข่', 'ไข'])).toBe('ไข่');
    });
  });

  describe('given nothing was heard', () => {
    it('returns an empty answer', () => {
      expect(pickTranscript(kai, [])).toBe('');
    });
  });
});
