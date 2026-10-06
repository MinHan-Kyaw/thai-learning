import { MemoryRouter, Route, Routes } from 'react-router';

import { render, screen } from '@testing-library/react';

import Layout from '.';

const renderLayout = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<p>Screen content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('Layout', () => {
  it('renders the brand link, main navigation and screen content', () => {
    renderLayout('/');

    expect(screen.getByRole('link', { name: 'Thai Learning' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Screen content');
    expect(
      screen
        .getAllByRole('link')
        .slice(1)
        .map((link) => link.textContent)
    ).toEqual(['Consonants', 'Vowels', 'Practice']);
  });

  describe('given the current route matches a navigation item', () => {
    it('marks that item as the current page', () => {
      renderLayout('/practice');

      expect(screen.getByRole('link', { name: 'Practice' })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: 'Consonants' })).not.toHaveAttribute('aria-current');
    });
  });
});
