import { render } from '@testing-library/react';

import ToneContour from '.';

describe('ToneContour', () => {
  it('draws the pitch from start to end, hidden from screen readers', () => {
    const { container } = render(<ToneContour pitch={[1, 4]} />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('data-pitch', '14');
    expect(svg?.querySelector('path')).toHaveAttribute('d', 'M4 28 C20 28 28 10 44 10');
  });
});
