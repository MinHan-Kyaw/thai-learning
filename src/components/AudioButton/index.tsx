interface AudioButtonProps {
  label: string;
  onPlay: () => void;
}

const AudioButton = ({ label, onPlay }: AudioButtonProps) => (
  <button
    type="button"
    className="inline-grid size-11 cursor-pointer place-items-center rounded-full border-2 border-brand-border bg-surface p-0 text-brand shadow-edge-brand-soft hover:bg-brand-light active:translate-y-0.5 active:shadow-none"
    aria-label={label}
    onClick={onPlay}
  >
    <svg className="size-5.5" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4z" />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
      />
    </svg>
  </button>
);

export default AudioButton;
