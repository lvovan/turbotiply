import type { GameRecord } from '../../../types/player';
import styles from './ProgressionGraph.module.css';

interface ProgressionGraphProps {
  history: GameRecord[];
}

const WIDTH = 300;
const HEIGHT = 100;
const PAD = 4;

/**
 * Renders a small inline SVG sparkline showing score progression
 * over the player's full game history.
 * Returns null if fewer than 2 data points.
 */
export default function ProgressionGraph({ history }: ProgressionGraphProps) {
  if (history.length < 2) return null;

  const scores = history.map((r) => r.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1; // avoid division by zero when all scores equal
  const count = scores.length;

  const points = scores
    .map((score, index) => {
      const x = (index / (count - 1)) * WIDTH;
      const y = PAD + ((max - score) / range) * (HEIGHT - 2 * PAD);
      return `${x},${y}`;
    })
    .join(' ');

  const firstScore = scores[0];
  const lastScore = scores[count - 1];
  const label = `Score progression: ${count} games, from ${firstScore} to ${lastScore}`;

  return (
    <svg
      className={styles.graph}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
