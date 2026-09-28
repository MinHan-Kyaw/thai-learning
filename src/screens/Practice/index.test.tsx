import { MemoryRouter } from 'react-router';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QUESTION_COUNT } from '../../constants/practice';
import { consonants } from '../../data';
import { getVocabulary, getLetterWithWord } from '../../helpers/vocabulary';
import { playAudio } from '../../services/audio';
import { isSpeechRecognitionSupported, listen } from '../../services/speech';
import type { AnswerMode } from '../../types/learning';

import Practice from '.';

vi.mock('../../services/audio', () => ({ playAudio: vi.fn(), stopAudio: vi.fn() }));
vi.mock('../../services/speech', () => ({
  isSpeechRecognitionSupported: vi.fn(() => false),
  listen: vi.fn(),
  stopListening: vi.fn(),
}));
// Always pick the most advanced mode on offer, so a test controls the mode through the toggle and speech support.
vi.mock('../../helpers/practice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../helpers/practice')>()),
  assignAnswerModes: (count: number, modes: readonly AnswerMode[]) => Array.from({ length: count }, () => modes.at(-1)),
}));

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
    it('shows positive feedback after pressing Next', async () => {
      renderPractice();

      await answerQuestion(getCorrectOption());

      expect(screen.getByRole('status')).toHaveTextContent('Correct.');
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
      getOptionButtons().forEach((button) => expect(button).toBeDisabled());
    });
  });

  describe('given the selected answer is incorrect', () => {
    it('shows the correct answer after pressing Next', async () => {
      renderPractice();
      const correctWord = getLetterWithWord(getCorrectAnswer());

      await answerQuestion(getIncorrectOption());

      expect(screen.getByRole('status')).toHaveTextContent('Incorrect.');
      expect(screen.getByRole('status')).toHaveTextContent(correctWord);
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
      it('scores the answer and plays the word', async () => {
        renderPractice();
        await turnOnAdvanced();

        await userEvent.type(screen.getByRole('textbox'), `${getCorrectAnswer().consonant}{Enter}`);

        expect(screen.getByRole('status')).toHaveTextContent('Correct.');
        expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
        expect(playAudio).toHaveBeenCalledWith(getCorrectAnswer().audio);
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

      expect(screen.getByRole('switch', { name: 'Advanced' })).toHaveAccessibleDescription('Also type and speak your answers');
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
        expect(screen.getByRole('switch', { name: 'Advanced' })).toHaveAccessibleDescription('Also type your answers');
      });
    });
  });
});
