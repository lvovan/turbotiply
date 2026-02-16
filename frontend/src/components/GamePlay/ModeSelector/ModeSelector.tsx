import styles from './ModeSelector.module.css';

interface ModeSelectorProps {
  onStartPlay: () => void;
  onStartImprove: () => void;
  trickyNumbers: number[];
  showImprove: boolean;
  showEncouragement: boolean;
}

/**
 * Game mode selection: Play (always) and Improve (conditional).
 * Play shows "Go for a high score!" descriptor.
 * Improve shows tricky numbers from recent game analysis.
 * Encouraging message shown when player has no challenging pairs.
 */
export default function ModeSelector({
  onStartPlay,
  onStartImprove,
  trickyNumbers,
  showImprove,
  showEncouragement,
}: ModeSelectorProps) {
  const MAX_DISPLAY = 8;
  const sortedNumbers = [...trickyNumbers].sort((a, b) => a - b);
  const displayNumbers = sortedNumbers.slice(0, MAX_DISPLAY);
  const hasMore = sortedNumbers.length > MAX_DISPLAY;
  const numbersText = displayNumbers.join(', ') + (hasMore ? ', …' : '');

  return (
    <div className={styles.container} role="group" aria-label="Game mode selection">
      <button
        className={styles.playButton}
        onClick={onStartPlay}
        aria-label="Play — Go for a high score!"
      >
        <span className={styles.buttonLabel}>Play</span>
        <span className={styles.descriptor}>Go for a high score!</span>
      </button>

      {showImprove && trickyNumbers.length > 0 && (
        <button
          className={styles.improveButton}
          onClick={onStartImprove}
          aria-label={`Improve — Level up your tricky numbers: ${numbersText}`}
        >
          <span className={styles.buttonLabel}>Improve</span>
          <span className={styles.descriptor}>
            Level up your tricky numbers: {numbersText}
          </span>
        </button>
      )}

      {showEncouragement && !showImprove && (
        <p className={styles.encouragement}>
          No tricky numbers right now — keep playing to unlock Improve mode!
        </p>
      )}
    </div>
  );
}
