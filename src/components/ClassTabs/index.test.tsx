import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { ConsonantClass } from '../../types/learning';

import ClassTabs from '.';

const classes: ConsonantClass[] = [
  { id: 'middle', name: 'Middle Class', shortName: 'Middle', burmeseName: 'အလယ်', tone: 'Mid tone' },
  { id: 'high', name: 'High Class', shortName: 'High', burmeseName: 'အမြင့်', tone: 'Rising tone' },
  { id: 'low', name: 'Low Class', shortName: 'Low', burmeseName: 'အနိမ့်', tone: 'Mid tone' },
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
    expect(button.querySelector('.count')).toHaveTextContent('9 letters');
    expect(button.querySelector('.visuallyHidden')).toHaveTextContent('letters');
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
