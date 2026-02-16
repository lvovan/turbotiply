import type { RefObject } from 'react';
import styles from './GameStatus.module.css';
import CountdownBar from '../CountdownBar/CountdownBar';

interface GameStatusProps {
  roundNumber: number;
  totalRounds: number;
  score: number;
  timerRef: RefObject<HTMLElement | null>;
  barRef: RefObject<HTMLDivElement | null>;
  isReplay: boolean;
}

/**
 * Displays round counter, running score, and timer during gameplay.
 * Shows "Replay" indicator when in replay phase (per FR-019).
 * Renders a countdown progress bar below the status row.
 */
export default function GameStatus({
  roundNumber,
  totalRounds,
  score,
  timerRef,
  barRef,
  isReplay,
}: GameStatusProps) {
  return (
    <div className={styles.status} aria-label="Game status">
      <div className={styles.roundInfo}>
        {isReplay ? (
          <span className={styles.replayBadge}>Replay</span>
        ) : (
          <span>Round {roundNumber} of {totalRounds}</span>
        )}
      </div>
      <div className={styles.score}>
        <span className={styles.scoreLabel}>Score:</span>{' '}
        <span className={styles.scoreValue}>{score}</span>
      </div>
      <div className={styles.timer}>
        <span
          ref={timerRef as RefObject<HTMLSpanElement>}
          className="timer"
          data-testid="timer"
        >
          5.0s
        </span>
      </div>
      <CountdownBar barRef={barRef} />
    </div>
  );
}
