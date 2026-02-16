import type { Formula } from '../../../types/game';
import { useTranslation } from '../../../i18n';
import styles from './FormulaDisplay.module.css';

interface FormulaDisplayProps {
  formula: Formula;
  playerAnswer?: number;
}

/**
 * Displays a multiplication formula with one value hidden as "?".
 * Shows "A × B = C" with the hidden value replaced by a placeholder.
 * When playerAnswer is provided, shows the player's answer instead of "?".
 */
export default function FormulaDisplay({ formula, playerAnswer }: FormulaDisplayProps) {
  const { factorA, factorB, product, hiddenPosition } = formula;
  const { t } = useTranslation();

  const hiddenValue = playerAnswer !== undefined ? String(playerAnswer) : '?';

  const displayA = hiddenPosition === 'A' ? hiddenValue : String(factorA);
  const displayB = hiddenPosition === 'B' ? hiddenValue : String(factorB);
  const displayC = hiddenPosition === 'C' ? hiddenValue : String(product);

  const ariaLabel = playerAnswer !== undefined
    ? t('a11y.formulaWithAnswer', { a: displayA, b: displayB, c: displayC, answer: String(playerAnswer) })
    : t('a11y.formulaWithoutAnswer', { a: displayA, b: displayB, c: displayC });

  return (
    <div className={styles.formula} role="math" aria-label={ariaLabel}>
      <span className={hiddenPosition === 'A' ? styles.hidden : styles.value}>{displayA}</span>
      <span className={styles.operator}>×</span>
      <span className={hiddenPosition === 'B' ? styles.hidden : styles.value}>{displayB}</span>
      <span className={styles.operator}>=</span>
      <span className={hiddenPosition === 'C' ? styles.hidden : styles.value}>{displayC}</span>
    </div>
  );
}
