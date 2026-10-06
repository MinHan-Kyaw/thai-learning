export type ConsonantClassId = 'middle' | 'high' | 'low';

export interface ConsonantClass {
  id: ConsonantClassId;
  group: number;
  name: string;
  shortName: string;
  burmeseName: string;
  tone: string;
  exampleConsonant: string;
  exampleSound: string; // English initial sound of exampleConsonant, e.g. "kh"
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
  consonantClass: ConsonantClassId;
}

export type AnswerMode = 'select' | 'class' | 'type' | 'speak';

export interface PracticeQuestion {
  id: string;
  answer: VocabularyItem;
  options: VocabularyItem[];
  mode: AnswerMode;
}

export type VowelGroupId = 'short' | 'long' | 'extra' | 'standalone';

export interface VowelGroup {
  id: VowelGroupId;
  name: string;
  shortName: string;
  tones?: string[]; // tone each consonant class takes, in group order, as the source states it; none where the source has none
}

export interface Vowel {
  id: string; // written with a dash for the consonant, e.g. "เ-ือะ"; standalone vowels have none
  group: VowelGroupId;
  sound: string; // English approximation, e.g. "eua"
  pronunciation: string; // Burmese pronunciation from the source, e.g. "အူရ"
}
