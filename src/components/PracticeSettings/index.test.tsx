import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PracticeSettings, { type QuestionCount, type QuestionTypeOption } from '.';

const QUESTION_TYPES: QuestionTypeOption[] = [
  { mode: 'speak', label: 'Audio', checked: true },
  { mode: 'type', label: 'Type', checked: false },
  { mode: 'class', label: 'Group', checked: true },
];

const renderSettings = ({
  questionCount = { value: 10, min: 5, max: 30, step: 5 },
  questionTypes = QUESTION_TYPES,
}: { questionCount?: QuestionCount; questionTypes?: QuestionTypeOption[] } = {}) => {
  const onQuestionCountChange = vi.fn();
  const onQuestionTypeChange = vi.fn();
  render(
    <PracticeSettings
      questionCount={questionCount}
      onQuestionCountChange={onQuestionCountChange}
      questionTypes={questionTypes}
      onQuestionTypeChange={onQuestionTypeChange}
    />
  );
  return { onQuestionCountChange, onQuestionTypeChange };
};

const getMenuButton = () => screen.getByRole('button', { name: 'Practice settings' });

const openMenu = () => userEvent.click(getMenuButton());

describe('PracticeSettings', () => {
  it('starts with the menu closed', () => {
    renderSettings();

    expect(getMenuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('group', { name: 'Questions' })).not.toBeInTheDocument();
  });

  it('shows the number of questions and a checkbox for each question type', async () => {
    renderSettings();

    await openMenu();

    expect(getMenuButton()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('group', { name: 'Questions' })).toHaveTextContent('10');
    expect(screen.getByRole('checkbox', { name: 'Audio' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Type' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Group' })).toBeChecked();
  });

  it('steps the number of questions up and down', async () => {
    const { onQuestionCountChange } = renderSettings();
    await openMenu();

    await userEvent.click(screen.getByRole('button', { name: 'More questions' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fewer questions' }));

    expect(onQuestionCountChange.mock.calls).toEqual([[15], [5]]);
  });

  describe('given the number of questions is at a limit', () => {
    it('disables stepping past it', async () => {
      renderSettings({ questionCount: { value: 30, min: 5, max: 30, step: 5 } });
      await openMenu();

      expect(screen.getByRole('button', { name: 'More questions' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Fewer questions' })).toBeEnabled();
    });
  });

  it('reports a question type change', async () => {
    const { onQuestionTypeChange } = renderSettings();
    await openMenu();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Group' }));

    expect(onQuestionTypeChange).toHaveBeenCalledWith('class', false);
  });

  describe('given no question types are offered', () => {
    it('only shows the number of questions', async () => {
      render(
        <PracticeSettings
          questionCount={{ value: 10, min: 5, max: 30, step: 5 }}
          onQuestionCountChange={vi.fn()}
          onQuestionTypeChange={vi.fn()}
        />
      );
      await openMenu();

      expect(screen.getByRole('group', { name: 'Questions' })).toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });

  describe('given a type is unavailable in this browser', () => {
    it('is unchecked and cannot be changed', async () => {
      renderSettings({ questionTypes: [{ mode: 'speak', label: 'Audio', checked: true, unavailable: true }] });
      await openMenu();

      const audio = screen.getByRole('checkbox', { name: 'Audio' });

      expect(audio).not.toBeChecked();
      expect(audio).toBeDisabled();
      expect(audio).toHaveAccessibleDescription('Not available in this browser');
    });
  });

  describe('given the menu is open', () => {
    describe('given Escape is pressed', () => {
      it('closes the menu and returns focus to its button', async () => {
        renderSettings();
        await openMenu();

        await userEvent.keyboard('{Escape}');

        expect(getMenuButton()).toHaveAttribute('aria-expanded', 'false');
        expect(getMenuButton()).toHaveFocus();
        expect(screen.queryByRole('group', { name: 'Questions' })).not.toBeInTheDocument();
      });
    });

    describe('given the learner taps outside', () => {
      it('closes the menu', async () => {
        renderSettings();
        await openMenu();

        await userEvent.click(document.body);

        expect(getMenuButton()).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });
});
