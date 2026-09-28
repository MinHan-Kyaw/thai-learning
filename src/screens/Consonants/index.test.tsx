import { MemoryRouter } from 'react-router';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { playAudio } from '../../services/audio';

import Consonants from '.';

vi.mock('../../services/audio', () => ({ playAudio: vi.fn(), stopAudio: vi.fn() }));

const renderConsonants = (route = '/consonants') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Consonants />
    </MemoryRouter>
  );

const getCards = () => within(screen.getByRole('region', { name: /Class/ })).getAllByRole('article');

describe('Consonants', () => {
  it('shows the middle class by default', () => {
    renderConsonants();

    expect(screen.getByRole('heading', { level: 2, name: 'Middle Class' })).toBeInTheDocument();
    expect(getCards()).toHaveLength(9);
    expect(screen.getByRole('article', { name: 'ก' })).toHaveTextContent('ไก่');
    expect(screen.getByRole('article', { name: 'ก' })).toHaveTextContent('ကောကိုင်');
  });

  it('switches to the chosen class and scrolls back to its first letter', async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    renderConsonants();

    await userEvent.click(screen.getByRole('button', { name: /^High/ }));

    expect(screen.getByRole('heading', { level: 2, name: 'High Class' })).toBeInTheDocument();
    expect(getCards()).toHaveLength(11);
    expect(screen.getByRole('article', { name: 'ข' })).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  describe('given the selected class is chosen again', () => {
    it('stays where the learner is', async () => {
      const scrollTo = vi.fn();
      vi.stubGlobal('scrollTo', scrollTo);
      renderConsonants();

      await userEvent.click(screen.getByRole('button', { name: /^Middle/ }));

      expect(scrollTo).not.toHaveBeenCalled();
    });
  });

  it('plays the Thai audio for a word', async () => {
    renderConsonants();

    await userEvent.click(screen.getByRole('button', { name: 'Play Thai audio for ไก่' }));

    expect(playAudio).toHaveBeenCalledWith('/audio/words/kai.m4a');
  });

  describe('given the class is set in the URL', () => {
    it('shows that class', () => {
      renderConsonants('/consonants?class=low');

      expect(screen.getByRole('heading', { level: 2, name: 'Low Class' })).toBeInTheDocument();
      expect(getCards()).toHaveLength(24);
    });
  });

  describe('given an unknown class is set in the URL', () => {
    it('falls back to the middle class', () => {
      renderConsonants('/consonants?class=unknown');

      expect(screen.getByRole('heading', { level: 2, name: 'Middle Class' })).toBeInTheDocument();
    });
  });
});
