import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { consonants } from '../../data';
import { playAudio } from '../../services/audio';

import AllConsonants from '.';

vi.mock('../../services/audio', () => ({ playAudio: vi.fn(), stopAudio: vi.fn() }));

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

  it('plays a word when its audio button is pressed', async () => {
    render(<AllConsonants />);

    await userEvent.click(screen.getByRole('button', { name: 'Play Thai audio for ไก่' }));

    expect(playAudio).toHaveBeenCalledWith('/audio/words/kai.m4a');
  });
});
