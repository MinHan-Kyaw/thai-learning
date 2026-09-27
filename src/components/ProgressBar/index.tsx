import styles from './index.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  label: string;
}

const ProgressBar = ({ current, total, label }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={styles.progress}>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
      <span className={styles.label} aria-hidden="true">
        {current} / {total}
      </span>
    </div>
  );
};

export default ProgressBar;
