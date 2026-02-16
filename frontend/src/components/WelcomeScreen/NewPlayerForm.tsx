import { useState, useRef, useEffect, type FormEvent } from 'react';
import type { Player } from '../../types/player';
import { DEFAULT_AVATAR_ID } from '../../constants/avatars';
import AvatarPicker from '../AvatarPicker/AvatarPicker';
import styles from './NewPlayerForm.module.css';

/** Maximum name length. */
const MAX_NAME_LENGTH = 20;

interface NewPlayerFormProps {
  /** Called when the form is submitted with valid player data. */
  onSubmit: (data: Pick<Player, 'name' | 'avatarId'>) => void;
  /** Check if a player name already exists (case-insensitive). */
  playerExists: (name: string) => boolean;
}

/**
 * Form for creating a new player profile.
 * Includes avatar picker, name input (1–20 chars), color picker, and "Let's go!" button.
 * When a duplicate name is entered, shows an overwrite confirmation dialog per FR-012.
 */
export default function NewPlayerForm({ onSubmit, playerExists }: NewPlayerFormProps) {
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const confirmDialogRef = useRef<HTMLDivElement>(null);

  const trimmedName = name.trim();
  const isValid = trimmedName.length > 0 && trimmedName.length <= MAX_NAME_LENGTH;

  // Focus the confirmation dialog when it appears
  useEffect(() => {
    if (showOverwriteConfirm) {
      confirmDialogRef.current?.focus();
    }
  }, [showOverwriteConfirm]);

  // Handle Escape key to dismiss confirmation dialog
  useEffect(() => {
    if (!showOverwriteConfirm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowOverwriteConfirm(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showOverwriteConfirm]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    // Check for duplicate name — show confirmation instead of blocking
    if (playerExists(trimmedName)) {
      setShowOverwriteConfirm(true);
      return;
    }

    onSubmit({
      name: trimmedName,
      avatarId,
    });
  };

  const handleOverwriteConfirm = () => {
    setShowOverwriteConfirm(false);
    onSubmit({
      name: trimmedName,
      avatarId,
    });
  };

  const handleOverwriteCancel = () => {
    setShowOverwriteConfirm(false);
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="player-name">
            Your name
          </label>
          <input
            id="player-name"
            type="text"
            className={styles.nameInput}
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
            placeholder="Type your name..."
            maxLength={MAX_NAME_LENGTH}
            autoComplete="off"
          />
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.label}>Choose your avatar</span>
          <AvatarPicker selectedId={avatarId} onSelect={setAvatarId} />
        </div>

        <button type="submit" className={styles.submitButton} disabled={!isValid}>
          Let's go! 🚀
        </button>
      </form>

      {showOverwriteConfirm && (
        <div className={styles.overlay} onClick={handleOverwriteCancel}>
          <div
            ref={confirmDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Replace ${trimmedName}`}
            className={styles.confirmDialog}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={styles.confirmTitle}>
              A player called {trimmedName} already exists. Do you want to replace them?
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.goBackButton} onClick={handleOverwriteCancel}>
                Go back
              </button>
              <button className={styles.replaceButton} onClick={handleOverwriteConfirm}>
                Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
