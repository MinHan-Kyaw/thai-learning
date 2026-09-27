import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { buildQuestion } from '../../tests/fixtures';

import PracticeQuestion from '.';

describe('PracticeQuestion', () => {
  it('renders the picture, prompt and exactly three answer options', () => {
    render(<PracticeQuestion question={buildQuestion()} selectedAnswerId={null} answered={false} onSelectAnswer={vi.fn()} />);

    expect(screen.getByRole('img', { name: 'ကြက်' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Which word is this?' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /ก \(ไก่\)/ })).toHaveTextContent('ကောကိုင်');
  });

  it('calls onSelectAnswer with the chosen option', async () => {
    const onSelectAnswer = vi.fn();
    const question = buildQuestion();
    render(<PracticeQuestion question={question} selectedAnswerId={null} answered={false} onSelectAnswer={onSelectAnswer} />);

    await userEvent.click(screen.getByRole('button', { name: /จ \(จาน\)/ }));

    expect(onSelectAnswer).toHaveBeenCalledWith(question.options[1]);
  });

  describe('given an answer is selected but not yet evaluated', () => {
    it('highlights the selection without revealing the result', () => {
      render(<PracticeQuestion question={buildQuestion()} selectedAnswerId="จ-จาน" answered={false} onSelectAnswer={vi.fn()} />);

      expect(screen.getByRole('button', { name: /จ \(จาน\)/ })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.queryByText('Correct')).not.toBeInTheDocument();
      expect(screen.queryByText('Incorrect')).not.toBeInTheDocument();
    });
  });

  describe('given an incorrect answer has been evaluated', () => {
    it('marks the selected answer as incorrect, reveals the correct one and disables the options', () => {
      render(<PracticeQuestion question={buildQuestion()} selectedAnswerId="จ-จาน" answered onSelectAnswer={vi.fn()} />);

      expect(screen.getByRole('button', { name: /จ \(จาน\)/ })).toHaveTextContent('Incorrect');
      expect(screen.getByRole('button', { name: /ก \(ไก่\)/ })).toHaveTextContent('Correct');
      screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
    });
  });

  describe('given the question changes', () => {
    it('moves focus to the prompt for keyboard and screen reader users', () => {
      const { rerender } = render(
        <PracticeQuestion question={buildQuestion(0)} selectedAnswerId={null} answered={false} onSelectAnswer={vi.fn()} />
      );

      rerender(
        <PracticeQuestion question={buildQuestion(1)} selectedAnswerId={null} answered={false} onSelectAnswer={vi.fn()} />
      );

      expect(screen.getByRole('heading', { name: 'Which word is this?' })).toHaveFocus();
    });
  });
});
