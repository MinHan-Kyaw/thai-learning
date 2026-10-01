import { MemoryRouter } from 'react-router';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Vowels from '.';

const renderVowels = (route = '/vowels') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Vowels />
    </MemoryRouter>
  );

const rowCount = () => within(screen.getByRole('table')).getAllByRole('row').length - 1;

describe('Vowels', () => {
  it('hides the page heading visually', () => {
    renderVowels();

    expect(screen.getByRole('heading', { level: 1, name: 'Thai Vowels' })).toHaveClass('sr-only');
  });

  it('shows the vowel group tabs with 12 / 12 / 4 / 4 vowels', () => {
    renderVowels();

    const tabs = within(screen.getByRole('list', { name: 'Vowel group' })).getAllByRole('button');

    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'သရတို 12 vowels',
      'သရရှည် 12 vowels',
      'အပိုသရ 4 vowels',
      'သီးသန့်သရ 4 vowels',
    ]);
  });

  describe('given no group is chosen', () => {
    it('shows the short vowels', () => {
      renderVowels();

      expect(screen.getByRole('button', { name: /သရတို/ })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('heading', { name: 'သရတို Short vowels' })).toBeInTheDocument();
      expect(rowCount()).toBe(12);
    });
  });

  describe('given a group in the URL', () => {
    it('shows that group', () => {
      renderVowels('/vowels?group=extra');

      expect(screen.getByRole('heading', { name: 'အပိုသရ Extra vowels' })).toBeInTheDocument();
      expect(rowCount()).toBe(4);
    });
  });

  it('switches group with the tabs', async () => {
    renderVowels();

    await userEvent.click(screen.getByRole('button', { name: /သရရှည်/ }));

    expect(screen.getByRole('heading', { name: 'သရရှည် Long vowels' })).toBeInTheDocument();
    expect(rowCount()).toBe(12);
  });

  it('shows each vowel with ก / ข / ค examples', () => {
    renderVowels();

    const cells = within(screen.getByRole('row', { name: /^-ะ/ })).getAllByRole('cell');

    expect(cells.map((cell) => cell.textContent)).toEqual(['กะ ka', 'ขะ kha', 'คะ kha']);
  });

  it('explains the group and lists its tone rule for each consonant group', () => {
    renderVowels();

    const rules = within(screen.getByRole('list', { name: 'Short vowels tone rules' })).getAllByRole('listitem');

    expect(screen.getByText(/သရတိုသည် အသံသေ/)).toHaveAttribute('lang', 'my');
    expect(rules).toHaveLength(3);
    expect(rules[2]).toHaveTextContent('Group 3 (Low Consonants) ကို Short vowel နဲ့တွဲရင် High Tone');
  });

  describe('given the standalone vowels', () => {
    it('lists them as cards without examples or tone rules', () => {
      renderVowels('/vowels?group=standalone');

      expect(within(screen.getByRole('list', { name: /Standalone vowels/ })).getAllByRole('article')).toHaveLength(4);
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('list', { name: 'Standalone vowels tone rules' })).not.toBeInTheDocument();
    });
  });
});
