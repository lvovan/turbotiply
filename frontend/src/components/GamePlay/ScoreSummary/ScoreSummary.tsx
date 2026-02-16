import type { Round } from '../../../types/game';
import type { GameMode, GameRecord } from '../../../types/player';
import { getCorrectAnswer } from '../../../services/gameEngine';
import { useTranslation } from '../../../i18n';
import ProgressionGraph from '../ProgressionGraph/ProgressionGraph';
import styles from './ScoreSummary.module.css';

interface ScoreSummaryProps {
  rounds: Round[];
  score: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  gameMode?: GameMode;
  history?: GameRecord[];
}

/**
 * End-of-game results screen.
 * Displays round-by-round breakdown table with formula, answer,
 * correct/incorrect status, response time, and points.
 * In improve mode, shows "You got X/N right!" and lists incorrect pairs.
 * Includes "Play again" button and "Back to menu" button (per FR-016, FR-020).
 */
export default function ScoreSummary({ rounds, score, onPlayAgain, onBackToMenu, gameMode = 'play', history }: ScoreSummaryProps) {
  const { t } = useTranslation();
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

  const isImprove = gameMode === 'improve';
  const correctCount = rounds.filter((r) => r.isCorrect).length;
  const incorrectPairs = rounds
    .filter((r) => !r.isCorrect)
    .map((r) => `${r.formula.factorA} × ${r.formula.factorB}`);

  return (
    <div className={styles.summary}>
      {isImprove ? (
        <>
          <h2 className={styles.heading}>{t('summary.correctCount', { count: String(correctCount), total: String(rounds.length) })}</h2>
          {incorrectPairs.length > 0 && (
            <p className={styles.practiceHint}>
              {t('summary.practiceHint', { pairs: incorrectPairs.join(', ') })}
            </p>
          )}
        </>
      ) : (
        <>
          <h2 className={styles.heading}>{t('summary.gameOver')}</h2>
          <div className={styles.totalScore}>
            <span className={styles.totalLabel}>{t('summary.totalScore')}</span>
            <span className={styles.totalValue}>{score}</span>
          </div>
        </>
      )}

      {history && <ProgressionGraph history={history} />}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('summary.colNumber')}</th>
              <th>{t('summary.colFormula')}</th>
              <th>{t('summary.colAnswer')}</th>
              <th>{t('summary.colResult')}</th>
              <th>{t('summary.colTime')}</th>
              <th>{t('summary.colPoints')}</th>
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
          {t('summary.playAgain')}
        </button>
        <button className={styles.backButton} onClick={onBackToMenu}>
          {t('summary.backToMenu')}
        </button>
      </div>
    </div>
  );
}
