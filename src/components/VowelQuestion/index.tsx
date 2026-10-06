import { useEffect, useRef, type ReactNode } from 'react';

import { getVowelLabel } from '../../helpers/vowels';
import type { VowelQuestion as VowelQuestionType } from '../../types/learning';

interface VowelQuestionProps {
  question: VowelQuestionType;
  children: ReactNode;
}

const PROMPTS: Record<VowelQuestionType['kind'], string> = {
  spell: 'How is this written?',
  tone: 'Which tone is this?',
};

const VowelQuestion = ({ question, children }: VowelQuestionProps) => {
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
    <section className="flex flex-col items-center gap-4" aria-labelledby="vowel-question-prompt">
      <h2 id="vowel-question-prompt" className="rounded-xl text-center text-2xl font-extrabold" ref={headingRef} tabIndex={-1}>
        {PROMPTS[question.kind]}
      </h2>
      {question.kind === 'spell' ? (
        <p className="flex items-center gap-3 font-thai text-[2.5rem] leading-[1.4] font-medium" lang="th">
          <span className="grid min-h-20 min-w-20 place-items-center rounded-2xl border-2 border-line px-3 shadow-edge">
            {question.consonant.character}
          </span>
          +
          <span className="flex min-h-20 min-w-20 flex-col items-center justify-center rounded-2xl border-2 border-line px-3 shadow-edge">
            {getVowelLabel(question.vowel)}
            <span className="flex gap-2 pb-1 font-sans text-sm leading-tight text-ink-muted">
              <span className="font-bold" lang="en">
                {question.vowel.sound}
              </span>{' '}
              <span className="font-burmese" lang="my">
                {question.vowel.pronunciation}
              </span>
            </span>
          </span>
        </p>
      ) : (
        <p
          className="grid min-h-28 min-w-28 place-items-center rounded-3xl border-2 border-line px-4 font-thai text-[3.5rem] leading-[1.4] font-medium shadow-edge"
          lang="th"
        >
          {question.syllable}
        </p>
      )}
      {children}
    </section>
  );
};

export default VowelQuestion;
