import { speakThai, stopSpeaking } from './voice';

class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

const thaiVoice = { lang: 'th-TH', name: 'Kanya' } as SpeechSynthesisVoice;

const stubSynthesis = (voices: SpeechSynthesisVoice[] = [thaiVoice]) => {
  const synthesis = {
    speaking: false,
    pending: false,
    speak: vi.fn(),
    cancel: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => voices),
  };
  vi.stubGlobal('speechSynthesis', synthesis);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  return synthesis;
};

describe('voice service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('speaks Thai text with a Thai voice, resuming a paused engine', () => {
    const synthesis = stubSynthesis();

    speakThai('กะ');

    expect(synthesis.resume).toHaveBeenCalled();
    expect(synthesis.speak.mock.calls[0]?.[0]).toMatchObject({ text: 'กะ', lang: 'th-TH', voice: thaiVoice });
  });

  describe('given nothing is being spoken', () => {
    it('does not cancel, which can make Chrome drop the next utterance', () => {
      const synthesis = stubSynthesis();

      speakThai('กะ');

      expect(synthesis.cancel).not.toHaveBeenCalled();
    });
  });

  describe('given something is being spoken', () => {
    it('stops it first', () => {
      const synthesis = stubSynthesis();
      synthesis.speaking = true;

      speakThai('กะ');

      expect(synthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('given no Thai voice is installed', () => {
    it('still asks for Thai so the browser can pick one', () => {
      const synthesis = stubSynthesis([{ lang: 'en-US', name: 'Alex' } as SpeechSynthesisVoice]);

      speakThai('กะ');

      expect(synthesis.speak.mock.calls[0]?.[0]).toMatchObject({ lang: 'th-TH', voice: null });
    });
  });

  describe('given the browser has no speech synthesis', () => {
    it('does nothing', () => {
      vi.stubGlobal('speechSynthesis', undefined);

      expect(() => speakThai('กะ')).not.toThrow();
      expect(() => stopSpeaking()).not.toThrow();
    });
  });

  describe('given speaking fails', () => {
    it('swallows the error', () => {
      const synthesis = stubSynthesis();
      synthesis.speak.mockImplementation(() => {
        throw new Error('not allowed');
      });

      expect(() => speakThai('กะ')).not.toThrow();
    });
  });

  it('stops speaking', () => {
    const synthesis = stubSynthesis();
    synthesis.pending = true;

    stopSpeaking();

    expect(synthesis.cancel).toHaveBeenCalled();
  });
});
