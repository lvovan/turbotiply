import type { Round } from '../../../types/game';
import { getCorrectAnswer } from '../../../services/gameEngine';
import styles from './ScoreSummary.module.css';

interface ScoreSummaryProps {
  rounds: Round[];
  score: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

/**
 * End-of-game results screen.
 * Displays round-by-round breakdown table with formula, answer,
 * correct/incorrect status, response time, and points.
 * Includes "Play again" button and "Back to menu" button (per FR-016, FR-020).
 */
export default function ScoreSummary({ rounds, score, onPlayAgain, onBackToMenu }: ScoreSummaryProps) {
  const formatTime = (ms: number | null): string => {
    if (ms === null) return '—';
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPoints = (points: number | null): string => {
    if (points === null) return '—';
    if (points > 0) return `+${points}`;
    return String(points);
  };

  const formatFormula = (round: Round): string => {
    const { factorA, factorB, product } = round.formula;
    return `${factorA} × ${factorB} = ${product}`;
  };

  return (
    <div className={styles.summary}>
      <h2 className={styles.heading}>Game Over!</h2>
      <div className={styles.totalScore}>
        <span className={styles.totalLabel}>Total Score</span>
        <span className={styles.totalValue}>{score}</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Formula</th>
              <th>Answer</th>
              <th>Result</th>
              <th>Time</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round, index) => {
              const correctAnswer = getCorrectAnswer(round.formula);
              return (
                <tr key={index} className={round.isCorrect ? styles.correctRow : styles.incorrectRow}>
                  <td>{index + 1}</td>
                  <td>{formatFormula(round)}</td>
                  <td>
                    {round.playerAnswer ?? '—'}
                    {!round.isCorrect && round.playerAnswer !== null && (
                      <span className={styles.correctAnswerHint}> ({correctAnswer})</span>
                    )}
                  </td>
                  <td>
                    <span className={round.isCorrect ? styles.correctBadge : styles.incorrectBadge}>
                      {round.isCorrect ? '✓' : '✗'}
                    </span>
                  </td>
                  <td>{formatTime(round.elapsedMs)}</td>
                  <td>{formatPoints(round.points)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <button className={styles.playAgainButton} onClick={onPlayAgain}>
          Play again
        </button>
        <button className={styles.backButton} onClick={onBackToMenu}>
          Back to menu
        </button>
      </div>
    </div>
  );
}
