import { ANSWER_OPTION_COUNT, QUESTION_COUNT } from '../constants/practice';
import type { AnswerMode, PracticeQuestion, VocabularyItem } from '../types/learning';

import { randomizeArray } from './randomizeArray';
import { isSpokenAnswerCorrect, isTypedAnswerCorrect } from './thaiAnswer';

interface GenerateQuestionsOptions {
  questionCount?: number;
  optionCount?: number;
  modes?: readonly AnswerMode[];
  random?: () => number;
}

export interface PracticeState {
  questions: PracticeQuestion[];
  currentQuestionIndex: number;
  selectedAnswerId: string | null;
  response: string;
  answered: boolean;
  score: number;
}

export type PracticeAnswer = Pick<PracticeState, 'selectedAnswerId' | 'response'>;

export type PracticeAction =
  | { type: 'SELECT_ANSWER'; answerId: string }
  | { type: 'ENTER_RESPONSE'; response: string }
  | { type: 'SET_ANSWER_MODES'; modes: readonly AnswerMode[] }
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

export const ADVANCED_ANSWER_MODES: readonly AnswerMode[] = ['class', 'type', 'speak'];

export const getAnswerModes = ({
  advanced,
  enabled,
}: {
  advanced: boolean;
  enabled: Partial<Record<AnswerMode, boolean>>;
}): AnswerMode[] => (advanced ? ['select', ...ADVANCED_ANSWER_MODES.filter((mode) => enabled[mode])] : ['select']);

export const assignAnswerModes = (
  count: number,
  modes: readonly AnswerMode[],
  random: () => number = Math.random
): AnswerMode[] => Array.from({ length: count }, () => modes[Math.floor(random() * modes.length)] ?? 'select');

export const generatePracticeQuestions = (
  vocabulary: readonly VocabularyItem[],
  {
    questionCount = QUESTION_COUNT,
    optionCount = ANSWER_OPTION_COUNT,
    modes = ['select'],
    random = Math.random,
  }: GenerateQuestionsOptions = {}
): PracticeQuestion[] => {
  const pool = vocabulary.filter((item) => item.image);
  const distinctWordCount = new Set(pool.map((item) => item.thai)).size;

  if (distinctWordCount < optionCount) {
    return [];
  }

  const answers = randomizeArray(pool, random).slice(0, questionCount);
  const answerModes = assignAnswerModes(answers.length, modes, random);

  return answers.map((answer, index) => ({
    id: answer.id,
    answer,
    options: randomizeArray([answer, ...pickDistractors(pool, answer, optionCount - 1, random)], random),
    mode: answerModes[index] ?? 'select',
  }));
};

export const createPracticeState = (questions: PracticeQuestion[]): PracticeState => ({
  questions,
  currentQuestionIndex: 0,
  selectedAnswerId: null,
  response: '',
  answered: false,
  score: 0,
});

export const getCurrentQuestion = (state: PracticeState): PracticeQuestion | undefined =>
  state.questions[state.currentQuestionIndex];

export const isPracticeComplete = (state: PracticeState): boolean =>
  state.questions.length > 0 && state.currentQuestionIndex >= state.questions.length;

export const isAnswerCorrect = (question: PracticeQuestion, { selectedAnswerId, response }: PracticeAnswer): boolean => {
  switch (question.mode) {
    case 'class':
      return question.answer.consonantClass === response;
    case 'type':
      return isTypedAnswerCorrect(question.answer, response);
    case 'speak':
      return isSpokenAnswerCorrect(question.answer, response);
    default:
      return question.answer.id === selectedAnswerId;
  }
};

export const hasAnswer = (question: PracticeQuestion, { selectedAnswerId, response }: PracticeAnswer): boolean =>
  question.mode === 'select' ? selectedAnswerId !== null : response.trim() !== '';

export const practiceReducer = (state: PracticeState, action: PracticeAction): PracticeState => {
  const question = getCurrentQuestion(state);

  switch (action.type) {
    case 'SELECT_ANSWER':
      if (
        !question ||
        state.answered ||
        question.mode !== 'select' ||
        !question.options.some((option) => option.id === action.answerId)
      ) {
        return state;
      }
      return { ...state, selectedAnswerId: action.answerId };

    case 'ENTER_RESPONSE':
      if (!question || state.answered || question.mode === 'select') {
        return state;
      }
      return { ...state, response: action.response };

    case 'SET_ANSWER_MODES': {
      const firstChangeableIndex = state.answered ? state.currentQuestionIndex + 1 : state.currentQuestionIndex;
      const questions = state.questions.map((item, index) => {
        const mode = action.modes[index];
        return index >= firstChangeableIndex && mode && mode !== item.mode ? { ...item, mode } : item;
      });
      const currentModeChanged = questions[state.currentQuestionIndex] !== question;

      return {
        ...state,
        questions,
        selectedAnswerId: currentModeChanged ? null : state.selectedAnswerId,
        response: currentModeChanged ? '' : state.response,
      };
    }

    case 'SUBMIT_ANSWER':
      if (!question || state.answered || !hasAnswer(question, state)) {
        return state;
      }
      return {
        ...state,
        answered: true,
        score: isAnswerCorrect(question, state) ? state.score + 1 : state.score,
      };

    case 'NEXT_QUESTION':
      if (!state.answered) {
        return state;
      }
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedAnswerId: null,
        response: '',
        answered: false,
      };

    case 'RESTART':
      return createPracticeState(action.questions);

    default:
      return state;
  }
};
