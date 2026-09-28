import type { VocabularyItem } from '../types/learning';

const IGNORED_CHARACTERS = /[\s()\u200B-\u200D\uFEFF.,!?'"]/gu;

// NFKC puts stacked marks in canonical order and treats sara am (ำ) the same as nikhahit + sara aa (ํา).
export const normalizeThai = (text: string): string => text.normalize('NFKC').replace(IGNORED_CHARACTERS, '');

type AnswerWord = Pick<VocabularyItem, 'consonant' | 'thai'>;

const getAcceptedAnswers = ({ consonant, thai }: AnswerWord): string[] =>
  [thai, `${consonant}${thai}`, `${consonant}อ${thai}`].map(normalizeThai);

export const isTypedAnswerCorrect = (answer: AnswerWord, typed: string): boolean =>
  getAcceptedAnswers(answer).includes(normalizeThai(typed));

export const isSpokenAnswerCorrect = (answer: AnswerWord, transcript: string): boolean => {
  const heard = normalizeThai(transcript);

  return heard.length > 0 && heard.includes(normalizeThai(answer.thai));
};

export const pickTranscript = (answer: AnswerWord, transcripts: readonly string[]): string =>
  transcripts.find((transcript) => isSpokenAnswerCorrect(answer, transcript)) ?? transcripts[0] ?? '';
