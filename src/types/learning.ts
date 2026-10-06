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

export type SyllableType = 'live' | 'dead';

export type ToneId = 'mid' | 'low' | 'falling' | 'high' | 'rising';

export interface Tone {
  id: ToneId;
  name: string;
  thaiName: string;
  pitch: [number, number]; // start and end pitch, 1 (lowest) to 5 (highest)
}

export interface ToneMark {
  mark: string;
  thaiName: string;
}

export type VowelGroupId = 'short' | 'long' | 'extra' | 'standalone';

export interface VowelGroup {
  id: VowelGroupId;
  name: string;
  shortName: string;
  rules?: string[]; // one per consonant class, in group order, as the source states it; none where the source has none
}

export interface Vowel {
  id: string; // written with a dash for the consonant, e.g. "เ-ือะ"; standalone vowels have none
  group: VowelGroupId;
  sound: string; // English approximation, e.g. "eua"
  pronunciation: string; // Burmese pronunciation from the source, e.g. "အူရ"
}

interface VowelQuestionBase {
  id: string; // the syllable
  consonant: Consonant;
  vowel: Vowel;
  syllable: string;
  tone: ToneId;
}

// spell: pick how consonant + vowel is written; tone: pick the tone of the written syllable.
export type VowelQuestion = (VowelQuestionBase & { kind: 'spell'; options: string[] }) | (VowelQuestionBase & { kind: 'tone' });

interface SyllableGuide {
  name: string;
  thaiName: string;
  detail: string;
}

// Explanations shown on the tones screen and in the vowel practice; English until the owner supplies Burmese.
export interface Guide {
  syllables: Record<SyllableType, SyllableGuide>;
  tones: { intro: string; rulesNote: string; markDetail: string; notUsed: string };
}
