import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ClassTabs from '.';

const items: { id: 'middle' | 'high' | 'low'; label: string }[] = [
  { id: 'middle', label: 'Middle' },
  { id: 'high', label: 'High' },
  { id: 'low', label: 'Low' },
];
const counts = { middle: 9, high: 11, low: 24 };

describe('ClassTabs', () => {
  it('renders one button per item with its label and count', () => {
    render(
      <ClassTabs
        items={items}
        counts={counts}
        selectedId="middle"
        label="Consonant class"
        countLabel="letters"
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Middle 9 letters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'High 11 letters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Low 24 letters' })).toBeInTheDocument();
  });

  it('shows the count without the word "letters" or "Class" on screen', () => {
    render(
      <ClassTabs
        items={items}
        counts={counts}
        selectedId="middle"
        label="Consonant class"
        countLabel="letters"
        onSelect={vi.fn()}
      />
    );

    const button = screen.getByRole('button', { name: /Middle/ });

    expect(button).not.toHaveTextContent('Class');
    expect(button).toHaveTextContent('Middle 9 letters');
    expect(within(button).getByText('letters')).toHaveClass('sr-only');
  });

  it('marks the selected class as pressed', () => {
    render(
      <ClassTabs
        items={items}
        counts={counts}
        selectedId="high"
        label="Consonant class"
        countLabel="letters"
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /High/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Middle/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('names the tab list', () => {
    render(
      <ClassTabs
        items={items}
        counts={counts}
        selectedId="middle"
        label="Consonant class"
        countLabel="letters"
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('list', { name: 'Consonant class' })).toBeInTheDocument();
  });

  it('calls onSelect with the chosen class', async () => {
    const onSelect = vi.fn();
    render(
      <ClassTabs
        items={items}
        counts={counts}
        selectedId="middle"
        label="Consonant class"
        countLabel="letters"
        onSelect={onSelect}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /Low/ }));

    expect(onSelect).toHaveBeenCalledWith('low');
  });
});
