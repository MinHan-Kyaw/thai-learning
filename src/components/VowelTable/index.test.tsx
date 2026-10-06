import { render, screen, within } from '@testing-library/react';

import type { ConsonantClass, Vowel } from '../../types/learning';

import VowelTable from '.';

const consonantClasses: ConsonantClass[] = [
  {
    id: 'middle',
    group: 1,
    name: 'Middle Class',
    shortName: 'Middle',
    burmeseName: 'အလယ်သံဗျည်းအုပ်စု',
    tone: 'Mid tone',
    exampleConsonant: 'ก',
    exampleSound: 'k',
  },
  {
    id: 'high',
    group: 2,
    name: 'High Class',
    shortName: 'High',
    burmeseName: 'အမြင့်သံဗျည်းအုပ်စု',
    tone: 'Rising tone',
    exampleConsonant: 'ข',
    exampleSound: 'kh',
  },
];

const vowels: Vowel[] = [
  { id: '-ะ', group: 'short', sound: 'a', pronunciation: 'အ' },
  { id: '-ิ', group: 'short', sound: 'i', pronunciation: 'အိ' },
];

const renderTable = (tones?: string[]) =>
  render(
    <>
      <h2 id="title">Short vowels</h2>
      <VowelTable vowels={vowels} consonantClasses={consonantClasses} tones={tones} labelledBy="title" />
    </>
  );

describe('VowelTable', () => {
  it('names the table after its heading and has one row per vowel', () => {
    renderTable();

    const table = screen.getByRole('table', { name: 'Short vowels' });

    expect(within(table).getAllByRole('row')).toHaveLength(vowels.length + 1);
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Vowel', 'Middle ก', 'High ข']);
  });

  it('shows each vowel with its English sound and Burmese pronunciation', () => {
    renderTable();

    const rowHeader = screen.getByRole('rowheader', { name: /^-ะ/ });

    expect(rowHeader).toHaveTextContent('-ะ a အ');
    expect(within(rowHeader).getByText('အ')).toHaveAttribute('lang', 'my');
    expect(within(rowHeader).getByText('-ะ')).toHaveAttribute('lang', 'th');
  });

  it('combines the vowel with each class example and its romanization', () => {
    renderTable();

    const cells = within(screen.getByRole('row', { name: /^-ะ/ })).getAllByRole('cell');

    expect(cells.map((cell) => cell.textContent)).toEqual(['กะ ka', 'ขะ kha']);
  });

  it('shows a mark above the consonant on a dotted circle', () => {
    renderTable();

    expect(screen.getByRole('rowheader', { name: /^◌ิ/ })).toBeInTheDocument();
  });

  describe('given tones', () => {
    it('shows the tone under each class', () => {
      renderTable(['Low', 'High']);

      const cells = within(screen.getByRole('row', { name: /^Tone/ })).getAllByRole('cell');

      expect(cells.map((cell) => cell.textContent)).toEqual(['Low', 'High']);
    });
  });

  describe('given no tones', () => {
    it('leaves out the tone row', () => {
      renderTable();

      expect(screen.queryByRole('row', { name: /^Tone/ })).not.toBeInTheDocument();
    });
  });
});
