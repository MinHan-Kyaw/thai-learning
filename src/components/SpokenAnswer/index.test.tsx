import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { buildVocabularyItem } from '../../tests/fixtures';

import SpokenAnswer, { type SpeechStatus } from '.';

const renderSpokenAnswer = (
  overrides: Partial<{ transcript: string; status: SpeechStatus; answered: boolean; result: 'correct' | 'incorrect' | null }> = {}
) => {
  const onListen = vi.fn();
  const onSkip = vi.fn();
  render(
    <SpokenAnswer
      transcript=""
      status="idle"
      answered={false}
      result={null}
      correctAnswer={buildVocabularyItem()}
      onListen={onListen}
      onSkip={onSkip}
      {...overrides}
    />
  );
  return { onListen, onSkip };
};

describe('SpokenAnswer', () => {
  it('starts listening when the microphone is pressed', async () => {
    const { onListen } = renderSpokenAnswer();

    await userEvent.click(screen.getByRole('button', { name: 'Speak your answer' }));

    expect(onListen).toHaveBeenCalledTimes(1);
  });

  it('lets the learner skip speaking', async () => {
    const { onSkip } = renderSpokenAnswer();

    await userEvent.click(screen.getByRole('button', { name: "Can't speak now" }));

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  describe('given it is listening', () => {
    it('offers to stop and says it is listening', () => {
      renderSpokenAnswer({ status: 'listening' });

      expect(screen.getByRole('button', { name: 'Stop listening' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('Listening…')).toBeInTheDocument();
    });
  });

  describe('given the microphone is blocked', () => {
    it('explains how to continue', () => {
      renderSpokenAnswer({ status: 'blocked' });

      expect(screen.getByText(/Microphone access is blocked/)).toBeInTheDocument();
    });
  });

  describe('given something was heard', () => {
    it('shows what the learner said', () => {
      renderSpokenAnswer({ transcript: 'ไก่' });

      expect(screen.getByText('ไก่')).toHaveAttribute('lang', 'th');
    });
  });

  describe('given an incorrect answer has been evaluated', () => {
    it('marks it incorrect, shows the correct answer and disables speaking', () => {
      renderSpokenAnswer({ transcript: 'ปลา', answered: true, result: 'incorrect' });

      expect(screen.getByText('Incorrect')).toHaveClass('sr-only');
      expect(screen.getByText(/Correct answer/)).toHaveTextContent('Correct answer: ก (ไก่)');
      expect(screen.getByRole('button', { name: 'Speak your answer' })).toBeDisabled();
      expect(screen.queryByRole('button', { name: "Can't speak now" })).not.toBeInTheDocument();
    });
  });

  describe('given a correct answer has been evaluated', () => {
    it('does not repeat the answer', () => {
      renderSpokenAnswer({ transcript: 'ไก่', answered: true, result: 'correct' });

      expect(screen.queryByText(/Correct answer/)).not.toBeInTheDocument();
    });
  });
});
