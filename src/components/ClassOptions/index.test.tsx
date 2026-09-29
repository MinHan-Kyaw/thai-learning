import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { consonantClasses } from '../../data';

import ClassOptions from '.';

const renderClassOptions = (overrides: Partial<{ selectedClassId: string; answered: boolean }> = {}) => {
  const onSelect = vi.fn();
  render(
    <ClassOptions
      classes={consonantClasses}
      correctClassId="middle"
      selectedClassId=""
      answered={false}
      onSelect={onSelect}
      {...overrides}
    />
  );
  return { onSelect };
};

describe('ClassOptions', () => {
  it('offers the three groups by number and name', () => {
    renderClassOptions();

    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual(['1 Middle', '2 High', '3 Low']);
  });

  it('reports the chosen class', async () => {
    const { onSelect } = renderClassOptions();

    await userEvent.click(screen.getByRole('button', { name: '2 High' }));

    expect(onSelect).toHaveBeenCalledWith('high');
  });

  describe('given a group is chosen but not yet evaluated', () => {
    it('highlights it without revealing the result', () => {
      renderClassOptions({ selectedClassId: 'high' });

      expect(screen.getByRole('button', { name: '2 High' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.queryByText('Correct')).not.toBeInTheDocument();
    });
  });

  describe('given a wrong group has been evaluated', () => {
    it('marks it incorrect, reveals the correct group and disables the choices', () => {
      renderClassOptions({ selectedClassId: 'high', answered: true });

      expect(screen.getByRole('button', { name: /2 High/ })).toHaveAttribute('data-status', 'incorrect');
      expect(screen.getByRole('button', { name: /1 Middle/ })).toHaveAttribute('data-status', 'correct');
      screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
    });
  });
});
