import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { buildVocabularyItem } from '../../tests/fixtures';

import PracticeFeedback from '.';

describe('PracticeFeedback', () => {
  describe('given the answer has not been evaluated', () => {
    it('shows no result message', () => {
      render(<PracticeFeedback result={null} correctAnswer={buildVocabularyItem()} actionLabel="Next" onAction={vi.fn()} />);

      expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });

    it('disables the action while no answer is selected', () => {
      render(
        <PracticeFeedback
          result={null}
          correctAnswer={buildVocabularyItem()}
          actionLabel="Next"
          actionDisabled
          onAction={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });
  });

  describe('given the answer is correct', () => {
    it('announces success to screen readers only', () => {
      render(
        <PracticeFeedback result="correct" correctAnswer={buildVocabularyItem()} actionLabel="Continue" onAction={vi.fn()} />
      );

      expect(screen.getByRole('status')).toHaveTextContent('Correct.');
      expect(screen.getByRole('status')).toHaveClass('sr-only');
    });
  });

  describe('given the answer is incorrect', () => {
    it('announces the correct answer to screen readers only', () => {
      render(
        <PracticeFeedback result="incorrect" correctAnswer={buildVocabularyItem()} actionLabel="Continue" onAction={vi.fn()} />
      );

      expect(screen.getByRole('status')).toHaveTextContent('Incorrect. The answer is ก (ไก่).');
      expect(screen.getByRole('status')).toHaveClass('sr-only');
    });
  });

  describe('given a wrong group was chosen', () => {
    it('announces the correct group', () => {
      render(
        <PracticeFeedback
          result="incorrect"
          correctAnswer={buildVocabularyItem()}
          correctClass={{
            id: 'middle',
            group: 1,
            name: 'Middle Class',
            shortName: 'Middle',
            burmeseName: 'အလယ်',
            tone: 'Mid tone',
            exampleConsonant: 'ก',
            exampleSound: 'k',
          }}
          actionLabel="Continue"
          onAction={vi.fn()}
        />
      );

      expect(screen.getByRole('status')).toHaveTextContent('Incorrect. The answer is group 1, Middle.');
    });
  });

  it('calls onAction when the action button is pressed', async () => {
    const onAction = vi.fn();
    render(
      <PracticeFeedback result="correct" correctAnswer={buildVocabularyItem()} actionLabel="Continue" onAction={onAction} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
