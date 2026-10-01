import { MemoryRouter } from 'react-router';

import { render, screen } from '@testing-library/react';

import BackLink from '.';

describe('BackLink', () => {
  it('links back to the given page', () => {
    render(
      <MemoryRouter>
        <BackLink to="/practice">Practice</BackLink>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Back to Practice' })).toHaveAttribute('href', '/practice');
  });
});
