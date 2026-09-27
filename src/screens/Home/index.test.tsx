import { MemoryRouter } from 'react-router';

import { render, screen, within } from '@testing-library/react';

import Home from '.';

describe('Home', () => {
  it('renders the title and tagline', () => {
    render(<Home />, { wrapper: MemoryRouter });

    expect(screen.getByRole('heading', { level: 1, name: 'Thai Learning' })).toBeInTheDocument();
    expect(screen.getByText('Learn Thai step by step')).toBeInTheDocument();
  });

  it('links to practice mode and the consonants screen', () => {
    render(<Home />, { wrapper: MemoryRouter });

    expect(screen.getByRole('link', { name: 'Start Practice' })).toHaveAttribute('href', '/practice');
    expect(screen.getByRole('link', { name: 'Explore Consonants' })).toHaveAttribute('href', '/consonants');
  });

  it('summarises the consonant count per class', () => {
    render(<Home />, { wrapper: MemoryRouter });

    const classes = within(screen.getByRole('list', { name: 'Consonant classes' }));

    expect(classes.getByText('Middle Class').previousSibling).toHaveTextContent('9');
    expect(classes.getByText('High Class').previousSibling).toHaveTextContent('11');
    expect(classes.getByText('Low Class').previousSibling).toHaveTextContent('24');
  });
});
