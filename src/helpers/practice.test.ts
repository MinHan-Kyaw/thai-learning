import { buildQuestion, buildVocabulary, buildVocabularyItem } from '../tests/fixtures';
import type { VocabularyItem } from '../types/learning';

import {
  assignAnswerModes,
  createPracticeState,
  generatePracticeQuestions,
  getAnswerModes,
  getCurrentQuestion,
  hasAnswer,
  isAnswerCorrect,
  isPracticeComplete,
  practiceReducer,
  type PracticeState,
} from './practice';

const buildLargeVocabulary = (size: number): VocabularyItem[] =>
  Array.from({ length: size }, (_, index) =>
    buildVocabularyItem({ id: `word-${index}`, thai: `word ${index}`, image: `/images/words/${index}.svg` })
  );

describe('generatePracticeQuestions', () => {
  it('generates the requested number of questions', () => {
    expect(generatePracticeQuestions(buildLargeVocabulary(20), { questionCount: 10 })).toHaveLength(10);
  });

  it('never generates more questions than there are words', () => {
    expect(generatePracticeQuestions(buildVocabulary(), { questionCount: 10 })).toHaveLength(4);
  });

  it('asks each word at most once per session', () => {
    const questions = generatePracticeQuestions(buildLargeVocabulary(20), { questionCount: 20 });

    expect(new Set(questions.map((question) => question.answer.id)).size).toBe(20);
  });

  it('gives every question exactly three options including the correct answer', () => {
    generatePracticeQuestions(buildLargeVocabulary(20)).forEach((question) => {
      expect(question.options).toHaveLength(3);
      expect(question.options).toContainEqual(question.answer);
    });
  });

  it('never repeats an answer within the same question', () => {
    generatePracticeQuestions(buildLargeVocabulary(20)).forEach((question) => {
      expect(new Set(question.options.map((option) => option.id)).size).toBe(3);
      expect(new Set(question.options.map((option) => option.thai)).size).toBe(3);
    });
  });

  it('randomizes the question order', () => {
    const vocabulary = buildLargeVocabulary(20);
    const orders = new Set(
      Array.from({ length: 10 }, () =>
        generatePracticeQuestions(vocabulary)
          .map((question) => question.id)
          .join(',')
      )
    );

    expect(orders.size).toBeGreaterThan(1);
  });

  it('places the correct answer in every position across questions', () => {
    const positions = new Set(
      generatePracticeQuestions(buildLargeVocabulary(60), { questionCount: 60 }).map((question) =>
        question.options.findIndex((option) => option.id === question.answer.id)
      )
    );

    expect(positions).toEqual(new Set([0, 1, 2]));
  });

  it('does not mutate the vocabulary', () => {
    const vocabulary = Object.freeze(buildLargeVocabulary(20));

    expect(() => generatePracticeQuestions(vocabulary)).not.toThrow();
  });

  it('asks every question by selecting an answer by default', () => {
    generatePracticeQuestions(buildLargeVocabulary(20)).forEach((question) => expect(question.mode).toBe('select'));
  });

  describe('given several answer modes', () => {
    it('mixes them across the questions', () => {
      const questions = generatePracticeQuestions(buildLargeVocabulary(60), {
        questionCount: 60,
        modes: ['select', 'class', 'type', 'speak'],
      });

      expect(new Set(questions.map((question) => question.mode))).toEqual(new Set(['select', 'class', 'type', 'speak']));
    });
  });

  describe('given some words have no image', () => {
    it('only asks about words that can be shown as a picture', () => {
      const vocabulary = [...buildVocabulary(), buildVocabularyItem({ id: 'ฑ-มณโฑ', thai: 'มณโฑ', image: undefined })];

      const questions = generatePracticeQuestions(vocabulary, { questionCount: 10 });

      expect(questions.map((question) => question.answer.id)).not.toContain('ฑ-มณโฑ');
    });
  });

  describe('given there are fewer distinct words than answer options', () => {
    it('returns no questions', () => {
      expect(generatePracticeQuestions(buildVocabulary().slice(0, 2))).toEqual([]);
    });
  });
});

describe('practiceReducer', () => {
  const questions = [buildQuestion(0), buildQuestion(1)];
  const initialState = createPracticeState(questions);

  it('starts at the first question with no score', () => {
    expect(initialState).toEqual({
      questions,
      currentQuestionIndex: 0,
      selectedAnswerId: null,
      response: '',
      answered: false,
      score: 0,
    });
    expect(getCurrentQuestion(initialState)).toBe(questions[0]);
  });

  describe('SELECT_ANSWER', () => {
    it('selects the answer without evaluating it', () => {
      const state = practiceReducer(initialState, { type: 'SELECT_ANSWER', answerId: 'จ-จาน' });

      expect(state.selectedAnswerId).toBe('จ-จาน');
      expect(state.answered).toBe(false);
      expect(state.score).toBe(0);
    });

    it('replaces a previous selection', () => {
      const selected = practiceReducer(initialState, { type: 'SELECT_ANSWER', answerId: 'จ-จาน' });

      expect(practiceReducer(selected, { type: 'SELECT_ANSWER', answerId: 'ก-ไก่' }).selectedAnswerId).toBe('ก-ไก่');
    });

    describe('given the answer is not one of the options', () => {
      it('ignores it', () => {
        expect(practiceReducer(initialState, { type: 'SELECT_ANSWER', answerId: 'unknown' })).toBe(initialState);
      });
    });

    describe('given the question was already evaluated', () => {
      it('ignores it', () => {
        const answered: PracticeState = { ...initialState, selectedAnswerId: 'ก-ไก่', answered: true };

        expect(practiceReducer(answered, { type: 'SELECT_ANSWER', answerId: 'จ-จาน' })).toBe(answered);
      });
    });

    describe('given the question is answered by typing', () => {
      it('ignores it', () => {
        const typing = createPracticeState([buildQuestion(0, 'type')]);

        expect(practiceReducer(typing, { type: 'SELECT_ANSWER', answerId: 'ก-ไก่' })).toBe(typing);
      });
    });
  });

  describe('ENTER_RESPONSE', () => {
    it('stores the typed or spoken answer without evaluating it', () => {
      const typing = createPracticeState([buildQuestion(0, 'type')]);

      const state = practiceReducer(typing, { type: 'ENTER_RESPONSE', response: 'ไก่' });

      expect(state.response).toBe('ไก่');
      expect(state.answered).toBe(false);
    });

    describe('given the question is answered by selecting', () => {
      it('ignores it', () => {
        expect(practiceReducer(initialState, { type: 'ENTER_RESPONSE', response: 'ไก่' })).toBe(initialState);
      });
    });

    describe('given the question was already evaluated', () => {
      it('ignores it', () => {
        const answered: PracticeState = { ...createPracticeState([buildQuestion(0, 'type')]), response: 'ไก่', answered: true };

        expect(practiceReducer(answered, { type: 'ENTER_RESPONSE', response: 'ปลา' })).toBe(answered);
      });
    });
  });

  describe('SET_ANSWER_MODES', () => {
    it('changes the mode of the current and upcoming questions and clears the current answer', () => {
      const selected = practiceReducer(initialState, { type: 'SELECT_ANSWER', answerId: 'จ-จาน' });

      const state = practiceReducer(selected, { type: 'SET_ANSWER_MODES', modes: ['type', 'speak'] });

      expect(state.questions.map((question) => question.mode)).toEqual(['type', 'speak']);
      expect(state.selectedAnswerId).toBeNull();
      expect(state.response).toBe('');
    });

    describe('given the current question keeps its mode', () => {
      it('keeps the current answer', () => {
        const selected = practiceReducer(initialState, { type: 'SELECT_ANSWER', answerId: 'จ-จาน' });

        const state = practiceReducer(selected, { type: 'SET_ANSWER_MODES', modes: ['select', 'type'] });

        expect(state.selectedAnswerId).toBe('จ-จาน');
        expect(state.questions[0]).toBe(questions[0]);
      });
    });

    describe('given the current question was already evaluated', () => {
      it('only changes the upcoming questions', () => {
        const answered: PracticeState = { ...initialState, selectedAnswerId: 'ก-ไก่', answered: true, score: 1 };

        const state = practiceReducer(answered, { type: 'SET_ANSWER_MODES', modes: ['type', 'type'] });

        expect(state.questions.map((question) => question.mode)).toEqual(['select', 'type']);
        expect(state.selectedAnswerId).toBe('ก-ไก่');
      });
    });
  });

  describe('SUBMIT_ANSWER', () => {
    describe('given the correct answer is selected', () => {
      it('marks the question answered and increments the score', () => {
        const selected = practiceReducer(initialState, { type: 'SELECT_ANSWER', answerId: 'ก-ไก่' });

        const state = practiceReducer(selected, { type: 'SUBMIT_ANSWER' });

        expect(state.answered).toBe(true);
        expect(state.score).toBe(1);
      });
    });

    describe('given an incorrect answer is selected', () => {
      it('marks the question answered without scoring', () => {
        const selected = practiceReducer(initialState, { type: 'SELECT_ANSWER', answerId: 'จ-จาน' });

        const state = practiceReducer(selected, { type: 'SUBMIT_ANSWER' });

        expect(state.answered).toBe(true);
        expect(state.score).toBe(0);
      });
    });

    describe('given no answer is selected', () => {
      it('ignores it', () => {
        expect(practiceReducer(initialState, { type: 'SUBMIT_ANSWER' })).toBe(initialState);
      });
    });

    describe('given the correct word is typed', () => {
      it('scores the answer', () => {
        const typed = practiceReducer(createPracticeState([buildQuestion(0, 'type')]), {
          type: 'ENTER_RESPONSE',
          response: 'ไก่',
        });

        const state = practiceReducer(typed, { type: 'SUBMIT_ANSWER' });

        expect(state.answered).toBe(true);
        expect(state.score).toBe(1);
      });
    });

    describe('given the correct group is chosen', () => {
      it('scores the answer', () => {
        const chosen = practiceReducer(createPracticeState([buildQuestion(0, 'class')]), {
          type: 'ENTER_RESPONSE',
          response: 'middle',
        });

        const state = practiceReducer(chosen, { type: 'SUBMIT_ANSWER' });

        expect(state.answered).toBe(true);
        expect(state.score).toBe(1);
      });
    });

    describe('given a wrong word is spoken', () => {
      it('marks the question answered without scoring', () => {
        const spoken = practiceReducer(createPracticeState([buildQuestion(0, 'speak')]), {
          type: 'ENTER_RESPONSE',
          response: 'ปลา',
        });

        const state = practiceReducer(spoken, { type: 'SUBMIT_ANSWER' });

        expect(state.answered).toBe(true);
        expect(state.score).toBe(0);
      });
    });

    describe('given only whitespace is typed', () => {
      it('ignores it', () => {
        const typed = practiceReducer(createPracticeState([buildQuestion(0, 'type')]), {
          type: 'ENTER_RESPONSE',
          response: '  ',
        });

        expect(practiceReducer(typed, { type: 'SUBMIT_ANSWER' })).toBe(typed);
      });
    });

    describe('given the question was already evaluated', () => {
      it('does not score twice', () => {
        const answered: PracticeState = { ...initialState, selectedAnswerId: 'ก-ไก่', answered: true, score: 1 };

        expect(practiceReducer(answered, { type: 'SUBMIT_ANSWER' }).score).toBe(1);
      });
    });
  });

  describe('NEXT_QUESTION', () => {
    it('advances to the next question and clears the answer', () => {
      const answered: PracticeState = { ...initialState, selectedAnswerId: 'ก-ไก่', response: 'ไก่', answered: true, score: 1 };

      const state = practiceReducer(answered, { type: 'NEXT_QUESTION' });

      expect(state.currentQuestionIndex).toBe(1);
      expect(state.selectedAnswerId).toBeNull();
      expect(state.response).toBe('');
      expect(state.answered).toBe(false);
      expect(state.score).toBe(1);
      expect(getCurrentQuestion(state)).toBe(questions[1]);
    });

    describe('given the current question has not been evaluated', () => {
      it('stays on the current question', () => {
        expect(practiceReducer(initialState, { type: 'NEXT_QUESTION' })).toBe(initialState);
      });
    });

    describe('given the last question was evaluated', () => {
      it('completes the practice', () => {
        const lastAnswered: PracticeState = {
          ...initialState,
          currentQuestionIndex: 1,
          selectedAnswerId: 'จ-จาน',
          answered: true,
        };

        const state = practiceReducer(lastAnswered, { type: 'NEXT_QUESTION' });

        expect(isPracticeComplete(state)).toBe(true);
        expect(getCurrentQuestion(state)).toBeUndefined();
      });
    });
  });

  describe('RESTART', () => {
    it('starts a fresh session with the new questions', () => {
      const finished: PracticeState = { ...initialState, currentQuestionIndex: 2, score: 2 };
      const newQuestions = [buildQuestion(2)];

      expect(practiceReducer(finished, { type: 'RESTART', questions: newQuestions })).toEqual(createPracticeState(newQuestions));
    });
  });
});

describe('isAnswerCorrect', () => {
  it('detects the correct answer', () => {
    expect(isAnswerCorrect(buildQuestion(0), { selectedAnswerId: 'ก-ไก่', response: '' })).toBe(true);
  });

  it('detects an incorrect answer', () => {
    expect(isAnswerCorrect(buildQuestion(0), { selectedAnswerId: 'จ-จาน', response: '' })).toBe(false);
  });

  describe('given a typing question', () => {
    it('compares the typed Thai word', () => {
      expect(isAnswerCorrect(buildQuestion(0, 'type'), { selectedAnswerId: null, response: 'ก ไก่' })).toBe(true);
      expect(isAnswerCorrect(buildQuestion(0, 'type'), { selectedAnswerId: null, response: 'ไข่' })).toBe(false);
    });
  });

  describe('given a group question', () => {
    it("compares the chosen class with the letter's class", () => {
      expect(isAnswerCorrect(buildQuestion(0, 'class'), { selectedAnswerId: null, response: 'middle' })).toBe(true);
      expect(isAnswerCorrect(buildQuestion(0, 'class'), { selectedAnswerId: null, response: 'high' })).toBe(false);
    });
  });

  describe('given a speaking question', () => {
    it('looks for the word in what was heard', () => {
      expect(isAnswerCorrect(buildQuestion(0, 'speak'), { selectedAnswerId: null, response: 'กอ ไก่' })).toBe(true);
      expect(isAnswerCorrect(buildQuestion(0, 'speak'), { selectedAnswerId: null, response: 'ปลา' })).toBe(false);
    });
  });
});

describe('hasAnswer', () => {
  describe('given a selecting question', () => {
    it('needs a selected option', () => {
      expect(hasAnswer(buildQuestion(0), { selectedAnswerId: null, response: 'ไก่' })).toBe(false);
      expect(hasAnswer(buildQuestion(0), { selectedAnswerId: 'ก-ไก่', response: '' })).toBe(true);
    });
  });

  describe('given a typing question', () => {
    it('needs non-blank text', () => {
      expect(hasAnswer(buildQuestion(0, 'type'), { selectedAnswerId: null, response: ' ' })).toBe(false);
      expect(hasAnswer(buildQuestion(0, 'type'), { selectedAnswerId: null, response: 'ไ' })).toBe(true);
    });
  });
});

describe('getAnswerModes', () => {
  const allEnabled = { class: true, type: true, speak: true };

  describe('given advanced practice is off', () => {
    it('only selects answers', () => {
      expect(getAnswerModes({ advanced: false, enabled: allEnabled })).toEqual(['select']);
    });
  });

  describe('given advanced practice is on', () => {
    it('adds choosing the group, typing and speaking', () => {
      expect(getAnswerModes({ advanced: true, enabled: allEnabled })).toEqual(['select', 'class', 'type', 'speak']);
    });
  });

  describe('given some question types are turned off', () => {
    it('leaves them out but always keeps selecting', () => {
      expect(getAnswerModes({ advanced: true, enabled: { class: true, type: false, speak: false } })).toEqual([
        'select',
        'class',
      ]);
      expect(getAnswerModes({ advanced: true, enabled: {} })).toEqual(['select']);
    });
  });
});

describe('assignAnswerModes', () => {
  it('picks one of the given modes for each question', () => {
    const sequence = [0, 0.4, 0.9];
    const random = () => sequence.shift() ?? 0;

    expect(assignAnswerModes(3, ['select', 'type', 'speak'], random)).toEqual(['select', 'type', 'speak']);
  });
});

describe('isPracticeComplete', () => {
  describe('given there are no questions', () => {
    it('is not complete', () => {
      expect(isPracticeComplete(createPracticeState([]))).toBe(false);
    });
  });
});
