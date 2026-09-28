import { render, screen } from '@testing-library/react';

import ResultIcon from '.';

describe('ResultIcon', () => {
  describe('given a correct result', () => {
    it('shows an icon with a screen-reader label', () => {
      const { container } = render(<ResultIcon result="correct" />);

      expect(screen.getByText('Correct')).toHaveClass('sr-only');
      expect(container.firstElementChild).toHaveAttribute('data-status', 'correct');
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('given an incorrect result', () => {
    it('shows an icon with a screen-reader label', () => {
      const { container } = render(<ResultIcon result="incorrect" />);

      expect(screen.getByText('Incorrect')).toHaveClass('sr-only');
      expect(container.firstElementChild).toHaveAttribute('data-status', 'incorrect');
    });
  });
});
