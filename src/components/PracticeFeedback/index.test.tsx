import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PracticeFeedback from '.';

describe('PracticeFeedback', () => {
  describe('given the answer has not been evaluated', () => {
    it('shows no result message', () => {
      render(
        <PracticeFeedback result={null} correctAnswer={<span lang="th">ก (ไก่)</span>} actionLabel="Next" onAction={vi.fn()} />
      );

      expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });

    it('disables the action while no answer is selected', () => {
      render(
        <PracticeFeedback
          result={null}
          correctAnswer={<span lang="th">ก (ไก่)</span>}
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
        <PracticeFeedback
          result="correct"
          correctAnswer={<span lang="th">ก (ไก่)</span>}
          actionLabel="Continue"
          onAction={vi.fn()}
        />
      );

      expect(screen.getByRole('status')).toHaveTextContent('Correct.');
      expect(screen.getByRole('status')).toHaveClass('sr-only');
    });
  });

  describe('given the answer is incorrect', () => {
    it('announces the correct answer to screen readers only', () => {
      render(
        <PracticeFeedback
          result="incorrect"
          correctAnswer={<span lang="th">ก (ไก่)</span>}
          actionLabel="Continue"
          onAction={vi.fn()}
        />
      );

      expect(screen.getByRole('status')).toHaveTextContent('Incorrect. The answer is ก (ไก่).');
      expect(screen.getByRole('status')).toHaveClass('sr-only');
    });
  });

  it('calls onAction when the action button is pressed', async () => {
    const onAction = vi.fn();
    render(
      <PracticeFeedback
        result="correct"
        correctAnswer={<span lang="th">ก (ไก่)</span>}
        actionLabel="Continue"
        onAction={onAction}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
