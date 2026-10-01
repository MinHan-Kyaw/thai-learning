import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckboxChips from '.';

const renderChips = (checked: { short: boolean; long: boolean }, onChange = vi.fn()) => {
  render(
    <CheckboxChips
      legend="Vowels to practise"
      options={[
        { id: 'short', label: 'Short', checked: checked.short },
        { id: 'long', label: 'Long', checked: checked.long },
      ]}
      onChange={onChange}
    />
  );
  return { onChange };
};

describe('CheckboxChips', () => {
  it('groups the options under the legend', () => {
    renderChips({ short: true, long: false });

    expect(screen.getByRole('group', { name: 'Vowels to practise' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Short' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Long' })).not.toBeChecked();
  });

  it('reports a change', async () => {
    const { onChange } = renderChips({ short: true, long: false });

    await userEvent.click(screen.getByRole('checkbox', { name: 'Long' }));

    expect(onChange).toHaveBeenCalledWith('long', true);
  });

  describe('given only one option is checked', () => {
    it('keeps it from being unticked', () => {
      renderChips({ short: true, long: false });

      expect(screen.getByRole('checkbox', { name: 'Short' })).toBeDisabled();
      expect(screen.getByRole('checkbox', { name: 'Long' })).toBeEnabled();
    });
  });

  describe('given several options are checked', () => {
    it('lets each be unticked', () => {
      renderChips({ short: true, long: true });

      screen.getAllByRole('checkbox').forEach((checkbox) => expect(checkbox).toBeEnabled());
    });
  });
});
