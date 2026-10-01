import { MemoryRouter } from 'react-router';

import { render, screen, within } from '@testing-library/react';

import Tones from '.';

const renderTones = () => render(<Tones />, { wrapper: MemoryRouter });

const getCell = (rowName: RegExp, column: number) =>
  within(screen.getByRole('row', { name: rowName })).getAllByRole('cell')[column] as HTMLElement;

describe('Tones', () => {
  it('lists the five tones with their Thai names', () => {
    renderTones();

    const items = within(screen.getByRole('list', { name: 'The five tones' })).getAllByRole('listitem');

    expect(items.map((item) => item.textContent)).toEqual([
      'Mid Tone เสียงสามัญ',
      'Low Tone เสียงเอก',
      'Falling Tone เสียงโท',
      'High Tone เสียงตรี',
      'Rising Tone เสียงจัตวา',
    ]);
  });

  it('shows the tone of each class for live and dead syllables', () => {
    renderTones();

    expect([0, 1, 2].map((column) => getCell(/အသံရှင်/, column).textContent)).toEqual([
      'กา Mid Tone',
      'ขา Rising Tone',
      'คา Mid Tone',
    ]);
    expect([0, 1, 2].map((column) => getCell(/အသံသေ/, column).textContent)).toEqual([
      'กะ Low Tone',
      'ขะ Low Tone',
      'คะ High Tone',
    ]);
  });

  it('shows the tone each mark gives and the marks a class does not use', () => {
    renderTones();

    expect(getCell(/ไม้เอก/, 2)).toHaveTextContent('ค่า Falling Tone');
    expect(getCell(/ไม้ตรี/, 0)).toHaveTextContent('ก๊า High Tone');
    expect(getCell(/ไม้ตรี/, 1)).toHaveTextContent('မသုံးပါ');
  });
});
