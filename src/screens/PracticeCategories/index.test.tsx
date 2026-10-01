import { MemoryRouter } from 'react-router';

import { render, screen, within } from '@testing-library/react';

import PracticeCategories from '.';

describe('PracticeCategories', () => {
  it('offers consonant and vowel practice', () => {
    render(<PracticeCategories />, { wrapper: MemoryRouter });

    expect(screen.getByRole('heading', { level: 1, name: 'Practice' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Consonants 44 letters/ })).toHaveAttribute('href', '/practice/consonants');
    expect(screen.getByRole('link', { name: /Vowels 28 vowels/ })).toHaveAttribute('href', '/practice/vowels');
  });

  it('decorates each card with three vocabulary pictures', () => {
    render(<PracticeCategories />, { wrapper: MemoryRouter });

    const pictures = (name: RegExp) => within(screen.getByRole('link', { name })).getAllByRole('presentation', { hidden: true });

    expect(pictures(/Consonants/).map((picture) => picture.getAttribute('src'))).toEqual([
      '/images/words/kai.svg',
      '/images/words/khai.svg',
      '/images/words/khwai.svg',
    ]);
    expect(pictures(/Vowels/)).toHaveLength(3);
  });
});
