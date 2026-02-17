import { useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/useSession.tsx';
import { useTranslation } from '../../i18n';
import { getAvatarEmoji } from '../../constants/avatarEmojis';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import styles from './Header.module.css';

/**
 * Shared header bar rendered on every page.
 * - Unauthenticated: app title + language switcher.
 * - Authenticated: app title + avatar + greeting + language switcher + "Switch player" button.
 */
export default function Header() {
  const navigate = useNavigate();
  const { session, isActive, endSession } = useSession();
  const { t } = useTranslation();

  const handleSwitchPlayer = () => {
    endSession();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      {isActive && session ? (
        <div className={styles.leftSection}>
          <span className={styles.avatar} aria-hidden="true">
            {getAvatarEmoji(session.avatarId)}
          </span>
          <span className={styles.greeting}>
            {t('header.greeting', { playerName: session.playerName })}
          </span>
        </div>
      ) : (
        <div className={styles.leftSection} />
      )}
      <span className={styles.title}>Multis!</span>
      <div className={styles.actions}>
        <LanguageSwitcher />
        {isActive && session && (
          <button className={styles.switchButton} onClick={handleSwitchPlayer}>
            {t('header.switchPlayer')}
          </button>
        )}
      </div>
    </header>
  );
}
