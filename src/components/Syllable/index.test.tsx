import { render, screen } from '@testing-library/react';

import Syllable from '.';

describe('Syllable', () => {
  it('shows the Thai syllable with its tone', () => {
    const { container } = render(
      <Syllable text="กะ" tone={{ id: 'low', name: 'Low Tone', thaiName: 'เสียงเอก', pitch: [2, 1] }} />
    );

    expect(screen.getByText('กะ')).toHaveAttribute('lang', 'th');
    expect(screen.getByText('Low Tone')).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('data-tone', 'low');
  });
});
