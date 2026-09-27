import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AudioButton from '.';

describe('AudioButton', () => {
  it('exposes an accessible label and calls onPlay when pressed', async () => {
    const onPlay = vi.fn();
    render(<AudioButton label="Play Thai audio for ไก่" onPlay={onPlay} />);

    await userEvent.click(screen.getByRole('button', { name: 'Play Thai audio for ไก่' }));

    expect(onPlay).toHaveBeenCalledTimes(1);
  });
});
