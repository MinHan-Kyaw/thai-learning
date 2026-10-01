import { render, screen } from '@testing-library/react';

import type { Consonant, VowelQuestion as VowelQuestionType } from '../../types/learning';

import VowelQuestion from '.';

const consonant: Consonant = { id: 'ก', character: 'ก', class: 'middle', words: [] };

const spellQuestion: VowelQuestionType = {
  id: 'กิ',
  kind: 'spell',
  consonant,
  vowel: { id: '-ิ', group: 'short', sound: 'i', pronunciation: 'အိ' },
  syllable: 'กิ',
  tone: 'low',
  options: ['กิ', 'กี', 'กะ'],
};

const toneQuestion: VowelQuestionType = {
  id: 'กา',
  kind: 'tone',
  consonant,
  vowel: { id: '-า', group: 'long', sound: 'aa', pronunciation: 'အား' },
  syllable: 'กา',
  tone: 'mid',
};

describe('VowelQuestion', () => {
  describe('given a spelling question', () => {
    it('shows the consonant and the vowel with its sound and Burmese pronunciation', () => {
      render(
        <VowelQuestion question={spellQuestion}>
          <p>Answer area</p>
        </VowelQuestion>
      );

      expect(screen.getByRole('heading', { name: 'How is this written?' })).toBeInTheDocument();
      expect(screen.getByText('ก').closest('[lang]')).toHaveAttribute('lang', 'th');
      expect(screen.getByText('◌ิ').closest('[lang]')).toHaveAttribute('lang', 'th');
      expect(screen.getByText('i')).toBeInTheDocument();
      expect(screen.getByText('အိ')).toHaveAttribute('lang', 'my');
      expect(screen.queryByText('กิ')).not.toBeInTheDocument();
      expect(screen.getByText('Answer area')).toBeInTheDocument();
    });
  });

  describe('given a tone question', () => {
    it('shows the written syllable', () => {
      render(
        <VowelQuestion question={toneQuestion}>
          <p>Answer area</p>
        </VowelQuestion>
      );

      expect(screen.getByRole('heading', { name: 'Which tone is this?' })).toBeInTheDocument();
      expect(screen.getByText('กา')).toHaveAttribute('lang', 'th');
    });
  });

  describe('given the question changes', () => {
    it('moves focus to the prompt for keyboard and screen reader users', () => {
      const { rerender } = render(
        <VowelQuestion question={spellQuestion}>
          <p>Answer area</p>
        </VowelQuestion>
      );

      expect(screen.getByRole('heading', { name: 'How is this written?' })).not.toHaveFocus();

      rerender(
        <VowelQuestion question={toneQuestion}>
          <p>Answer area</p>
        </VowelQuestion>
      );

      expect(screen.getByRole('heading', { name: 'Which tone is this?' })).toHaveFocus();
    });
  });
});
