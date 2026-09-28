interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

type RecognitionConstructor = new () => Recognition;

export type ListenResult =
  { status: 'heard'; transcripts: string[] } | { status: 'no-speech' | 'blocked' | 'failed' | 'aborted' };

const MAX_ALTERNATIVES = 5;

const BLOCKED_ERRORS: ReadonlySet<SpeechRecognitionErrorCode> = new Set(['not-allowed', 'service-not-allowed', 'audio-capture']);

let currentRecognition: Recognition | null = null;

const getRecognitionConstructor = (): RecognitionConstructor | undefined => {
  const speechWindow = window as Window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
};

const toListenResult = (error: SpeechRecognitionErrorCode): ListenResult => {
  if (error === 'no-speech' || error === 'aborted') {
    return { status: error };
  }
  return { status: BLOCKED_ERRORS.has(error) ? 'blocked' : 'failed' };
};

export const isSpeechRecognitionSupported = (): boolean => getRecognitionConstructor() !== undefined;

export const stopListening = (): void => {
  if (!currentRecognition) {
    return;
  }

  currentRecognition.abort();
  currentRecognition = null;
};

export const listen = (lang: string): Promise<ListenResult> => {
  stopListening();

  const RecognitionClass = getRecognitionConstructor();

  if (!RecognitionClass) {
    return Promise.resolve({ status: 'failed' });
  }

  const recognition = new RecognitionClass();
  currentRecognition = recognition;
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = MAX_ALTERNATIVES;

  return new Promise((resolve) => {
    let result: ListenResult = { status: 'no-speech' };

    recognition.onresult = (event) => {
      const alternatives = event.results[0];
      const transcripts = alternatives
        ? Array.from({ length: alternatives.length }, (_, index) => alternatives[index]?.transcript ?? '').filter(Boolean)
        : [];
      result = transcripts.length > 0 ? { status: 'heard', transcripts } : { status: 'no-speech' };
    };
    recognition.onerror = (event) => {
      result = toListenResult(event.error);
    };
    recognition.onend = () => {
      if (currentRecognition === recognition) {
        currentRecognition = null;
      }
      resolve(result);
    };

    try {
      recognition.start();
    } catch {
      currentRecognition = null;
      resolve({ status: 'failed' });
    }
  });
};
