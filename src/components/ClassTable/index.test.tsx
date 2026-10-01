import { render, screen, within } from '@testing-library/react';

import type { ConsonantClass } from '../../types/learning';

import ClassTable from '.';

const consonantClasses: ConsonantClass[] = [
  {
    id: 'middle',
    group: 1,
    name: 'Middle Class',
    shortName: 'Middle',
    burmeseName: 'အလယ်သံဗျည်းအုပ်စု',
    tone: 'Mid Tone',
    exampleConsonant: 'ก',
    exampleSound: 'k',
  },
  {
    id: 'high',
    group: 2,
    name: 'High Class',
    shortName: 'High',
    burmeseName: 'အမြင့်သံဗျည်းအုပ်စု',
    tone: 'Rising Tone',
    exampleConsonant: 'ข',
    exampleSound: 'kh',
  },
];

const renderTable = () =>
  render(
    <>
      <h2 id="title">Short vowels</h2>
      <ClassTable consonantClasses={consonantClasses} firstColumnLabel="Vowel" labelledBy="title">
        <tr>
          <th scope="row">-ะ</th>
          <td>กะ</td>
          <td>ขะ</td>
        </tr>
      </ClassTable>
    </>
  );

describe('ClassTable', () => {
  it('names the table after its heading', () => {
    renderTable();

    expect(screen.getByRole('table', { name: 'Short vowels' })).toBeInTheDocument();
  });

  it('heads a column per class with its example consonant', () => {
    renderTable();

    const headers = screen.getAllByRole('columnheader');

    expect(headers.map((header) => header.textContent)).toEqual(['Vowel', 'Middle ก', 'High ข']);
    expect(within(headers[1] as HTMLElement).getByText('ก')).toHaveAttribute('lang', 'th');
  });

  it('shows the given rows', () => {
    renderTable();

    expect(
      within(screen.getByRole('row', { name: /^-ะ/ }))
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['กะ', 'ขะ']);
  });
});
