import { useEffect, useRef } from 'react';

import Button from '../Button';
import ButtonLink from '../Button/ButtonLink';

interface PracticeSummaryProps {
  score: number;
  total: number;
  onRestart: () => void;
}

const getMessage = (score: number, total: number): string => {
  const ratio = total > 0 ? score / total : 0;

  if (ratio === 1) {
    return 'Perfect score! Every answer was right.';
  }
  if (ratio >= 0.7) {
    return 'Great work! You are getting the hang of it.';
  }
  if (ratio >= 0.4) {
    return 'Nice effort! A little more practice will help.';
  }
  return 'Keep going! Practice makes progress.';
};

const PracticeSummary = ({ score, total, onRestart }: PracticeSummaryProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      className="mx-auto mt-8 flex max-w-md flex-col items-center gap-4 text-center"
      aria-labelledby="practice-summary-title"
    >
      <h1 id="practice-summary-title" className="rounded-xl text-[2rem] font-extrabold text-brand" ref={headingRef} tabIndex={-1}>
        Practice complete!
      </h1>
      <div className="flex w-full flex-col items-center rounded-3xl border-2 border-brand-border bg-brand-light p-6 shadow-edge-brand-soft">
        <span className="text-[0.8125rem] font-bold tracking-[0.05em] text-ink-muted uppercase">Your score</span>
        <span className="text-5xl leading-[1.2] font-extrabold">
          {score} / {total}
        </span>
      </div>
      <p className="text-lg">{getMessage(score, total)}</p>
      <div className="mt-2 grid w-full gap-3">
        <Button fullWidth onClick={onRestart}>
          Practice again
        </Button>
        <ButtonLink to="/consonants" variant="secondary" fullWidth>
          Explore consonants
        </ButtonLink>
      </div>
    </section>
  );
};

export default PracticeSummary;
