class FakeParam {
  value = 0;
  setValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}

class FakeNode {
  connect = vi.fn((node: FakeNode) => node);
}

class FakeOscillator extends FakeNode {
  type = '';
  frequency = new FakeParam();
  start = vi.fn();
  stop = vi.fn();
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];

  state = 'running';
  currentTime = 0;
  destination = new FakeNode();
  oscillators: FakeOscillator[] = [];
  resume = vi.fn(() => Promise.resolve());

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  createOscillator() {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createGain() {
    return Object.assign(new FakeNode(), { gain: new FakeParam() });
  }
}

const loadSound = async () => {
  vi.resetModules();
  return import('./sound');
};

describe('sound service', () => {
  beforeEach(() => {
    FakeAudioContext.instances = [];
    vi.stubGlobal('AudioContext', FakeAudioContext);
  });

  describe('given a correct answer', () => {
    it('plays a rising two-note chime', async () => {
      const { playFeedbackSound } = await loadSound();

      playFeedbackSound('correct');

      const [first, second] = FakeAudioContext.instances[0]?.oscillators ?? [];
      expect(first?.frequency.value).toBeLessThan(second?.frequency.value ?? 0);
      expect(first?.start).toHaveBeenCalledTimes(1);
      expect(second?.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe('given an incorrect answer', () => {
    it('plays a low falling tone', async () => {
      const { playFeedbackSound } = await loadSound();

      playFeedbackSound('incorrect');

      const [first, second] = FakeAudioContext.instances[0]?.oscillators ?? [];
      expect(first?.frequency.value).toBeGreaterThan(second?.frequency.value ?? Infinity);
      expect(first?.frequency.value).toBeLessThan(300);
    });
  });

  it('reuses one audio context', async () => {
    const { playFeedbackSound } = await loadSound();

    playFeedbackSound('correct');
    playFeedbackSound('incorrect');

    expect(FakeAudioContext.instances).toHaveLength(1);
  });

  describe('given the browser suspended audio', () => {
    it('resumes it', async () => {
      const { playFeedbackSound } = await loadSound();
      playFeedbackSound('correct');
      const context = FakeAudioContext.instances[0] as FakeAudioContext;
      context.state = 'suspended';

      playFeedbackSound('correct');

      expect(context.resume).toHaveBeenCalledTimes(1);
    });
  });

  describe('given the browser has no Web Audio', () => {
    it('does nothing', async () => {
      vi.stubGlobal('AudioContext', undefined);
      const { playFeedbackSound } = await loadSound();

      expect(() => playFeedbackSound('correct')).not.toThrow();
    });
  });
});
