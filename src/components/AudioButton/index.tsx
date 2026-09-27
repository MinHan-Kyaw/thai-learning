import styles from './index.module.css';

interface AudioButtonProps {
  label: string;
  onPlay: () => void;
}

const AudioButton = ({ label, onPlay }: AudioButtonProps) => (
  <button type="button" className={styles.audioButton} aria-label={label} onClick={onPlay}>
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
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
