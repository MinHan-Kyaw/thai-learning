import { useEffect, useRef } from 'react';

import { assetUrl } from '../../helpers/assetUrl';
import { getLetterWithWord } from '../../helpers/vocabulary';
import type { PracticeQuestion as PracticeQuestionType, VocabularyItem } from '../../types/learning';
import AnswerOption, { type AnswerResult } from '../AnswerOption';

import styles from './index.module.css';

interface PracticeQuestionProps {
  question: PracticeQuestionType;
  selectedAnswerId: string | null;
  answered: boolean;
  onSelectAnswer: (answer: VocabularyItem) => void;
}

const getOptionResult = (
  option: VocabularyItem,
  question: PracticeQuestionType,
  selectedAnswerId: string | null,
  answered: boolean
): AnswerResult | null => {
  if (!answered) {
    return null;
  }
  if (option.id === question.answer.id) {
    return 'correct';
  }
  return option.id === selectedAnswerId ? 'incorrect' : null;
};

const PracticeQuestion = ({ question, selectedAnswerId, answered, onSelectAnswer }: PracticeQuestionProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstQuestion = useRef(true);

  useEffect(() => {
    if (isFirstQuestion.current) {
      isFirstQuestion.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [question.id]);

  return (
    <section className={styles.question} aria-labelledby="practice-question-prompt">
      {question.answer.image && (
        <div className={styles.imageFrame}>
          <img className={styles.image} src={assetUrl(question.answer.image)} alt={question.answer.meaning} lang="my" />
        </div>
      )}
      <h2 id="practice-question-prompt" className={styles.prompt} ref={headingRef} tabIndex={-1}>
        Which word is this?
      </h2>
      <ul className={styles.options} aria-label="Answer options" role="list">
        {question.options.map((option) => (
          <li key={option.id}>
            <AnswerOption
              thai={getLetterWithWord(option)}
              pronunciation={option.pronunciation}
              selected={option.id === selectedAnswerId}
              result={getOptionResult(option, question, selectedAnswerId, answered)}
              disabled={answered}
              onSelect={() => onSelectAnswer(option)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PracticeQuestion;
