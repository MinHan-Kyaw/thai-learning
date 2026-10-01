import { MemoryRouter } from 'react-router';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { consonants, vowels } from '../../data';
import { generateVowelQuestions } from '../../helpers/vowels';
import { playFeedbackSound } from '../../services/sound';
import { speakThai } from '../../services/voice';
import type { Consonant, Vowel, VowelQuestion } from '../../types/learning';

import VowelPractice from '.';

vi.mock('../../services/sound', () => ({ FEEDBACK_SOUND_DURATION_MS: 0, playFeedbackSound: vi.fn() }));
vi.mock('../../services/voice', () => ({ speakThai: vi.fn(), stopSpeaking: vi.fn() }));
// A spelling question (ก + -ะ) followed by a tone question (ขา).
vi.mock('../../helpers/vowels', async (importOriginal) => {
  const helpers = await importOriginal<typeof import('../../helpers/vowels')>();
  const consonant = (character: string) => consonants.find((item) => item.character === character) as Consonant;
  const vowel = (id: string) => vowels.find((item) => item.id === id) as Vowel;
  const questions: VowelQuestion[] = [
    {
      id: 'กะ',
      kind: 'spell',
      consonant: consonant('ก'),
      vowel: vowel('-ะ'),
      syllable: 'กะ',
      tone: 'low',
      options: ['กา', 'กะ', 'กิ'],
    },
    { id: 'ขา', kind: 'tone', consonant: consonant('ข'), vowel: vowel('-า'), syllable: 'ขา', tone: 'rising' },
  ];

  return { ...helpers, generateVowelQuestions: vi.fn(() => questions) };
});

const renderVowelPractice = () =>
  render(
    <MemoryRouter>
      <VowelPractice />
    </MemoryRouter>
  );

const answer = async (name: string | RegExp) => {
  await userEvent.click(screen.getByRole('button', { name }));
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
};

describe('VowelPractice', () => {
  describe('given a spelling question', () => {
    it('shows the consonant and vowel and waits for a choice', () => {
      renderVowelPractice();

      expect(screen.getByRole('heading', { name: 'How is this written?' })).toBeInTheDocument();
      expect(screen.getByText('-ะ').closest('[lang]')).toHaveAttribute('lang', 'th');
      expect(screen.getByText('a')).toBeInTheDocument();
      expect(screen.getByText('အ')).toHaveAttribute('lang', 'my');
      expect(within(screen.getByRole('list', { name: 'Answer options' })).getAllByRole('button')).toHaveLength(3);
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it('marks a correct spelling and explains the tone', async () => {
      renderVowelPractice();

      await answer('กะ');

      expect(screen.getByRole('status')).toHaveTextContent('Correct.');
      expect(within(screen.getByRole('list', { name: 'Answer options' })).getByRole('button', { name: /กะ/ })).toHaveAttribute(
        'data-status',
        'correct'
      );
      expect(screen.getByText('Low Tone').closest('p')).toHaveTextContent('ก အလယ်သံဗျည်းအုပ်စု + -ะ အသံသေ → กะ Low Tone');
      expect(playFeedbackSound).toHaveBeenCalledWith('correct');
    });
  });

  describe('given a tone question answered wrongly', () => {
    it('reveals the correct tone', async () => {
      renderVowelPractice();
      await answer('กะ');
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(screen.getByRole('heading', { name: 'Which tone is this?' })).toHaveFocus();
      expect(screen.getByText('ขา')).toBeInTheDocument();

      await answer(/Mid Tone/);

      expect(screen.getByRole('status')).toHaveTextContent('Incorrect. The answer is Rising Tone.');
      expect(screen.getByRole('button', { name: /Rising Tone/ })).toHaveAttribute('data-status', 'correct');
      expect(playFeedbackSound).toHaveBeenCalledWith('incorrect');
    });
  });

  describe('given every question is answered', () => {
    it('shows the score, links to the vowels and can start again', async () => {
      renderVowelPractice();
      await answer('กะ');
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
      await answer(/Mid Tone/);
      await userEvent.click(screen.getByRole('button', { name: 'See results' }));

      expect(screen.getByText('1 / 2')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Explore vowels' })).toHaveAttribute('href', '/vowels');

      await userEvent.click(screen.getByRole('button', { name: 'Practice again' }));

      expect(screen.getByRole('heading', { name: 'How is this written?' })).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('given vowel groups to practise', () => {
    const practisedGroups = () =>
      [...new Set(vi.mocked(generateVowelQuestions).mock.lastCall?.[1].map((vowel) => vowel.group))].sort();

    it('starts with short, long and extra vowels', () => {
      renderVowelPractice();

      expect(screen.getByRole('checkbox', { name: /Short vowels/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Long vowels/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Extra vowels/ })).toBeChecked();
      expect(screen.queryByRole('checkbox', { name: /Standalone/ })).not.toBeInTheDocument();
      expect(practisedGroups()).toEqual(['extra', 'long', 'short']);
    });

    it('restarts with only the ticked groups', async () => {
      renderVowelPractice();
      await answer('กะ');

      await userEvent.click(screen.getByRole('checkbox', { name: /Long vowels/ }));
      await userEvent.click(screen.getByRole('checkbox', { name: /Extra vowels/ }));

      expect(practisedGroups()).toEqual(['short']);
      expect(screen.getByRole('checkbox', { name: /Short vowels/ })).toBeDisabled();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('given pronunciation', () => {
    it('speaks a spelling option when it is chosen', async () => {
      renderVowelPractice();

      await userEvent.click(screen.getByRole('button', { name: 'กิ' }));

      expect(speakThai).toHaveBeenCalledWith('กิ');
    });

    it('speaks a tone question only after it is answered', async () => {
      renderVowelPractice();
      await answer('กะ');
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
      vi.mocked(speakThai).mockClear();

      await userEvent.click(screen.getByRole('button', { name: /Mid Tone/ }));
      expect(speakThai).not.toHaveBeenCalled();

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      await waitFor(() => expect(speakThai).toHaveBeenCalledWith('ขา'));
    });

    it('replays the syllable after answering', async () => {
      renderVowelPractice();
      await answer('กะ');
      vi.mocked(speakThai).mockClear();

      await userEvent.click(screen.getByRole('button', { name: 'Hear กะ' }));

      expect(speakThai).toHaveBeenCalledWith('กะ');
    });
  });
});
