import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { ConsonantClass } from '../../types/learning';

import ClassTabs from '.';

const classes: ConsonantClass[] = [
  { id: 'middle', group: 1, name: 'Middle Class', shortName: 'Middle', burmeseName: 'အလယ်', tone: 'Mid tone' },
  { id: 'high', group: 2, name: 'High Class', shortName: 'High', burmeseName: 'အမြင့်', tone: 'Rising tone' },
  { id: 'low', group: 3, name: 'Low Class', shortName: 'Low', burmeseName: 'အနိမ့်', tone: 'Mid tone' },
];
const counts = { middle: 9, high: 11, low: 24 };

describe('ClassTabs', () => {
  it('renders one button per class with its short name and letter count', () => {
    render(<ClassTabs classes={classes} counts={counts} selectedClassId="middle" onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Middle 9 letters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'High 11 letters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Low 24 letters' })).toBeInTheDocument();
  });

  it('shows the count without the word "letters" or "Class" on screen', () => {
    render(<ClassTabs classes={classes} counts={counts} selectedClassId="middle" onSelect={vi.fn()} />);

    const button = screen.getByRole('button', { name: /Middle/ });

    expect(button).not.toHaveTextContent('Class');
    expect(button).toHaveTextContent('Middle 9 letters');
    expect(within(button).getByText('letters')).toHaveClass('sr-only');
  });

  it('marks the selected class as pressed', () => {
    render(<ClassTabs classes={classes} counts={counts} selectedClassId="high" onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: /High/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Middle/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with the chosen class', async () => {
    const onSelect = vi.fn();
    render(<ClassTabs classes={classes} counts={counts} selectedClassId="middle" onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: /Low/ }));

    expect(onSelect).toHaveBeenCalledWith('low');
  });
});
