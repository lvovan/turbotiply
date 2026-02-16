import type { GameRecord } from '../../../types/player';
import styles from './ProgressionGraph.module.css';

interface ProgressionGraphProps {
  history: GameRecord[];
}

/** Maximum number of games displayed on the X-axis */
const MAX_GAMES = 10;
/** Minimum number of data points required to render the chart */
const MIN_GAMES = 2;
/** Fixed Y-axis floor */
const Y_MIN = 0;
/** Fixed Y-axis ceiling */
const Y_MAX = 50;
/** Y-axis positions for guide lines and labels */
const GUIDE_VALUES = [0, 10, 20, 30, 40, 50];
/** SVG units per game column on the X-axis */
const UNIT_WIDTH = 30;
/** Left margin in SVG units reserved for Y-axis labels */
const Y_LABEL_GUTTER = 24;
/** Total chart height in SVG units */
const CHART_HEIGHT = 100;
/** Padding at top and bottom of the plot area in SVG units */
const PAD = 4;

/** Map a score value (0–50) to a Y coordinate in SVG units */
function scoreToY(score: number): number {
  const clamped = Math.max(Y_MIN, Math.min(Y_MAX, score));
  return PAD + (1 - clamped / Y_MAX) * (CHART_HEIGHT - 2 * PAD);
}

/** Map a game index (0-based) to an X coordinate (center of column) in SVG units */
function gameToX(index: number): number {
  return Y_LABEL_GUTTER + (index + 0.5) * UNIT_WIDTH;
}

/**
 * Renders a small inline SVG sparkline showing score progression
 * over the player's full game history.
 * Returns null if fewer than 2 data points.
 */
export default function ProgressionGraph({ history }: ProgressionGraphProps) {
  if (history.length < MIN_GAMES) return null;

  // Slice to last MAX_GAMES records
  const recent = history.slice(-MAX_GAMES);
  const scores = recent.map((r) => r.score);
  const count = scores.length;

  // Dynamic viewBox width
  const viewWidth = Y_LABEL_GUTTER + count * UNIT_WIDTH;

  // Build polyline points using coordinate helpers
  const points = scores.map((s, i) => `${gameToX(i)},${scoreToY(s)}`).join(' ');

  const firstScore = scores[0];
  const lastScore = scores[count - 1];
  const label = `Score progression: ${count} games, from ${firstScore} to ${lastScore}, scale ${Y_MIN} to ${Y_MAX}`;

  // Axis endpoints
  const xAxisY = scoreToY(Y_MIN); // bottom of plot area
  const yAxisX = Y_LABEL_GUTTER; // left edge of plot area

  return (
    <svg
      className={styles.graph}
      viewBox={`0 0 ${viewWidth} ${CHART_HEIGHT}`}
      preserveAspectRatio="xMinYMid meet"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <g aria-hidden="true">
        {/* Y-axis */}
        <line
          className={styles.axis}
          x1={yAxisX}
          y1={scoreToY(Y_MAX)}
          x2={yAxisX}
          y2={xAxisY}
        />
        {/* X-axis */}
        <line
          className={styles.axis}
          x1={yAxisX}
          y1={xAxisY}
          x2={viewWidth}
          y2={xAxisY}
        />
        {/* Guide lines & labels */}
        {GUIDE_VALUES.map((v) => (
          <g key={`guide-${v}`}>
            <line
              className={styles.guideLine}
              x1={yAxisX}
              y1={scoreToY(v)}
              x2={viewWidth}
              y2={scoreToY(v)}
            />
            <text
              className={styles.axisLabel}
              x={yAxisX - 3}
              y={scoreToY(v)}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {v}
            </text>
          </g>
        ))}
        {/* Tick marks on X-axis */}
        {scores.map((_, i) => {
          const tx = gameToX(i);
          return (
            <line
              key={`tick-${i}`}
              className={styles.tickMark}
              x1={tx}
              y1={xAxisY}
              x2={tx}
              y2={xAxisY + 4}
            />
          );
        })}
      </g>
      <polyline
        className={styles.dataLine}
        aria-hidden="true"
        points={points}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
