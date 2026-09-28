import { classNames } from '../../helpers/classNames';
import { getLetterWithWord } from '../../helpers/vocabulary';
import type { VocabularyItem } from '../../types/learning';
import ResultIcon, { type AnswerResult } from '../ResultIcon';

export type SpeechStatus = 'idle' | 'listening' | 'no-speech' | 'blocked' | 'failed';

interface SpokenAnswerProps {
  transcript: string;
  status: SpeechStatus;
  answered: boolean;
  result: AnswerResult | null;
  correctAnswer: VocabularyItem;
  onListen: () => void;
  onSkip: () => void;
}

const STATUS_MESSAGES: Partial<Record<SpeechStatus, string>> = {
  listening: 'Listening…',
  'no-speech': "We didn't catch that. Tap the microphone and try again.",
  blocked: 'Microphone access is blocked. Allow it in your browser settings, or skip speaking for now.',
  failed: 'Speech recognition is not working right now. Try again, or skip speaking for now.',
};

const SpokenAnswer = ({ transcript, status, answered, result, correctAnswer, onListen, onSkip }: SpokenAnswerProps) => {
  const listening = status === 'listening';

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        type="button"
        className={classNames(
          'grid size-20 cursor-pointer place-items-center rounded-full border-2 text-white transition-[transform,box-shadow,background-color] duration-100 enabled:active:translate-y-[3px] disabled:cursor-default disabled:border-transparent disabled:bg-line disabled:text-ink-muted disabled:shadow-edge-strong',
          listening
            ? 'animate-pulse border-transparent bg-selected shadow-edge-selected'
            : 'border-transparent bg-brand shadow-edge-brand-dark hover:bg-brand-dark'
        )}
        aria-label={listening ? 'Stop listening' : 'Speak your answer'}
        aria-pressed={listening}
        disabled={answered}
        data-status={status}
        onClick={onListen}
      >
        <svg className="size-9" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
          <path
            d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </button>
      <p className="min-h-6 text-center text-ink-muted" aria-live="polite">
        {!answered && STATUS_MESSAGES[status]}
      </p>
      {transcript && (
        <p className="flex items-baseline gap-2 text-ink-muted">
          You said:{' '}
          <span className="font-thai text-xl font-medium text-ink" lang="th">
            {transcript}
          </span>
          {result && <ResultIcon result={result} className="self-center" />}
        </p>
      )}
      {result === 'incorrect' && (
        <p className="flex items-baseline gap-2 text-ink-muted">
          Correct answer:{' '}
          <span className="font-thai text-xl font-medium text-ink" lang="th">
            {getLetterWithWord(correctAnswer)}
          </span>
        </p>
      )}
      {!answered && (
        <button
          type="button"
          className="min-h-11 cursor-pointer rounded-xl px-3 font-bold text-brand underline-offset-4 hover:underline"
          onClick={onSkip}
        >
          Can&apos;t speak now
        </button>
      )}
    </div>
  );
};

export default SpokenAnswer;
