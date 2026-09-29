import { render, screen, within } from '@testing-library/react';

import { consonants } from '../../data';

import AllConsonants from '.';

describe('AllConsonants', () => {
  it('shows all 44 consonants as compact cards in class order', () => {
    render(<AllConsonants />);

    const cards = within(screen.getByRole('list', { name: 'All Thai consonants' })).getAllByRole('article');

    expect(cards).toHaveLength(44);
    expect(cards.map((card) => card.getAttribute('aria-labelledby'))).toEqual(
      consonants.map((consonant) => `consonant-${consonant.id}`)
    );
    cards.forEach((card) => expect(card).toHaveAttribute('data-size', 'compact'));
  });

  it('shows the letter, picture and Burmese meaning without the Thai word or audio buttons', () => {
    render(<AllConsonants />);

    const card = screen.getByRole('article', { name: 'ก' });

    expect(within(card).getByRole('img', { name: 'ကြက်' })).toBeInTheDocument();
    expect(card).toHaveTextContent('ကြက် (ကောကိုင်)');
    expect(within(card).queryByText('ไก่')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
