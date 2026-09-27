import { MemoryRouter } from 'react-router';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ButtonLink from './ButtonLink';

import Button from '.';

describe('Button', () => {
  it('renders a non-submitting button by default', () => {
    render(<Button>Next</Button>);

    expect(screen.getByRole('button', { name: 'Next' })).toHaveAttribute('type', 'button');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Next</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies the variant class', () => {
    render(<Button variant="secondary">Back</Button>);

    expect(screen.getByRole('button', { name: 'Back' })).toHaveClass('secondary');
  });

  describe('given it is disabled', () => {
    it('does not call onClick', async () => {
      const onClick = vi.fn();
      render(
        <Button onClick={onClick} disabled>
          Next
        </Button>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      expect(onClick).not.toHaveBeenCalled();
    });
  });
});

describe('ButtonLink', () => {
  it('renders a link styled as a button', () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/practice">Start Practice</ButtonLink>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'Start Practice' });

    expect(link).toHaveAttribute('href', '/practice');
    expect(link).toHaveClass('button', 'primary');
  });
});
