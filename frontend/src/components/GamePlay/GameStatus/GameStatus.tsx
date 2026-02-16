import type { RefObject } from 'react';
import styles from './GameStatus.module.css';
import CountdownBar from '../CountdownBar/CountdownBar';
import type { GameMode } from '../../../types/player';

interface GameStatusProps {
  roundNumber: number;
  totalRounds: number;
  score: number;
  timerRef: RefObject<HTMLElement | null>;
  barRef: RefObject<HTMLDivElement | null>;
  isReplay: boolean;
  currentPhase: 'input' | 'feedback';
  isCorrect: boolean | null;
  correctAnswer: number | null;
  completedRound: number;
  gameMode?: GameMode;
}

/**
 * Displays round counter, running score, and timer during gameplay.
 * During feedback phase, swaps to show result message with completion count.
 * Shows "Replay" indicator when in replay phase (per FR-019).
 * Shows "Practice" instead of score when in improve mode.
 * Renders a countdown progress bar below the status row.
 */
export default function GameStatus({
  roundNumber,
  totalRounds,
  score,
  timerRef,
  barRef,
  isReplay,
  currentPhase,
  isCorrect,
  correctAnswer,
  completedRound,
  gameMode = 'play',
}: GameStatusProps) {
  const isFeedback = currentPhase === 'feedback';

  const rootClassName = [
    styles.status,
    isFeedback && isCorrect === true && styles.feedbackCorrect,
    isFeedback && isCorrect === false && styles.feedbackIncorrect,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName} aria-label="Game status">
      {isFeedback ? (
        <div className={styles.feedbackContent} role="status" aria-live="assertive">
          <div className={styles.feedbackMain}>
            <span className={styles.feedbackIcon} aria-hidden="true">
              {isCorrect ? '✓' : '✗'}
            </span>
            <span className={styles.feedbackText}>
              {isCorrect ? 'Correct!' : 'Not quite!'}
            </span>
            {!isCorrect && correctAnswer !== null && (
              <span className={styles.feedbackAnswer}>
                The answer was {correctAnswer}
              </span>
            )}
          </div>
          <span className={styles.completionCount}>
            {isReplay ? 'Replay' : 'Round'} {completedRound} of {totalRounds} completed
          </span>
        </div>
      ) : (
        <>
          <div className={styles.roundInfo}>
            {isReplay ? (
              <span className={styles.replayBadge}>Replay</span>
            ) : (
              <span>Round {roundNumber} of {totalRounds}</span>
            )}
          </div>
          <div className={styles.score}>
            {gameMode === 'improve' ? (
              <span className={styles.practiceBadge}>Practice</span>
            ) : (
              <>
                <span className={styles.scoreLabel}>Score:</span>{' '}
                <span className={styles.scoreValue}>{score}</span>
              </>
            )}
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
        </>
      )}
    </div>
  );
}
