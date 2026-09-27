import type { Consonant, ConsonantClass } from '../types/learning';

import consonantClassesData from './consonantClasses.json';
import consonantsData from './consonants.json';

export const consonantClasses = consonantClassesData as ConsonantClass[];
export const consonants = consonantsData as Consonant[];
