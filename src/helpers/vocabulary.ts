import type { Consonant, ConsonantClassId, VocabularyItem } from '../types/learning';

export const getConsonantsByClass = (consonants: readonly Consonant[], classId: ConsonantClassId): Consonant[] =>
  consonants.filter((consonant) => consonant.class === classId);

export const getVocabulary = (consonants: readonly Consonant[]): VocabularyItem[] =>
  consonants.flatMap((consonant) =>
    consonant.words.map((word) => ({ ...word, consonant: consonant.character, consonantClass: consonant.class }))
  );

export const getLetterWithWord = ({ consonant, thai }: Pick<VocabularyItem, 'consonant' | 'thai'>): string =>
  `${consonant} (${thai})`;
