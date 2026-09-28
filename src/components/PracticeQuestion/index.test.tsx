import { render, screen } from '@testing-library/react';

import { buildQuestion } from '../../tests/fixtures';

import PracticeQuestion from '.';

describe('PracticeQuestion', () => {
  it('renders the picture, the prompt and the answer area', () => {
    render(
      <PracticeQuestion question={buildQuestion()}>
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
        <PracticeQuestion question={buildQuestion(0, 'type')}>
          <p>Answer area</p>
        </PracticeQuestion>
      );

      expect(screen.getByRole('heading', { name: 'Type the Thai letter' })).toBeInTheDocument();
      expect(screen.getByText('ကောကိုင်')).toHaveAttribute('lang', 'my');
      expect(screen.queryByText(/ไก่/)).not.toBeInTheDocument();
    });
  });

  describe('given a speaking question', () => {
    it('shows only the picture so the learner recalls the word', () => {
      render(
        <PracticeQuestion question={buildQuestion(0, 'speak')}>
          <p>Answer area</p>
        </PracticeQuestion>
      );

      expect(screen.getByRole('heading', { name: 'Say this word' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'ကြက်' })).toBeInTheDocument();
      expect(screen.queryByText(/ไก่/)).not.toBeInTheDocument();
      expect(screen.queryByText('ကောကိုင်')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('given the question changes', () => {
    it('moves focus to the prompt for keyboard and screen reader users', () => {
      const { rerender } = render(
        <PracticeQuestion question={buildQuestion(0)}>
          <p>Answer area</p>
        </PracticeQuestion>
      );

      rerender(
        <PracticeQuestion question={buildQuestion(1)}>
          <p>Answer area</p>
        </PracticeQuestion>
      );

      expect(screen.getByRole('heading', { name: 'Which word is this?' })).toHaveFocus();
    });
  });
});
