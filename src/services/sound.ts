export type FeedbackSound = 'correct' | 'incorrect';

interface Note {
  frequency: number;
  start: number;
  duration: number;
}

const SOUNDS: Record<FeedbackSound, { wave: OscillatorType; notes: Note[] }> = {
  correct: {
    wave: 'sine',
    notes: [
      { frequency: 1046.5, start: 0, duration: 0.12 },
      { frequency: 1568, start: 0.1, duration: 0.3 },
    ],
  },
  incorrect: {
    wave: 'triangle',
    notes: [
      { frequency: 196, start: 0, duration: 0.18 },
      { frequency: 147, start: 0.15, duration: 0.3 },
    ],
  },
};

const PEAK_GAIN = 0.25;
const SILENT_GAIN = 0.0001;

export const FEEDBACK_SOUND_DURATION_MS = 450;

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (!audioContext) {
    const soundWindow = window as Window & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextClass = soundWindow.AudioContext ?? soundWindow.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }
    audioContext = new AudioContextClass();
  }
  return audioContext;
};

export const playFeedbackSound = (sound: FeedbackSound): void => {
  try {
    const context = getAudioContext();

    if (!context) {
      return;
    }
    if (context.state === 'suspended') {
      void context.resume().catch(() => undefined);
    }

    const now = context.currentTime;
    const { wave, notes } = SOUNDS[sound];

    notes.forEach(({ frequency, start, duration }) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = now + start;

      oscillator.type = wave;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(SILENT_GAIN, startAt);
      gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(SILENT_GAIN, startAt + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration);
    });
  } catch {
    // Sound effects are optional feedback; learning continues silently if the browser refuses them.
  }
};
