import styles from './InlineFeedback.module.css';

interface InlineFeedbackProps {
  /** Whether the player's answer was correct */
  isCorrect: boolean;
  /** The correct answer to display when incorrect */
  correctAnswer: number;
}

/**
 * Compact inline feedback banner displayed in the formula area after answer submission.
 * Replaces FormulaDisplay during the feedback phase to prevent layout shift.
 * Uses triple indicator: color + icon + text (WCAG 1.4.1).
 */
export default function InlineFeedback({ isCorrect, correctAnswer }: InlineFeedbackProps) {
  return (
    <div
      className={`${styles.feedback} ${isCorrect ? styles.correct : styles.incorrect}`}
      role="status"
      aria-live="assertive"
    >
      <span className={styles.icon} aria-hidden="true">
        {isCorrect ? '✓' : '✗'}
      </span>
      <span className={styles.text}>
        {isCorrect ? 'Correct!' : 'Not quite!'}
      </span>
      {!isCorrect && (
        <span className={styles.answer}>
          The answer was {correctAnswer}
        </span>
      )}
    </div>
  );
}
