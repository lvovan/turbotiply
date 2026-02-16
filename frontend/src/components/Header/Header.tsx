import { useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/useSession.tsx';
import { useTranslation } from '../../i18n';
import { getAvatarEmoji } from '../../constants/avatarEmojis';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import styles from './Header.module.css';

/**
 * Session header component.
 * Shows current player's avatar, greeting, color accent, and "Switch player" button.
 * Renders nothing when no session is active.
 */
export default function Header() {
  const navigate = useNavigate();
  const { session, isActive, endSession } = useSession();
  const { t } = useTranslation();

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
          {t('header.greeting', { playerName: session.playerName })}
        </span>
      </div>
      <div className={styles.actions}>
        <LanguageSwitcher />
        <button className={styles.switchButton} onClick={handleSwitchPlayer}>
          {t('header.switchPlayer')}
        </button>
      </div>
    </header>
  );
}
