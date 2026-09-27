import { useEffect, useRef } from 'react';

import Button from '../Button';
import ButtonLink from '../Button/ButtonLink';

import styles from './index.module.css';

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
    <section className={styles.summary} aria-labelledby="practice-summary-title">
      <h1 id="practice-summary-title" className={styles.title} ref={headingRef} tabIndex={-1}>
        Practice complete!
      </h1>
      <div className={styles.scoreCard}>
        <span className={styles.scoreLabel}>Your score</span>
        <span className={styles.score}>
          {score} / {total}
        </span>
      </div>
      <p className={styles.message}>{getMessage(score, total)}</p>
      <div className={styles.actions}>
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
