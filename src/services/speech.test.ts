import { isSpeechRecognitionSupported, listen, stopListening } from './speech';

class FakeRecognition {
  static instances: FakeRecognition[] = [];

  lang = '';
  continuous = true;
  interimResults = true;
  maxAlternatives = 1;
  onresult: ((event: { results: { transcript: string }[][] }) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  abort = vi.fn(() => this.fail('aborted'));

  constructor() {
    FakeRecognition.instances.push(this);
  }

  hear(transcripts: string[]) {
    this.onresult?.({ results: [transcripts.map((transcript) => ({ transcript }))] });
    this.onend?.();
  }

  fail(error: string) {
    this.onerror?.({ error });
    this.onend?.();
  }
}

const latestRecognition = () => FakeRecognition.instances.at(-1) as FakeRecognition;

describe('speech service', () => {
  beforeEach(() => {
    FakeRecognition.instances = [];
    vi.stubGlobal('SpeechRecognition', FakeRecognition);
  });

  afterEach(() => {
    stopListening();
  });

  it('listens once in the given language and resolves with every alternative heard', async () => {
    const result = listen('th-TH');
    const recognition = latestRecognition();

    recognition.hear(['กอ ไก่', 'ไก่']);

    await expect(result).resolves.toEqual({ status: 'heard', transcripts: ['กอ ไก่', 'ไก่'] });
    expect(recognition.lang).toBe('th-TH');
    expect(recognition.continuous).toBe(false);
    expect(recognition.interimResults).toBe(false);
    expect(recognition.maxAlternatives).toBeGreaterThan(1);
    expect(recognition.start).toHaveBeenCalledTimes(1);
  });

  it('stops the previous recognition before listening again', async () => {
    const first = listen('th-TH');
    const firstRecognition = latestRecognition();

    const second = listen('th-TH');
    latestRecognition().hear(['ไก่']);

    await expect(first).resolves.toEqual({ status: 'aborted' });
    await expect(second).resolves.toEqual({ status: 'heard', transcripts: ['ไก่'] });
    expect(firstRecognition.abort).toHaveBeenCalledTimes(1);
  });

  describe('given nothing is said', () => {
    it('resolves with no speech', async () => {
      const result = listen('th-TH');

      latestRecognition().fail('no-speech');

      await expect(result).resolves.toEqual({ status: 'no-speech' });
    });
  });

  describe('given the microphone is not allowed', () => {
    it('resolves as blocked', async () => {
      const result = listen('th-TH');

      latestRecognition().fail('not-allowed');

      await expect(result).resolves.toEqual({ status: 'blocked' });
    });
  });

  describe('given the recognition service fails', () => {
    it('resolves as failed', async () => {
      const result = listen('th-TH');

      latestRecognition().fail('network');

      await expect(result).resolves.toEqual({ status: 'failed' });
    });
  });

  describe('given only the prefixed recognizer exists', () => {
    it('uses it', () => {
      vi.stubGlobal('SpeechRecognition', undefined);
      vi.stubGlobal('webkitSpeechRecognition', FakeRecognition);

      expect(isSpeechRecognitionSupported()).toBe(true);
    });
  });

  describe('given the browser has no speech recognition', () => {
    it('reports it and resolves as failed', async () => {
      vi.stubGlobal('SpeechRecognition', undefined);

      expect(isSpeechRecognitionSupported()).toBe(false);
      await expect(listen('th-TH')).resolves.toEqual({ status: 'failed' });
    });
  });
});
