import { useEffect, useReducer, useRef, useState } from 'react';

import AnswerOptions from '../../components/AnswerOptions';
import PracticeFeedback from '../../components/PracticeFeedback';
import PracticeQuestion from '../../components/PracticeQuestion';
import PracticeSummary from '../../components/PracticeSummary';
import ProgressBar from '../../components/ProgressBar';
import type { AnswerResult } from '../../components/ResultIcon';
import SpokenAnswer, { type SpeechStatus } from '../../components/SpokenAnswer';
import Toggle from '../../components/Toggle';
import TypedAnswer from '../../components/TypedAnswer';
import { consonants } from '../../data';
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
import { isSpeechRecognitionSupported, listen, stopListening } from '../../services/speech';
import type { AnswerMode, VocabularyItem } from '../../types/learning';

const SPEECH_LANGUAGE = 'th-TH';

const buildQuestions = (modes: readonly AnswerMode[]) => generatePracticeQuestions(getVocabulary(consonants), { modes });

const playWordAudio = (word: VocabularyItem) => {
  if (word.audio) {
    void playAudio(assetUrl(word.audio));
  }
};

const Practice = () => {
  const [advanced, setAdvanced] = useState(false);
  const [speakingSkipped, setSpeakingSkipped] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('idle');
  const [state, dispatch] = useReducer(practiceReducer, undefined, () => createPracticeState(buildQuestions(['select'])));
  const listenRequest = useRef(0);
  const question = getCurrentQuestion(state);
  const speechAvailable = isSpeechRecognitionSupported() && !speakingSkipped;

  useEffect(
    () => () => {
      listenRequest.current += 1;
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

  const handleAdvancedChange = (checked: boolean) => {
    resetSpeech();
    setAdvanced(checked);
    const modes = getAnswerModes({ advanced: checked, speech: speechAvailable });
    dispatch({ type: 'SET_ANSWER_MODES', modes: assignAnswerModes(state.questions.length, modes) });
  };

  if (state.questions.length === 0) {
    return (
      <p className="mx-auto my-8 max-w-md text-center text-ink-muted">
        There is not enough vocabulary to start a practice session yet.
      </p>
    );
  }

  if (isPracticeComplete(state) || !question) {
    return (
      <PracticeSummary
        score={state.score}
        total={state.questions.length}
        onRestart={() =>
          dispatch({ type: 'RESTART', questions: buildQuestions(getAnswerModes({ advanced, speech: speechAvailable })) })
        }
      />
    );
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
      stopAudio();
      resetSpeech();
      dispatch({ type: 'NEXT_QUESTION' });
      return;
    }
    if (!hasAnswer(question, state)) {
      return;
    }
    resetSpeech();
    dispatch({ type: 'SUBMIT_ANSWER' });
    if (question.mode !== 'select') {
      playWordAudio(question.answer);
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
    setSpeakingSkipped(true);
    const fallbackModes = assignAnswerModes(state.questions.length, getAnswerModes({ advanced, speech: false }));
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
          description={speechAvailable ? 'Also type and speak your answers' : 'Also type your answers'}
          checked={advanced}
          onChange={handleAdvancedChange}
        />
      </div>
      <PracticeQuestion question={question} onPlayAudio={() => playWordAudio(question.answer)}>
        {question.mode === 'select' && (
          <AnswerOptions
            question={question}
            selectedAnswerId={state.selectedAnswerId}
            answered={state.answered}
            onSelectAnswer={handleSelectAnswer}
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
        actionLabel={actionLabel}
        actionDisabled={!state.answered && !hasAnswer(question, state)}
        onAction={handleAction}
      />
    </div>
  );
};

export default Practice;
