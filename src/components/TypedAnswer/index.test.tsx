import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { buildVocabularyItem } from '../../tests/fixtures';
import type { AnswerResult } from '../ResultIcon';

import TypedAnswer from '.';

const renderTypedAnswer = (overrides: Partial<{ value: string; answered: boolean; result: AnswerResult | null }> = {}) => {
  const onChange = vi.fn();
  const onSubmit = vi.fn();
  render(
    <TypedAnswer
      value=""
      answered={false}
      result={null}
      correctAnswer={buildVocabularyItem()}
      onChange={onChange}
      onSubmit={onSubmit}
      {...overrides}
    />
  );
  return { onChange, onSubmit };
};

describe('TypedAnswer', () => {
  it('reports each change to the Thai answer field', async () => {
    const { onChange } = renderTypedAnswer();

    await userEvent.type(screen.getByRole('textbox', { name: 'Your answer in Thai' }), 'ก');

    expect(screen.getByRole('textbox')).toHaveAttribute('lang', 'th');
    expect(onChange).toHaveBeenCalledWith('ก');
  });

  describe('given Enter is pressed', () => {
    it('submits the answer', async () => {
      const { onSubmit } = renderTypedAnswer({ value: 'ไก่' });

      await userEvent.type(screen.getByRole('textbox'), '{Enter}');

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('given a correct answer has been evaluated', () => {
    it('locks the field and marks it correct', () => {
      renderTypedAnswer({ value: 'ไก่', answered: true, result: 'correct' });

      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
      expect(screen.getByRole('textbox')).toHaveAttribute('data-status', 'correct');
      expect(screen.getByText('Correct')).toHaveClass('sr-only');
      expect(screen.queryByText(/Correct answer/)).not.toBeInTheDocument();
    });

    it('keeps focus in the field so Enter continues', async () => {
      const { onChange, onSubmit } = renderTypedAnswer({ value: 'ไก่', answered: true, result: 'correct' });

      await userEvent.type(screen.getByRole('textbox'), 'x{Enter}');

      expect(onChange).not.toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('given an incorrect answer has been evaluated', () => {
    it('marks it incorrect and shows the correct answer', () => {
      renderTypedAnswer({ value: 'ปลา', answered: true, result: 'incorrect' });

      expect(screen.getByRole('textbox')).toHaveAttribute('data-status', 'incorrect');
      expect(screen.getByText(/Correct answer/)).toHaveTextContent('Correct answer: ก (ไก่)');
    });
  });
});
