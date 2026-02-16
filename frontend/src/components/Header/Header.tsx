import { useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/useSession.tsx';
import { getAvatarEmoji } from '../../constants/avatarEmojis';
import styles from './Header.module.css';

/**
 * Session header component.
 * Shows current player's avatar, greeting, color accent, and "Switch player" button.
 * Renders nothing when no session is active.
 */
export default function Header() {
  const navigate = useNavigate();
  const { session, isActive, endSession } = useSession();

  if (!isActive || !session) {
    return null;
  }

  const handleSwitchPlayer = () => {
    endSession();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.playerInfo}>
        <span className={styles.avatar} aria-hidden="true">
          {getAvatarEmoji(session.avatarId)}
        </span>
        <span className={styles.greeting}>
          Hi, {session.playerName}!
        </span>
      </div>
      <button className={styles.switchButton} onClick={handleSwitchPlayer}>
        Switch player
      </button>
    </header>
  );
}
