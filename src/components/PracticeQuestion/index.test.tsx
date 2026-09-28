import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { buildQuestion } from '../../tests/fixtures';

import PracticeQuestion from '.';

describe('PracticeQuestion', () => {
  it('renders the picture, the prompt and the answer area', () => {
    render(
      <PracticeQuestion question={buildQuestion()} onPlayAudio={vi.fn()}>
        <p>Answer area</p>
      </PracticeQuestion>
    );

    expect(screen.getByRole('img', { name: 'ကြက်' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Which word is this?' })).toBeInTheDocument();
    expect(screen.getByText('Answer area')).toBeInTheDocument();
  });

  describe('given a typing question', () => {
    it('asks for the Thai letter and hints the Burmese pronunciation without showing the Thai', () => {
      render(
        <PracticeQuestion question={buildQuestion(0, 'type')} onPlayAudio={vi.fn()}>
          <p>Answer area</p>
        </PracticeQuestion>
      );

      expect(screen.getByRole('heading', { name: 'Type the Thai letter' })).toBeInTheDocument();
      expect(screen.getByText('ကောကိုင်')).toHaveAttribute('lang', 'my');
      expect(screen.queryByText(/ไก่/)).not.toBeInTheDocument();
    });
  });

  describe('given a speaking question', () => {
    it('shows the word to say and lets the learner hear it first', async () => {
      const onPlayAudio = vi.fn();
      render(
        <PracticeQuestion question={buildQuestion(0, 'speak')} onPlayAudio={onPlayAudio}>
          <p>Answer area</p>
        </PracticeQuestion>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Play Thai audio for ก (ไก่)' }));

      expect(screen.getByRole('heading', { name: 'Say this word' })).toBeInTheDocument();
      expect(screen.getByText('ก (ไก่)')).toHaveAttribute('lang', 'th');
      expect(onPlayAudio).toHaveBeenCalledTimes(1);
    });
  });

  describe('given the question changes', () => {
    it('moves focus to the prompt for keyboard and screen reader users', () => {
      const { rerender } = render(
        <PracticeQuestion question={buildQuestion(0)} onPlayAudio={vi.fn()}>
          <p>Answer area</p>
        </PracticeQuestion>
      );

      rerender(
        <PracticeQuestion question={buildQuestion(1)} onPlayAudio={vi.fn()}>
          <p>Answer area</p>
        </PracticeQuestion>
      );

      expect(screen.getByRole('heading', { name: 'Which word is this?' })).toHaveFocus();
    });
  });
});
