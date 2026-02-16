import type { Player } from '../../types/player';
import { getAvatarEmoji } from '../../constants/avatarEmojis';
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
  const avgScore =
    player.gamesPlayed > 0
      ? `Avg: ${Math.round(player.totalScore / player.gamesPlayed)}`
      : '—';

  return (
    <div className={styles.card}>
      <button
        className={styles.selectButton}
        aria-label={`Play as ${player.name}`}
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
        aria-label={`Remove ${player.name}`}
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
