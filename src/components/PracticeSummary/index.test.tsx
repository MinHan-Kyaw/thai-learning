import { MemoryRouter } from 'react-router';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PracticeSummary from '.';

const renderSummary = (score: number, total: number, onRestart = vi.fn()) =>
  render(
    <MemoryRouter>
      <PracticeSummary score={score} total={total} onRestart={onRestart} />
    </MemoryRouter>
  );

describe('PracticeSummary', () => {
  it('shows the final score and focuses the heading', () => {
    renderSummary(7, 10);

    expect(screen.getByRole('heading', { name: 'Practice complete!' })).toHaveFocus();
    expect(screen.getByText('7 / 10')).toBeInTheDocument();
    expect(screen.getByText('Great work! You are getting the hang of it.')).toBeInTheDocument();
  });

  describe('given every answer was correct', () => {
    it('shows a perfect score message', () => {
      renderSummary(10, 10);

      expect(screen.getByText('Perfect score! Every answer was right.')).toBeInTheDocument();
    });
  });

  describe('given most answers were wrong', () => {
    it('shows an encouraging message', () => {
      renderSummary(1, 10);

      expect(screen.getByText('Keep going! Practice makes progress.')).toBeInTheDocument();
    });
  });

  it('restarts the practice', async () => {
    const onRestart = vi.fn();
    renderSummary(5, 10, onRestart);

    await userEvent.click(screen.getByRole('button', { name: 'Practice again' }));

    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('links to the consonants screen', () => {
    renderSummary(5, 10);

    expect(screen.getByRole('link', { name: 'Explore consonants' })).toHaveAttribute('href', '/consonants');
  });

  describe('given an explore link', () => {
    it('links there instead', () => {
      render(
        <MemoryRouter>
          <PracticeSummary score={5} total={10} onRestart={vi.fn()} explore={{ to: '/vowels', label: 'Explore vowels' }} />
        </MemoryRouter>
      );

      expect(screen.getByRole('link', { name: 'Explore vowels' })).toHaveAttribute('href', '/vowels');
    });
  });
});
