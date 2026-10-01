import type { Tone } from '../../types/learning';

interface ToneContourProps {
  pitch: Tone['pitch'];
}

const PITCH_LEVELS = [1, 2, 3, 4, 5];

// Pitch 5 is drawn at the top of the 48 × 32 box, pitch 1 at the bottom.
const toY = (level: number) => 28 - (level - 1) * 6;

const ToneContour = ({ pitch: [start, end] }: ToneContourProps) => (
  <svg className="h-8 w-12 shrink-0" viewBox="0 0 48 32" aria-hidden="true" focusable="false" data-pitch={`${start}${end}`}>
    {PITCH_LEVELS.map((level) => (
      <line key={level} x1="2" x2="46" y1={toY(level)} y2={toY(level)} className="stroke-line" strokeWidth="1" />
    ))}
    <path
      d={`M4 ${toY(start)} C20 ${toY(start)} 28 ${toY(end)} 44 ${toY(end)}`}
      className="stroke-brand"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export default ToneContour;
