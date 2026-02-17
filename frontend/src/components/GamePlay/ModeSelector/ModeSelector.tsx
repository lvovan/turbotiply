import { useTranslation } from '../../../i18n';
import styles from './ModeSelector.module.css';

interface ModeSelectorProps {
  onStartPlay: () => void;
  onStartImprove: () => void;
  trickyNumbers: number[];
  showImprove: boolean;
  showEncouragement: boolean;
}

/**
 * Game mode selection: Play (always) and Improve (conditional).
 * Play shows "Go for a high score!" descriptor.
 * Improve shows tricky numbers from recent game analysis.
 * Encouraging message shown when player has no challenging pairs.
 */
export default function ModeSelector({
  onStartPlay,
  onStartImprove,
  trickyNumbers,
  showImprove,
  showEncouragement,
}: ModeSelectorProps) {
  const { t } = useTranslation();
  const MAX_DISPLAY = 3;
  const sortedNumbers = [...trickyNumbers].sort((a, b) => a - b);
  const displayNumbers = sortedNumbers.slice(0, MAX_DISPLAY);
  const hasMore = sortedNumbers.length > MAX_DISPLAY;
  const numbersText = displayNumbers.join(', ') + (hasMore ? ', …' : '');

  return (
    <div className={styles.container} role="group" aria-label={t('mode.groupLabel')}>
      <button
        className={styles.playButton}
        onClick={onStartPlay}
        aria-label={t('mode.playAriaLabel')}
      >
        <span className={styles.buttonLabel}>{t('mode.play')}</span>
        <span className={styles.descriptor}>{t('mode.playDescription')}</span>
      </button>

      {showImprove && trickyNumbers.length > 0 && (
        <button
          className={styles.improveButton}
          onClick={onStartImprove}
          aria-label={t('mode.improveAriaLabel', { numbers: numbersText })}
        >
          <span className={styles.buttonLabel}>{t('mode.improve')}</span>
          <span className={styles.descriptor}>
            {t('mode.improveDescription', { numbers: numbersText })}
          </span>
        </button>
      )}

      {showEncouragement && !showImprove && (
        <p className={styles.encouragement}>
          {t('mode.encouragement')}
        </p>
      )}
    </div>
  );
}
