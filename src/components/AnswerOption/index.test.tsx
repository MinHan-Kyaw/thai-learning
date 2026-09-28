import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnswerOption from '.';

describe('AnswerOption', () => {
  it('renders the Thai word and its Burmese pronunciation', () => {
    render(<AnswerOption thai="ไก่" pronunciation="ကောကိုင်" selected={false} onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'ไก่ ကောကိုင်' })).toBeInTheDocument();
  });

  it('calls onSelect when chosen with the mouse', async () => {
    const onSelect = vi.fn();
    render(<AnswerOption thai="ไก่" pronunciation="ကောကိုင်" selected={false} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('can be chosen with the keyboard', async () => {
    const onSelect = vi.fn();
    render(<AnswerOption thai="ไก่" pronunciation="ကောကိုင်" selected={false} onSelect={onSelect} />);

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(screen.getByRole('button')).toHaveFocus();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  describe('given it is selected', () => {
    it('is exposed as pressed and highlighted', () => {
      render(<AnswerOption thai="ไก่" pronunciation="ကောကိုင်" selected onSelect={vi.fn()} />);

      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button')).toHaveAttribute('data-status', 'selected');
    });
  });

  describe('given it is the correct answer after evaluation', () => {
    it('shows a tick icon with a screen-reader label in addition to the colour', () => {
      render(<AnswerOption thai="ไก่" pronunciation="ကောကိုင်" selected result="correct" disabled onSelect={vi.fn()} />);

      expect(screen.getByRole('button')).toHaveAttribute('data-status', 'correct');
      expect(screen.getByText('Correct')).toHaveClass('sr-only');
      expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('given it is an incorrect selected answer after evaluation', () => {
    it('shows a cross icon with a screen-reader label in addition to the colour', () => {
      render(<AnswerOption thai="ปลา" pronunciation="ပေါပလား" selected result="incorrect" disabled onSelect={vi.fn()} />);

      expect(screen.getByRole('button')).toHaveAttribute('data-status', 'incorrect');
      expect(screen.getByText('Incorrect')).toHaveClass('sr-only');
      expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('given it is disabled', () => {
    it('does not call onSelect', async () => {
      const onSelect = vi.fn();
      render(<AnswerOption thai="ไก่" pronunciation="ကောကိုင်" selected={false} disabled onSelect={onSelect} />);

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByRole('button')).toBeDisabled();
      expect(onSelect).not.toHaveBeenCalled();
    });
  });
});
