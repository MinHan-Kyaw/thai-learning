import { ANSWER_OPTION_COUNT, QUESTION_COUNT } from '../constants/practice';
import type { PracticeQuestion, VocabularyItem } from '../types/learning';

import { randomizeArray } from './randomizeArray';

interface GenerateQuestionsOptions {
  questionCount?: number;
  optionCount?: number;
  random?: () => number;
}

export interface PracticeState {
  questions: PracticeQuestion[];
  currentQuestionIndex: number;
  selectedAnswerId: string | null;
  answered: boolean;
  score: number;
}

export type PracticeAction =
  | { type: 'SELECT_ANSWER'; answerId: string }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESTART'; questions: PracticeQuestion[] };

const pickDistractors = (
  pool: readonly VocabularyItem[],
  answer: VocabularyItem,
  count: number,
  random: () => number
): VocabularyItem[] => {
  const usedWords = new Set([answer.thai]);

  return randomizeArray(pool, random)
    .filter((item) => {
      if (usedWords.has(item.thai)) {
        return false;
      }
      usedWords.add(item.thai);
      return true;
    })
    .slice(0, count);
};

export const generatePracticeQuestions = (
  vocabulary: readonly VocabularyItem[],
  { questionCount = QUESTION_COUNT, optionCount = ANSWER_OPTION_COUNT, random = Math.random }: GenerateQuestionsOptions = {}
): PracticeQuestion[] => {
  const pool = vocabulary.filter((item) => item.image);
  const distinctWordCount = new Set(pool.map((item) => item.thai)).size;

  if (distinctWordCount < optionCount) {
    return [];
  }

  return randomizeArray(pool, random)
    .slice(0, questionCount)
    .map((answer) => ({
      id: answer.id,
      answer,
      options: randomizeArray([answer, ...pickDistractors(pool, answer, optionCount - 1, random)], random),
    }));
};

export const createPracticeState = (questions: PracticeQuestion[]): PracticeState => ({
  questions,
  currentQuestionIndex: 0,
  selectedAnswerId: null,
  answered: false,
  score: 0,
});

export const getCurrentQuestion = (state: PracticeState): PracticeQuestion | undefined =>
  state.questions[state.currentQuestionIndex];

export const isPracticeComplete = (state: PracticeState): boolean =>
  state.questions.length > 0 && state.currentQuestionIndex >= state.questions.length;

export const isAnswerCorrect = (question: PracticeQuestion, answerId: string | null): boolean => question.answer.id === answerId;

export const practiceReducer = (state: PracticeState, action: PracticeAction): PracticeState => {
  const question = getCurrentQuestion(state);

  switch (action.type) {
    case 'SELECT_ANSWER':
      if (!question || state.answered || !question.options.some((option) => option.id === action.answerId)) {
        return state;
      }
      return { ...state, selectedAnswerId: action.answerId };

    case 'SUBMIT_ANSWER':
      if (!question || state.answered || state.selectedAnswerId === null) {
        return state;
      }
      return {
        ...state,
        answered: true,
        score: isAnswerCorrect(question, state.selectedAnswerId) ? state.score + 1 : state.score,
      };

    case 'NEXT_QUESTION':
      if (!state.answered) {
        return state;
      }
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1, selectedAnswerId: null, answered: false };

    case 'RESTART':
      return createPracticeState(action.questions);

    default:
      return state;
  }
};
