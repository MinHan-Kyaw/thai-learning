import { render, screen } from '@testing-library/react';

import ProgressBar from '.';

describe('ProgressBar', () => {
  it('exposes the progress to assistive technology', () => {
    render(<ProgressBar current={3} total={10} label="Practice progress" />);

    const progressbar = screen.getByRole('progressbar', { name: 'Practice progress' });

    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    expect(progressbar).toHaveAttribute('aria-valuemax', '10');
  });

  it('fills the bar proportionally', () => {
    render(<ProgressBar current={3} total={10} label="Practice progress" />);

    expect(screen.getByRole('progressbar').firstChild).toHaveStyle({ width: '30%' });
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  describe('given there are no questions', () => {
    it('renders an empty bar', () => {
      render(<ProgressBar current={0} total={0} label="Practice progress" />);

      expect(screen.getByRole('progressbar').firstChild).toHaveStyle({ width: '0%' });
    });
  });
});
