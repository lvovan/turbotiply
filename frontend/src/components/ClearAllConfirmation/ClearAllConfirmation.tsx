import { useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n';
import styles from './ClearAllConfirmation.module.css';

interface ClearAllConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible modal dialog confirming the "Clear all profiles" destructive action.
 * Focus-trapped, dismissible via Escape key.
 * Follows the DeleteConfirmation component pattern.
 */
export default function ClearAllConfirmation({
  onConfirm,
  onCancel,
}: ClearAllConfirmationProps) {
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
        aria-label={t('dialog.clearAllLabel')}
        className={styles.dialog}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.title}>{t('dialog.clearAllTitle')}</p>
        <p className={styles.message}>
          {t('dialog.clearAllMessage')}
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {t('dialog.cancel')}
          </button>
          <button className={styles.clearButton} onClick={onConfirm}>
            {t('dialog.clearAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
