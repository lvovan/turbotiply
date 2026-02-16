import type { GameRecord } from '../../../types/player';
import { useTranslation } from '../../../i18n';
import styles from './RecentHighScores.module.css';

interface RecentHighScoresProps {
  scores: GameRecord[];
  isEmpty: boolean;
}

const MEDALS = ['🥇', '🥈', '🥉'] as const;

/**
 * Displays a ranked list of the player's most recent game scores
 * in a "high score" aesthetic.
 */
export default function RecentHighScores({ scores, isEmpty }: RecentHighScoresProps) {
  const headingId = 'recent-high-scores-heading';
  const { t } = useTranslation();

  return (
    <section aria-labelledby={headingId} className={styles.container}>
      <h2 id={headingId} className={styles.heading}>
        {t('scores.title')}
      </h2>

      {isEmpty ? (
        <p className={styles.emptyState}>
          {t('scores.empty')}
        </p>
      ) : (
        <ol
          aria-label={t('scores.listLabel')}
          className={styles.list}
        >
          {scores.map((record, index) => {
            const rank = index + 1;
            const isTopScore = rank === 1;
            const medal = rank <= 3 ? MEDALS[index] : null;
            const ordinal = t(`ordinal.${rank}` as 'ordinal.1');

            return (
              <li
                key={`${record.completedAt}-${record.score}`}
                className={`${styles.row} ${isTopScore ? styles.topScore : ''}`}
              >
                <span className="sr-only">
                  {t('scores.placeScore', { ordinal, score: String(record.score) })}
                </span>
                <span className={styles.rank} aria-hidden="true">
                  {medal ?? ordinal}
                </span>
                <span className={styles.score} aria-hidden="true">
                  {t('scores.scorePoints', { score: String(record.score) })}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
