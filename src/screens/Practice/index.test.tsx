import { MemoryRouter } from 'react-router';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QUESTION_COUNT } from '../../constants/practice';
import { consonants } from '../../data';
import { getVocabulary, getLetterWithWord } from '../../helpers/vocabulary';
import { playAudio } from '../../services/audio';

import Practice from '.';

vi.mock('../../services/audio', () => ({ playAudio: vi.fn(), stopAudio: vi.fn() }));

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
});
