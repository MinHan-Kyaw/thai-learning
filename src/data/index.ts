import type { Consonant, ConsonantClass, Vowel, VowelGroup } from '../types/learning';

import consonantClassesData from './consonantClasses.json';
import consonantsData from './consonants.json';
import vowelGroupsData from './vowelGroups.json';
import vowelsData from './vowels.json';

export const consonantClasses = consonantClassesData as ConsonantClass[];
export const consonants = consonantsData as Consonant[];
export const vowelGroups = vowelGroupsData as VowelGroup[];
export const vowels = vowelsData as Vowel[];
