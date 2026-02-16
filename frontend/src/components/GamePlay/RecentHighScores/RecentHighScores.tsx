import type { GameRecord } from '../../../types/player';
import styles from './RecentHighScores.module.css';

interface RecentHighScoresProps {
  scores: GameRecord[];
  isEmpty: boolean;
}

const MEDALS = ['🥇', '🥈', '🥉'] as const;
const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th'] as const;

/**
 * Displays a ranked list of the player's most recent game scores
 * in a "high score" aesthetic.
 */
export default function RecentHighScores({ scores, isEmpty }: RecentHighScoresProps) {
  const headingId = 'recent-high-scores-heading';

  return (
    <section aria-labelledby={headingId} className={styles.container}>
      <h2 id={headingId} className={styles.heading}>
        Recent High Scores
      </h2>

      {isEmpty ? (
        <p className={styles.emptyState}>
          Play your first game to see your scores here!
        </p>
      ) : (
        <ol
          aria-label="Recent high scores, ranked highest to lowest"
          className={styles.list}
        >
          {scores.map((record, index) => {
            const rank = index + 1;
            const isTopScore = rank === 1;
            const medal = rank <= 3 ? MEDALS[index] : null;
            const ordinal = ORDINALS[index] ?? `${rank}th`;

            return (
              <li
                key={`${record.completedAt}-${record.score}`}
                className={`${styles.row} ${isTopScore ? styles.topScore : ''}`}
              >
                <span className="sr-only">
                  {ordinal} place: {record.score} points
                </span>
                <span className={styles.rank} aria-hidden="true">
                  {medal ?? `${rank}th`}
                </span>
                <span className={styles.score} aria-hidden="true">
                  {record.score} points
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
