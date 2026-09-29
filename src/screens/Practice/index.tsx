import { useEffect, useReducer, useRef, useState } from 'react';

import AnswerOptions from '../../components/AnswerOptions';
import ClassOptions from '../../components/ClassOptions';
import PracticeFeedback from '../../components/PracticeFeedback';
import PracticeQuestion from '../../components/PracticeQuestion';
import PracticeSettings from '../../components/PracticeSettings';
import PracticeSummary from '../../components/PracticeSummary';
import ProgressBar from '../../components/ProgressBar';
import type { AnswerResult } from '../../components/ResultIcon';
import SpokenAnswer, { type SpeechStatus } from '../../components/SpokenAnswer';
import Toggle from '../../components/Toggle';
import TypedAnswer from '../../components/TypedAnswer';
import { MAX_QUESTION_COUNT, MIN_QUESTION_COUNT, QUESTION_COUNT, QUESTION_COUNT_STEP } from '../../constants/practice';
import { consonantClasses, consonants } from '../../data';
import { assetUrl } from '../../helpers/assetUrl';
import {
  assignAnswerModes,
  createPracticeState,
  generatePracticeQuestions,
  getAnswerModes,
  getCurrentQuestion,
  hasAnswer,
  isAnswerCorrect,
  isPracticeComplete,
  practiceReducer,
} from '../../helpers/practice';
import { pickTranscript } from '../../helpers/thaiAnswer';
import { getVocabulary } from '../../helpers/vocabulary';
import { playAudio, stopAudio } from '../../services/audio';
import { FEEDBACK_SOUND_DURATION_MS, playFeedbackSound } from '../../services/sound';
import { isSpeechRecognitionSupported, listen, stopListening } from '../../services/speech';
import type { AnswerMode, VocabularyItem } from '../../types/learning';

const SPEECH_LANGUAGE = 'th-TH';

const buildQuestions = (modes: readonly AnswerMode[], questionCount: number) =>
  generatePracticeQuestions(getVocabulary(consonants), { modes, questionCount });

const playWordAudio = (word: VocabularyItem) => {
  if (word.audio) {
    void playAudio(assetUrl(word.audio));
  }
};

type EnabledModes = Partial<Record<AnswerMode, boolean>>;

const QUESTION_TYPES: { mode: AnswerMode; label: string }[] = [
  { mode: 'speak', label: 'Audio' },
  { mode: 'type', label: 'Type' },
  { mode: 'class', label: 'Group' },
];

const Practice = () => {
  const [advanced, setAdvanced] = useState(false);
  const [enabledModes, setEnabledModes] = useState<EnabledModes>({ speak: true, type: true, class: true });
  const [questionCount, setQuestionCount] = useState(QUESTION_COUNT);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('idle');
  const [state, dispatch] = useReducer(practiceReducer, undefined, () =>
    createPracticeState(buildQuestions(['select'], QUESTION_COUNT))
  );
  const listenRequest = useRef(0);
  const wordAudioTimer = useRef<number | undefined>(undefined);
  const question = getCurrentQuestion(state);
  const speechSupported = isSpeechRecognitionSupported();
  const withSpeechSupport = (modes: EnabledModes): EnabledModes => ({ ...modes, speak: modes.speak && speechSupported });

  useEffect(
    () => () => {
      listenRequest.current += 1;
      window.clearTimeout(wordAudioTimer.current);
      stopAudio();
      stopListening();
    },
    []
  );

  const resetSpeech = () => {
    listenRequest.current += 1;
    stopListening();
    setSpeechStatus('idle');
  };

  const restart = (changes: { advanced?: boolean; enabledModes?: EnabledModes; questionCount?: number } = {}) => {
    window.clearTimeout(wordAudioTimer.current);
    stopAudio();
    resetSpeech();
    const answerModes = getAnswerModes({
      advanced: changes.advanced ?? advanced,
      enabled: withSpeechSupport(changes.enabledModes ?? enabledModes),
    });
    dispatch({ type: 'RESTART', questions: buildQuestions(answerModes, changes.questionCount ?? questionCount) });
  };

  const handleAdvancedChange = (checked: boolean) => {
    setAdvanced(checked);
    restart({ advanced: checked });
  };

  const handleQuestionTypeChange = (mode: AnswerMode, checked: boolean) => {
    const modes = { ...enabledModes, [mode]: checked };
    setEnabledModes(modes);
    restart({ enabledModes: modes });
  };

  const handleQuestionCountChange = (count: number) => {
    setQuestionCount(count);
    restart({ questionCount: count });
  };

  if (state.questions.length === 0) {
    return (
      <p className="mx-auto my-8 max-w-md text-center text-ink-muted">
        There is not enough vocabulary to start a practice session yet.
      </p>
    );
  }

  if (isPracticeComplete(state) || !question) {
    return <PracticeSummary score={state.score} total={state.questions.length} onRestart={() => restart()} />;
  }

  const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;
  const result: AnswerResult | null = state.answered ? (isAnswerCorrect(question, state) ? 'correct' : 'incorrect') : null;
  const actionLabel = !state.answered ? 'Next' : isLastQuestion ? 'See results' : 'Continue';

  const handleSelectAnswer = (answer: VocabularyItem) => {
    dispatch({ type: 'SELECT_ANSWER', answerId: answer.id });
    playWordAudio(answer);
  };

  const handleAction = () => {
    if (state.answered) {
      window.clearTimeout(wordAudioTimer.current);
      stopAudio();
      resetSpeech();
      dispatch({ type: 'NEXT_QUESTION' });
      return;
    }
    if (!hasAnswer(question, state)) {
      return;
    }
    resetSpeech();
    playFeedbackSound(isAnswerCorrect(question, state) ? 'correct' : 'incorrect');
    dispatch({ type: 'SUBMIT_ANSWER' });
    if (question.mode !== 'select') {
      const { answer } = question;
      wordAudioTimer.current = window.setTimeout(() => playWordAudio(answer), FEEDBACK_SOUND_DURATION_MS);
    }
  };

  const handleListen = async () => {
    if (speechStatus === 'listening') {
      resetSpeech();
      return;
    }

    stopAudio();
    const request = listenRequest.current + 1;
    listenRequest.current = request;
    setSpeechStatus('listening');

    const heard = await listen(SPEECH_LANGUAGE);

    if (listenRequest.current !== request || heard.status === 'aborted') {
      return;
    }
    if (heard.status === 'heard') {
      dispatch({ type: 'ENTER_RESPONSE', response: pickTranscript(question.answer, heard.transcripts) });
      setSpeechStatus('idle');
      return;
    }
    setSpeechStatus(heard.status);
  };

  const handleSkipSpeaking = () => {
    resetSpeech();
    const modes = { ...enabledModes, speak: false };
    setEnabledModes(modes);
    const fallbackModes = assignAnswerModes(state.questions.length, getAnswerModes({ advanced, enabled: modes }));
    dispatch({
      type: 'SET_ANSWER_MODES',
      modes: state.questions.map((item, index) => (item.mode === 'speak' ? (fallbackModes[index] ?? 'select') : item.mode)),
    });
  };

  return (
    <div className="mx-auto flex max-w-[42rem] flex-col">
      <h1 className="sr-only">Practice</h1>
      <div className="mb-4 flex items-center gap-3">
        <ProgressBar
          current={state.currentQuestionIndex + (state.answered ? 1 : 0)}
          total={state.questions.length}
          label="Practice progress"
        />
        <Toggle
          label="Advanced"
          description="Mix in audio, typing and group questions"
          checked={advanced}
          onChange={handleAdvancedChange}
        />
        <PracticeSettings
          questionCount={{
            value: questionCount,
            min: MIN_QUESTION_COUNT,
            max: MAX_QUESTION_COUNT,
            step: QUESTION_COUNT_STEP,
          }}
          onQuestionCountChange={handleQuestionCountChange}
          questionTypes={
            advanced
              ? QUESTION_TYPES.map(({ mode, label }) => ({
                  mode,
                  label,
                  checked: Boolean(enabledModes[mode]),
                  unavailable: mode === 'speak' && !speechSupported,
                }))
              : undefined
          }
          onQuestionTypeChange={handleQuestionTypeChange}
        />
      </div>
      <PracticeQuestion question={question}>
        {question.mode === 'select' && (
          <AnswerOptions
            question={question}
            selectedAnswerId={state.selectedAnswerId}
            answered={state.answered}
            onSelectAnswer={handleSelectAnswer}
          />
        )}
        {question.mode === 'class' && (
          <ClassOptions
            classes={consonantClasses}
            correctClassId={question.answer.consonantClass}
            selectedClassId={state.response}
            answered={state.answered}
            onSelect={(classId) => dispatch({ type: 'ENTER_RESPONSE', response: classId })}
          />
        )}
        {question.mode === 'type' && (
          <TypedAnswer
            value={state.response}
            answered={state.answered}
            result={result}
            correctAnswer={question.answer}
            onChange={(response) => dispatch({ type: 'ENTER_RESPONSE', response })}
            onSubmit={handleAction}
          />
        )}
        {question.mode === 'speak' && (
          <SpokenAnswer
            transcript={state.response}
            status={speechStatus}
            answered={state.answered}
            result={result}
            correctAnswer={question.answer}
            onListen={() => void handleListen()}
            onSkip={handleSkipSpeaking}
          />
        )}
      </PracticeQuestion>
      <PracticeFeedback
        result={result}
        correctAnswer={question.answer}
        correctClass={
          question.mode === 'class'
            ? consonantClasses.find((consonantClass) => consonantClass.id === question.answer.consonantClass)
            : undefined
        }
        actionLabel={actionLabel}
        actionDisabled={!state.answered && !hasAnswer(question, state)}
        onAction={handleAction}
      />
    </div>
  );
};

export default Practice;
