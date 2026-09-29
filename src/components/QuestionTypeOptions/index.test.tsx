import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import QuestionTypeOptions, { type QuestionTypeOption } from '.';

const OPTIONS: QuestionTypeOption[] = [
  { mode: 'speak', label: 'Audio', checked: true },
  { mode: 'type', label: 'Type', checked: false },
  { mode: 'class', label: 'Group', checked: true },
];

const renderOptions = (options = OPTIONS) => {
  const onChange = vi.fn();
  render(<QuestionTypeOptions options={options} onChange={onChange} />);
  return { onChange };
};

const getMenuButton = () => screen.getByRole('button', { name: 'Question types' });

const openMenu = () => userEvent.click(getMenuButton());

describe('QuestionTypeOptions', () => {
  it('starts with the menu closed', () => {
    renderOptions();

    expect(getMenuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('shows a checkbox for each question type in the menu', async () => {
    renderOptions();

    await openMenu();

    expect(getMenuButton()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('checkbox', { name: 'Audio' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Type' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Group' })).toBeChecked();
  });

  it('reports a change', async () => {
    const { onChange } = renderOptions();
    await openMenu();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Group' }));

    expect(onChange).toHaveBeenCalledWith('class', false);
  });

  describe('given a type is unavailable in this browser', () => {
    it('is unchecked and cannot be changed', async () => {
      renderOptions([{ mode: 'speak', label: 'Audio', checked: true, unavailable: true }]);
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
        renderOptions();
        await openMenu();

        await userEvent.keyboard('{Escape}');

        expect(getMenuButton()).toHaveAttribute('aria-expanded', 'false');
        expect(getMenuButton()).toHaveFocus();
        expect(screen.queryByRole('group')).not.toBeInTheDocument();
      });
    });

    describe('given the learner taps outside', () => {
      it('closes the menu', async () => {
        renderOptions();
        await openMenu();

        await userEvent.click(document.body);

        expect(getMenuButton()).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });
});
