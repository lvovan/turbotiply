import type { Player } from '../../types/player';
import { getAvatarEmoji } from '../../constants/avatarEmojis';
import { getRecentAverage } from '../../services/playerStorage';
import { useTranslation } from '../../i18n';
import styles from './PlayerCard.module.css';

interface PlayerCardProps {
  player: Player;
  onSelect: (player: Player) => void;
  onDelete: (player: Player) => void;
}

/**
 * Single-line player card: avatar | name | avg score | delete button.
 */
export default function PlayerCard({ player, onSelect, onDelete }: PlayerCardProps) {
  const { t } = useTranslation();
  const recentAvg = getRecentAverage(player, 10);
  const avgScore = recentAvg !== null ? t('player.avgScore', { score: String(recentAvg) }) : t('player.noScore');

  return (
    <div className={styles.card}>
      <button
        className={styles.selectButton}
        aria-label={t('player.playAs', { playerName: player.name })}
        onClick={() => onSelect(player)}
      >
        <span className={styles.avatar} aria-hidden="true">
          {getAvatarEmoji(player.avatarId)}
        </span>
        <span className={styles.name}>{player.name}</span>
        <span className={styles.score}>{avgScore}</span>
      </button>
      <button
        className={styles.deleteButton}
        aria-label={t('player.removePlayer', { playerName: player.name })}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(player);
        }}
      >
        ✕
      </button>
    </div>
  );
}
