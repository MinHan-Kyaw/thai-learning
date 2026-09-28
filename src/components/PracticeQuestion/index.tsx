import { useEffect, useRef } from 'react';

import { assetUrl } from '../../helpers/assetUrl';
import { getLetterWithWord } from '../../helpers/vocabulary';
import type { PracticeQuestion as PracticeQuestionType, VocabularyItem } from '../../types/learning';
import AnswerOption, { type AnswerResult } from '../AnswerOption';

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
    <section className="flex flex-col items-center gap-3" aria-labelledby="practice-question-prompt">
      {question.answer.image && (
        <div className="grid aspect-square w-[min(100%,10.5rem)] place-items-center rounded-3xl border-2 border-line bg-surface p-3 shadow-edge md:w-68">
          <img
            className="size-full object-contain"
            src={assetUrl(question.answer.image)}
            alt={question.answer.meaning}
            lang="my"
          />
        </div>
      )}
      <h2 id="practice-question-prompt" className="rounded-xl text-center text-2xl font-extrabold" ref={headingRef} tabIndex={-1}>
        Which word is this?
      </h2>
      <ul className="grid w-full gap-3 md:grid-cols-3" aria-label="Answer options" role="list">
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
