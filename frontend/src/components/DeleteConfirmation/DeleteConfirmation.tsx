import { useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n';
import styles from './DeleteConfirmation.module.css';

interface DeleteConfirmationProps {
  playerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible modal dialog confirming player deletion.
 * Focus-trapped, dismissible via Escape key.
 */
export default function DeleteConfirmation({
  playerName,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Focus the dialog on mount
    dialogRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('dialog.removeLabel', { playerName })}
        className={styles.dialog}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.title}>{t('dialog.removeTitle', { playerName })}</p>
        <p className={styles.message}>{t('dialog.removeMessage')}</p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {t('dialog.cancel')}
          </button>
          <button className={styles.removeButton} onClick={onConfirm}>
            {t('dialog.remove')}
          </button>
        </div>
      </div>
    </div>
  );
}
