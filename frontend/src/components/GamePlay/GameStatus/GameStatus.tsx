import type { RefObject } from 'react';
import styles from './GameStatus.module.css';

interface GameStatusProps {
  roundNumber: number;
  totalRounds: number;
  score: number;
  timerRef: RefObject<HTMLElement | null>;
  isReplay: boolean;
}

/**
 * Displays round counter, running score, and timer during gameplay.
 * Shows "Replay" indicator when in replay phase (per FR-019).
 */
export default function GameStatus({
  roundNumber,
  totalRounds,
  score,
  timerRef,
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
          0.0s
        </span>
      </div>
    </div>
  );
}
