export type ConsonantClassId = 'middle' | 'high' | 'low';

export interface ConsonantClass {
  id: ConsonantClassId;
  name: string;
  shortName: string;
  burmeseName: string;
  tone: string;
}

export interface Word {
  id: string;
  thai: string;
  pronunciation: string;
  meaning: string;
  image?: string;
  audio?: string;
}

export interface Consonant {
  id: string;
  character: string;
  class: ConsonantClassId;
  words: Word[];
}

export interface VocabularyItem extends Word {
  consonant: string;
}

export type AnswerMode = 'select' | 'type' | 'speak';

export interface PracticeQuestion {
  id: string;
  answer: VocabularyItem;
  options: VocabularyItem[];
  mode: AnswerMode;
}
