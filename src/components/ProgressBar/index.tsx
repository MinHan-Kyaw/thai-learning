interface ProgressBarProps {
  current: number;
  total: number;
  label: string;
}

const ProgressBar = ({ current, total, label }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex flex-1 items-center gap-3">
      <div
        className="h-4 flex-1 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div
          className="h-full rounded-[inherit] bg-brand-bright transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="min-w-14 text-right font-bold text-ink-muted" aria-hidden="true">
        {current} / {total}
      </span>
    </div>
  );
};

export default ProgressBar;
