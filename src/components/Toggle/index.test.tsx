import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Toggle from '.';

describe('Toggle', () => {
  it('is a labelled, described switch', () => {
    render(<Toggle label="Advanced" description="Type and speak answers" checked={false} onChange={vi.fn()} />);

    const toggle = screen.getByRole('switch', { name: 'Advanced' });

    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toHaveAccessibleDescription('Type and speak answers');
  });

  describe('given it is off', () => {
    it('asks to turn on when pressed', async () => {
      const onChange = vi.fn();
      render(<Toggle label="Advanced" checked={false} onChange={onChange} />);

      await userEvent.click(screen.getByRole('switch', { name: 'Advanced' }));

      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('given it is on', () => {
    it('asks to turn off when toggled with the keyboard', async () => {
      const onChange = vi.fn();
      render(<Toggle label="Advanced" checked onChange={onChange} />);

      await userEvent.tab();
      await userEvent.keyboard(' ');

      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });
});
