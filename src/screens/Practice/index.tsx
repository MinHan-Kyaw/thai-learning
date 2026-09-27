import { useEffect, useReducer } from 'react';

import type { AnswerResult } from '../../components/AnswerOption';
import PracticeFeedback from '../../components/PracticeFeedback';
import PracticeQuestion from '../../components/PracticeQuestion';
import PracticeSummary from '../../components/PracticeSummary';
import ProgressBar from '../../components/ProgressBar';
import { consonants } from '../../data';
import { assetUrl } from '../../helpers/assetUrl';
import {
  createPracticeState,
  generatePracticeQuestions,
  getCurrentQuestion,
  isAnswerCorrect,
  isPracticeComplete,
  practiceReducer,
} from '../../helpers/practice';
import { getVocabulary } from '../../helpers/vocabulary';
import { playAudio, stopAudio } from '../../services/audio';
import type { VocabularyItem } from '../../types/learning';

import styles from './index.module.css';

const buildQuestions = () => generatePracticeQuestions(getVocabulary(consonants));

const Practice = () => {
  const [state, dispatch] = useReducer(practiceReducer, undefined, () => createPracticeState(buildQuestions()));
  const question = getCurrentQuestion(state);

  useEffect(() => () => stopAudio(), []);

  if (state.questions.length === 0) {
    return <p className={styles.empty}>There is not enough vocabulary to start a practice session yet.</p>;
  }

  if (isPracticeComplete(state) || !question) {
    return (
      <PracticeSummary
        score={state.score}
        total={state.questions.length}
        onRestart={() => dispatch({ type: 'RESTART', questions: buildQuestions() })}
      />
    );
  }

  const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;
  const result: AnswerResult | null = state.answered
    ? isAnswerCorrect(question, state.selectedAnswerId)
      ? 'correct'
      : 'incorrect'
    : null;
  const actionLabel = !state.answered ? 'Next' : isLastQuestion ? 'See results' : 'Continue';

  const handleSelectAnswer = (answer: VocabularyItem) => {
    dispatch({ type: 'SELECT_ANSWER', answerId: answer.id });

    if (answer.audio) {
      void playAudio(assetUrl(answer.audio));
    }
  };

  const handleAction = () => {
    if (state.answered) {
      stopAudio();
      dispatch({ type: 'NEXT_QUESTION' });
      return;
    }
    dispatch({ type: 'SUBMIT_ANSWER' });
  };

  return (
    <div className={styles.practice}>
      <h1 className="visuallyHidden">Practice</h1>
      <ProgressBar
        current={state.currentQuestionIndex + (state.answered ? 1 : 0)}
        total={state.questions.length}
        label="Practice progress"
      />
      <PracticeQuestion
        question={question}
        selectedAnswerId={state.selectedAnswerId}
        answered={state.answered}
        onSelectAnswer={handleSelectAnswer}
      />
      <PracticeFeedback
        result={result}
        correctAnswer={question.answer}
        actionLabel={actionLabel}
        actionDisabled={!state.answered && state.selectedAnswerId === null}
        onAction={handleAction}
      />
    </div>
  );
};

export default Practice;
