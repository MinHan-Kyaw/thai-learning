import type { PracticeQuestion, VocabularyItem } from '../types/learning';

export const buildVocabularyItem = (overrides: Partial<VocabularyItem> = {}): VocabularyItem => ({
  id: 'ก-ไก่',
  consonant: 'ก',
  thai: 'ไก่',
  pronunciation: 'ကောကိုင်',
  meaning: 'ကြက်',
  image: '/images/words/kai.svg',
  audio: '/audio/words/kai.m4a',
  ...overrides,
});

export const buildVocabulary = (): VocabularyItem[] => [
  buildVocabularyItem(),
  buildVocabularyItem({
    id: 'จ-จาน',
    consonant: 'จ',
    thai: 'จาน',
    pronunciation: 'ကျောကျန်း',
    meaning: 'ပန်းကန်ပြား',
    image: '/images/words/chan.svg',
    audio: '/audio/words/chan.m4a',
  }),
  buildVocabularyItem({
    id: 'ป-ปลา',
    consonant: 'ป',
    thai: 'ปลา',
    pronunciation: 'ပေါပလား',
    meaning: 'ငါး',
    image: '/images/words/pla.svg',
    audio: '/audio/words/pla.m4a',
  }),
  buildVocabularyItem({
    id: 'ด-เด็ก',
    consonant: 'ด',
    thai: 'เด็ก',
    pronunciation: 'ဒေါဒေ့',
    meaning: 'ကလေး',
    image: '/images/words/dek.svg',
    audio: '/audio/words/dek.m4a',
  }),
];

export const buildQuestion = (answerIndex = 0): PracticeQuestion => {
  const options = buildVocabulary().slice(0, 3);
  const answer = options[answerIndex] as VocabularyItem;

  return { id: answer.id, answer, options };
};
