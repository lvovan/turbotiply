import styles from './RoundFeedback.module.css';

interface RoundFeedbackProps {
  isCorrect: boolean;
  correctAnswer: number;
}

/**
 * Correct/incorrect feedback overlay displayed for 1.2s after each answer.
 * Uses triple indicator: color + icon + text (per FR-018, WCAG 1.4.1).
 * Content is inside a persistent aria-live="assertive" region.
 */
export default function RoundFeedback({ isCorrect, correctAnswer }: RoundFeedbackProps) {
  return (
    <div
      className={`${styles.feedback} ${isCorrect ? styles.correct : styles.incorrect}`}
      aria-live="assertive"
      role="status"
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
