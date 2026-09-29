import { MemoryRouter } from 'react-router';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QUESTION_COUNT } from '../../constants/practice';
import { consonants } from '../../data';
import { getVocabulary, getLetterWithWord } from '../../helpers/vocabulary';
import { playAudio } from '../../services/audio';
import { playFeedbackSound } from '../../services/sound';
import { isSpeechRecognitionSupported, listen } from '../../services/speech';
import type { AnswerMode } from '../../types/learning';

import Practice from '.';

vi.mock('../../services/audio', () => ({ playAudio: vi.fn(), stopAudio: vi.fn() }));
vi.mock('../../services/sound', () => ({ FEEDBACK_SOUND_DURATION_MS: 0, playFeedbackSound: vi.fn() }));
vi.mock('../../services/speech', () => ({
  isSpeechRecognitionSupported: vi.fn(() => false),
  listen: vi.fn(),
  stopListening: vi.fn(),
}));
// By default pick the most advanced mode on offer, so a test controls the mode through the toggle and speech support.
const modePicker = vi.hoisted(() => ({
  pick: (modes: readonly AnswerMode[]): AnswerMode | undefined => modes.at(-1),
}));
vi.mock('../../helpers/practice', async (importOriginal) => {
  const practice = await importOriginal<typeof import('../../helpers/practice')>();

  return {
    ...practice,
    assignAnswerModes: (count: number, modes: readonly AnswerMode[]) =>
      Array.from({ length: count }, () => modePicker.pick(modes)),
    generatePracticeQuestions: (...args: Parameters<typeof practice.generatePracticeQuestions>) =>
      practice
        .generatePracticeQuestions(...args)
        .map((question) => ({ ...question, mode: modePicker.pick(args[1]?.modes ?? ['select']) ?? 'select' })),
  };
});

const vocabulary = getVocabulary(consonants);

const renderPractice = () =>
  render(
    <MemoryRouter>
      <Practice />
    </MemoryRouter>
  );

const getOptionButtons = () => within(screen.getByRole('list', { name: 'Answer options' })).getAllByRole('button');

const getCorrectAnswer = () => {
  const meaning = screen.getByRole('img').getAttribute('alt');
  const answer = vocabulary.find((item) => item.meaning === meaning);

  if (!answer) {
    throw new Error(`No vocabulary item found for picture "${meaning}"`);
  }
  return answer;
};

const getCorrectOption = () => {
  const label = getLetterWithWord(getCorrectAnswer());
  return getOptionButtons().find((button) => button.textContent?.startsWith(label)) as HTMLElement;
};

const getIncorrectOption = () => {
  const label = getLetterWithWord(getCorrectAnswer());
  return getOptionButtons().find((button) => !button.textContent?.startsWith(label)) as HTMLElement;
};

const answerQuestion = async (option: HTMLElement) => {
  await userEvent.click(option);
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
};

const turnOnAdvanced = () => userEvent.click(screen.getByRole('switch', { name: 'Advanced' }));

const openQuestionTypes = () => userEvent.click(screen.getByRole('button', { name: 'Question types' }));

describe('Practice', () => {
  it('shows the first question with three answer options and a disabled Next button', () => {
    renderPractice();

    expect(screen.getByRole('heading', { name: 'Which word is this?' })).toBeInTheDocument();
    expect(getOptionButtons()).toHaveLength(3);
    expect(getCorrectOption()).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Practice progress' })).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  describe('given the user selects an answer', () => {
    it('highlights it, plays its Thai audio and enables Next without evaluating yet', async () => {
      renderPractice();
      const option = getIncorrectOption();

      await userEvent.click(option);

      expect(option).toHaveAttribute('aria-pressed', 'true');
      expect(playAudio).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
      expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });
  });

  describe('given the user changes their answer before pressing Next', () => {
    it('makes the new answer active and plays its audio', async () => {
      renderPractice();
      const firstChoice = getIncorrectOption();
      const secondChoice = getCorrectOption();

      await userEvent.click(firstChoice);
      await userEvent.click(secondChoice);

      expect(firstChoice).toHaveAttribute('aria-pressed', 'false');
      expect(secondChoice).toHaveAttribute('aria-pressed', 'true');
      expect(playAudio).toHaveBeenLastCalledWith(getCorrectAnswer().audio);
    });
  });

  describe('given the selected answer is correct', () => {
    it('shows positive feedback with a chime after pressing Next', async () => {
      renderPractice();

      await answerQuestion(getCorrectOption());

      expect(screen.getByRole('status')).toHaveTextContent('Correct.');
      expect(playFeedbackSound).toHaveBeenCalledExactlyOnceWith('correct');
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
      getOptionButtons().forEach((button) => expect(button).toBeDisabled());
    });
  });

  describe('given the selected answer is incorrect', () => {
    it('shows the correct answer with a low tone after pressing Next', async () => {
      renderPractice();
      const correctWord = getLetterWithWord(getCorrectAnswer());

      await answerQuestion(getIncorrectOption());

      expect(screen.getByRole('status')).toHaveTextContent('Incorrect.');
      expect(screen.getByRole('status')).toHaveTextContent(correctWord);
      expect(playFeedbackSound).toHaveBeenCalledExactlyOnceWith('incorrect');
    });
  });

  it('moves to the next question after feedback', async () => {
    renderPractice();
    const firstPicture = screen.getByRole('img').getAttribute('alt');

    await answerQuestion(getCorrectOption());
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('img').getAttribute('alt')).not.toBe(firstPicture);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('reaches the summary with the score after the last question and can restart', async () => {
    renderPractice();

    for (let index = 0; index < QUESTION_COUNT; index += 1) {
      await answerQuestion(index % 2 === 0 ? getCorrectOption() : getIncorrectOption());
      const isLast = index === QUESTION_COUNT - 1;
      await userEvent.click(screen.getByRole('button', { name: isLast ? 'See results' : 'Continue' }));
    }

    expect(screen.getByRole('heading', { name: 'Practice complete!' })).toBeInTheDocument();
    expect(screen.getByText(`${QUESTION_COUNT / 2} / ${QUESTION_COUNT}`)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Practice again' }));

    expect(screen.getByRole('heading', { name: 'Which word is this?' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  describe('given advanced practice is off', () => {
    it('only asks the learner to select answers', () => {
      renderPractice();

      expect(screen.getByRole('switch', { name: 'Advanced' })).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByRole('heading', { name: 'Which word is this?' })).toBeInTheDocument();
    });
  });

  describe('given advanced practice is turned on', () => {
    it('asks the learner to type the Thai letter', async () => {
      renderPractice();

      await turnOnAdvanced();

      expect(screen.getByRole('switch', { name: 'Advanced' })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('heading', { name: 'Type the Thai letter' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Your answer in Thai' })).toBeInTheDocument();
      expect(screen.queryByRole('list', { name: 'Answer options' })).not.toBeInTheDocument();
    });

    describe('given the correct letter is typed and Enter is pressed', () => {
      it('scores the answer, chimes and then plays the word', async () => {
        renderPractice();
        await turnOnAdvanced();

        await userEvent.type(screen.getByRole('textbox'), `${getCorrectAnswer().consonant}{Enter}`);

        expect(screen.getByRole('status')).toHaveTextContent('Correct.');
        expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
        expect(playFeedbackSound).toHaveBeenCalledWith('correct');
        await waitFor(() => expect(playAudio).toHaveBeenCalledWith(getCorrectAnswer().audio));
      });

      describe('given Enter is pressed again', () => {
        it('moves to the next question', async () => {
          renderPractice();
          await turnOnAdvanced();

          await userEvent.type(screen.getByRole('textbox'), `${getCorrectAnswer().consonant}{Enter}`);
          await userEvent.keyboard('{Enter}');

          expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
          expect(screen.getByRole('textbox')).toHaveValue('');
        });
      });
    });

    describe('given a wrong answer is typed', () => {
      it('shows the correct answer after pressing Next', async () => {
        renderPractice();
        await turnOnAdvanced();
        const correctWord = getLetterWithWord(getCorrectAnswer());

        await userEvent.type(screen.getByRole('textbox'), 'ฮฮ');
        await userEvent.click(screen.getByRole('button', { name: 'Next' }));

        expect(screen.getByRole('status')).toHaveTextContent('Incorrect.');
        expect(screen.getByText(/Correct answer/)).toHaveTextContent(correctWord);
      });
    });

    it('offers audio, type and group, all ticked', async () => {
      renderPractice();

      expect(screen.queryByRole('button', { name: 'Question types' })).not.toBeInTheDocument();

      await turnOnAdvanced();
      await openQuestionTypes();

      expect(screen.getByRole('checkbox', { name: 'Audio' })).toBeDisabled();
      expect(screen.getByRole('checkbox', { name: 'Type' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Group' })).toBeChecked();
    });

    describe('given a question type is unticked', () => {
      it('leaves it out and starts the practice again', async () => {
        renderPractice();
        await turnOnAdvanced();
        await userEvent.type(screen.getByRole('textbox'), `${getCorrectAnswer().consonant}{Enter}`);
        await openQuestionTypes();

        await userEvent.click(screen.getByRole('checkbox', { name: 'Type' }));

        expect(screen.getByRole('heading', { name: 'Which group is this letter in?' })).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
        expect(screen.getByRole('checkbox', { name: 'Type' })).not.toBeChecked();
      });
    });

    describe('given a question was already answered', () => {
      it('starts the practice again', async () => {
        renderPractice();
        await answerQuestion(getCorrectOption());

        await turnOnAdvanced();

        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
        expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
        expect(screen.getByRole('status')).toBeEmptyDOMElement();
      });
    });

    describe('given it is turned off again', () => {
      it('goes back to selecting answers', async () => {
        renderPractice();
        await turnOnAdvanced();

        await turnOnAdvanced();

        expect(screen.getByRole('heading', { name: 'Which word is this?' })).toBeInTheDocument();
        expect(getOptionButtons()).toHaveLength(3);
      });
    });
  });

  describe('given the browser supports speech recognition', () => {
    beforeEach(() => {
      vi.mocked(isSpeechRecognitionSupported).mockReturnValue(true);
    });

    afterEach(() => {
      vi.mocked(isSpeechRecognitionSupported).mockReturnValue(false);
    });

    it('asks the learner to say the word once advanced practice is on', async () => {
      renderPractice();

      await turnOnAdvanced();
      await openQuestionTypes();

      expect(screen.getByRole('checkbox', { name: 'Audio' })).toBeEnabled();
      expect(screen.getByRole('heading', { name: 'Say this word' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    describe('given the learner says the word', () => {
      it('shows what was heard and scores it after pressing Next', async () => {
        renderPractice();
        await turnOnAdvanced();
        const { thai } = getCorrectAnswer();
        vi.mocked(listen).mockResolvedValue({ status: 'heard', transcripts: ['สวัสดี', thai] });

        await userEvent.click(screen.getByRole('button', { name: 'Speak your answer' }));
        await userEvent.click(screen.getByRole('button', { name: 'Next' }));

        expect(listen).toHaveBeenCalledWith('th-TH');
        expect(screen.getByText(/You said/)).toHaveTextContent(thai);
        expect(screen.getByRole('status')).toHaveTextContent('Correct.');
      });
    });

    describe('given the microphone is blocked', () => {
      it('explains it and lets the learner skip speaking for the rest of the session', async () => {
        vi.mocked(listen).mockResolvedValue({ status: 'blocked' });
        renderPractice();
        await turnOnAdvanced();

        await userEvent.click(screen.getByRole('button', { name: 'Speak your answer' }));

        expect(screen.getByText(/Microphone access is blocked/)).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: "Can't speak now" }));

        expect(screen.getByRole('heading', { name: 'Type the Thai letter' })).toBeInTheDocument();

        await openQuestionTypes();

        expect(screen.getByRole('checkbox', { name: 'Audio' })).not.toBeChecked();
      });
    });
  });

  describe('given advanced practice asks for the group', () => {
    beforeEach(() => {
      modePicker.pick = (modes) => (modes.includes('class') ? 'class' : 'select');
    });

    afterEach(() => {
      modePicker.pick = (modes) => modes.at(-1);
    });

    it('shows the letter with its word and offers groups 1, 2 and 3', async () => {
      renderPractice();

      await turnOnAdvanced();

      expect(screen.getByRole('heading', { name: 'Which group is this letter in?' })).toBeInTheDocument();
      expect(screen.getByText(getLetterWithWord(getCorrectAnswer()))).toHaveAttribute('lang', 'th');
      expect(
        within(screen.getByRole('list', { name: 'Groups' }))
          .getAllByRole('button')
          .map((button) => button.textContent?.trim())
      ).toEqual(['1 Middle', '2 High', '3 Low']);
    });

    describe('given the correct group is chosen', () => {
      it('scores it with a chime', async () => {
        renderPractice();
        await turnOnAdvanced();
        const correctGroup = { middle: '1 Middle', high: '2 High', low: '3 Low' }[getCorrectAnswer().consonantClass];

        await userEvent.click(screen.getByRole('button', { name: correctGroup }));
        await userEvent.click(screen.getByRole('button', { name: 'Next' }));

        expect(screen.getByRole('status')).toHaveTextContent('Correct.');
        expect(playFeedbackSound).toHaveBeenCalledWith('correct');
      });
    });

    describe('given a wrong group is chosen', () => {
      it('announces and marks the correct group', async () => {
        renderPractice();
        await turnOnAdvanced();
        const { consonantClass } = getCorrectAnswer();
        const wrongGroup = consonantClass === 'middle' ? '2 High' : '1 Middle';
        const correctGroup = { middle: '1 Middle', high: '2 High', low: '3 Low' }[consonantClass];

        await userEvent.click(screen.getByRole('button', { name: wrongGroup }));
        await userEvent.click(screen.getByRole('button', { name: 'Next' }));

        expect(screen.getByRole('status')).toHaveTextContent(
          `Incorrect. The answer is group ${correctGroup.replace(' ', ', ')}.`
        );
        expect(screen.getByRole('button', { name: new RegExp(correctGroup) })).toHaveAttribute('data-status', 'correct');
      });
    });
  });
});
