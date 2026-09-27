import { playAudio, stopAudio } from './audio';

class FakeAudio {
  static instances: FakeAudio[] = [];

  src: string;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();

  constructor(src: string) {
    this.src = src;
    FakeAudio.instances.push(this);
  }
}

describe('audio service', () => {
  beforeEach(() => {
    FakeAudio.instances = [];
    vi.stubGlobal('Audio', FakeAudio);
  });

  afterEach(() => {
    stopAudio();
  });

  it('plays the given source', async () => {
    await playAudio('/audio/words/kai.m4a');

    expect(FakeAudio.instances).toHaveLength(1);
    expect(FakeAudio.instances[0]?.src).toBe('/audio/words/kai.m4a');
    expect(FakeAudio.instances[0]?.play).toHaveBeenCalledTimes(1);
  });

  it('stops the previous sound before playing a new one so sounds never overlap', async () => {
    await playAudio('/audio/words/kai.m4a');
    await playAudio('/audio/words/khai.m4a');

    expect(FakeAudio.instances[0]?.pause).toHaveBeenCalledTimes(1);
    expect(FakeAudio.instances[1]?.pause).not.toHaveBeenCalled();
  });

  it('stops the current sound', async () => {
    await playAudio('/audio/words/kai.m4a');

    stopAudio();

    expect(FakeAudio.instances[0]?.pause).toHaveBeenCalledTimes(1);
  });

  describe('given the browser rejects playback', () => {
    it('resolves without throwing', async () => {
      vi.stubGlobal(
        'Audio',
        class extends FakeAudio {
          play = vi.fn(() => Promise.reject(new Error('NotAllowedError')));
        }
      );

      await expect(playAudio('/audio/words/kai.m4a')).resolves.toBeUndefined();
    });
  });

  describe('given nothing is playing', () => {
    it('does nothing when stopped', () => {
      expect(() => stopAudio()).not.toThrow();
    });
  });
});
