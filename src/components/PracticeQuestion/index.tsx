import { useEffect, useRef, type ReactNode } from 'react';

import { assetUrl } from '../../helpers/assetUrl';
import type { AnswerMode, PracticeQuestion as PracticeQuestionType } from '../../types/learning';

interface PracticeQuestionProps {
  question: PracticeQuestionType;
  children: ReactNode;
}

const PROMPTS: Record<AnswerMode, string> = {
  select: 'Which word is this?',
  type: 'Type the Thai letter',
  speak: 'Say this word',
};

const PracticeQuestion = ({ question, children }: PracticeQuestionProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstQuestion = useRef(true);
  const { answer, mode } = question;

  useEffect(() => {
    if (isFirstQuestion.current) {
      isFirstQuestion.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [question.id]);

  return (
    <section className="flex flex-col items-center gap-3" aria-labelledby="practice-question-prompt">
      {answer.image && (
        <div className="grid aspect-square w-[min(100%,10.5rem)] place-items-center rounded-3xl border-2 border-line bg-surface p-3 shadow-edge md:w-68">
          <img className="size-full object-contain" src={assetUrl(answer.image)} alt={answer.meaning} lang="my" />
        </div>
      )}
      <h2 id="practice-question-prompt" className="rounded-xl text-center text-2xl font-extrabold" ref={headingRef} tabIndex={-1}>
        {PROMPTS[mode]}
      </h2>
      {mode === 'type' && (
        <p className="-mt-2 font-burmese text-[1.0625rem] leading-[1.8] text-ink-muted" lang="my">
          {answer.pronunciation}
        </p>
      )}
      {children}
    </section>
  );
};

export default PracticeQuestion;
