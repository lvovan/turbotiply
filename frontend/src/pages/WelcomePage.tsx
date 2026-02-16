import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession.tsx';
import { usePlayers } from '../hooks/usePlayers';
import { useTranslation } from '../i18n';
import type { Player } from '../types/player';
import NewPlayerForm from '../components/WelcomeScreen/NewPlayerForm';
import PlayerList from '../components/WelcomeScreen/PlayerList';
import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';
import styles from './WelcomePage.module.css';

/**
 * WelcomePage — entry point for the app.
 * Shows NewPlayerForm when no players exist (new user flow).
 * Shows PlayerList when players exist (returning user flow).
 * Redirects to /play if a session is already active.
 */
export default function WelcomePage() {
  const navigate = useNavigate();
  const { isActive, startSession } = useSession();
  const { players, storageAvailable, savePlayer, deletePlayer, playerExists, clearAllPlayers } = usePlayers();
  const { t } = useTranslation();
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false);
  const [evictionMessage, setEvictionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If session is active already, redirect to main experience
  if (isActive) {
    return <Navigate to="/play" replace />;
  }

  // T046: Graceful degradation when localStorage is unavailable
  if (!storageAvailable) {
    const handleTemporaryPlay = (data: Pick<Player, 'name' | 'avatarId'>) => {
      startSession(data);
      navigate('/play');
    };

    return (
      <div className={styles.welcomePage}>
        <div className={styles.languageArea}>
          <LanguageSwitcher />
        </div>
        <h1 className={styles.title}>Turbotiply!</h1>
        <div className={styles.storageWarning} role="alert">
          <p>{t('welcome.storageWarning')}</p>
          <p>{t('welcome.storageWarningDetail')}</p>
        </div>
        <div className={styles.content}>
          <NewPlayerForm onSubmit={handleTemporaryPlay} playerExists={() => false} />
        </div>
      </div>
    );
  }

  const handleNewPlayer = (data: Pick<Player, 'name' | 'avatarId'>) => {
    const { evictedNames } = savePlayer(data);
    if (evictedNames.length > 0) {
      setEvictionMessage(
        t('welcome.evictionMessage', { names: evictedNames.join(', ') }),
      );
    }
    startSession(data);
    navigate('/play');
  };

  const handleSelectPlayer = (player: Player) => {
    startSession({ name: player.name, avatarId: player.avatarId });
    navigate('/play');
  };

  const handleDeletePlayer = (name: string) => {
    deletePlayer(name);
  };

  const handleClearAll = () => {
    try {
      clearAllPlayers();
    } catch {
      setErrorMessage(t('welcome.clearError'));
    }
  };

  // Show new player form when no players exist, or when user explicitly chose "New player"
  const shouldShowForm = players.length === 0 || showNewPlayerForm;

  return (
    <div className={styles.welcomePage}>
      <div className={styles.languageArea}>
        <LanguageSwitcher />
      </div>
      <h1 className={styles.title}>Turbotiply!</h1>
      <p className={styles.subtitle}>
        {shouldShowForm ? t('welcome.subtitle') : t('welcome.subtitleReturning')}
      </p>
      {evictionMessage && (
        <div className={styles.evictionNotice} role="status">
          {evictionMessage}
        </div>
      )}
      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          <span>{errorMessage}</span>
          <button
            className={styles.dismissButton}
            onClick={() => setErrorMessage(null)}
            aria-label={t('welcome.dismissError')}
          >
            ✕
          </button>
        </div>
      )}
      <div className={styles.content}>
        {shouldShowForm ? (
          <>
            <NewPlayerForm onSubmit={handleNewPlayer} playerExists={playerExists} />
            {players.length > 0 && (
              <button
                className={styles.backButton}
                onClick={() => setShowNewPlayerForm(false)}
              >
                {t('welcome.backToList')}
              </button>
            )}
          </>
        ) : (
          <PlayerList
            players={players}
            onSelectPlayer={handleSelectPlayer}
            onDeletePlayer={handleDeletePlayer}
            onNewPlayer={() => setShowNewPlayerForm(true)}
            onClearAll={handleClearAll}
          />
        )}
      </div>
    </div>
  );
}
