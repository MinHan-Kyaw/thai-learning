import { render, screen } from '@testing-library/react';

import VowelCard from '.';

describe('VowelCard', () => {
  it('shows the vowel with its English sound and Burmese pronunciation', () => {
    render(<VowelCard vowel={{ id: 'ฤ', group: 'standalone', sound: 'reu', pronunciation: 'ရူ' }} />);

    const card = screen.getByRole('article', { name: 'ฤ' });

    expect(card).toHaveTextContent('ฤ reu ရူ');
    expect(screen.getByRole('heading', { name: 'ฤ' })).toHaveAttribute('lang', 'th');
    expect(screen.getByText('ရူ')).toHaveAttribute('lang', 'my');
  });
});
