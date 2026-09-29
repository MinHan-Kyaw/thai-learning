import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { Consonant } from '../../types/learning';

import ConsonantCard from '.';

const buildConsonant = (overrides: Partial<Consonant['words'][number]> = {}): Consonant => ({
  id: 'ก',
  character: 'ก',
  class: 'middle',
  words: [
    {
      id: 'ก-ไก่',
      thai: 'ไก่',
      pronunciation: 'ကောကိုင်',
      meaning: 'ကြက်',
      image: '/images/words/kai.svg',
      audio: '/audio/words/kai.m4a',
      ...overrides,
    },
  ],
});

describe('ConsonantCard', () => {
  it('renders the consonant, word, image and Burmese pronunciation', () => {
    render(<ConsonantCard consonant={buildConsonant()} onPlayAudio={vi.fn()} />);

    expect(screen.getByRole('article', { name: 'ก' })).toBeInTheDocument();
    expect(screen.getByText('ไก่')).toBeInTheDocument();
    expect(screen.getByText('ကြက်').closest('p')).toHaveTextContent('ကြက် (ကောကိုင်)');
    expect(screen.getByRole('img', { name: 'ကြက်' })).toHaveAttribute('src', '/images/words/kai.svg');
  });

  it('plays the word audio when the audio button is pressed', async () => {
    const onPlayAudio = vi.fn();
    const consonant = buildConsonant();
    render(<ConsonantCard consonant={consonant} onPlayAudio={onPlayAudio} />);

    await userEvent.click(screen.getByRole('button', { name: 'Play Thai audio for ไก่' }));

    expect(onPlayAudio).toHaveBeenCalledWith(consonant.words[0]);
  });

  it('uses the default size', () => {
    render(<ConsonantCard consonant={buildConsonant()} onPlayAudio={vi.fn()} />);

    expect(screen.getByRole('article')).toHaveAttribute('data-size', 'default');
  });

  describe('given the compact size', () => {
    it('shows the same content', () => {
      render(<ConsonantCard consonant={buildConsonant()} onPlayAudio={vi.fn()} size="compact" />);

      expect(screen.getByRole('article', { name: 'ก' })).toHaveAttribute('data-size', 'compact');
      expect(screen.getByText('ไก่')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'ကြက်' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Play Thai audio for ไก่' })).toBeInTheDocument();
    });
  });

  describe('given the word has no image', () => {
    it('renders a placeholder instead of an image', () => {
      render(<ConsonantCard consonant={buildConsonant({ image: undefined })} onPlayAudio={vi.fn()} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByText('Picture coming soon')).toBeInTheDocument();
    });
  });

  describe('given the word has no audio', () => {
    it('does not render the audio button', () => {
      render(<ConsonantCard consonant={buildConsonant({ audio: undefined })} onPlayAudio={vi.fn()} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
