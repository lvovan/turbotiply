import type { Formula } from '../../../types/game';
import styles from './FormulaDisplay.module.css';

interface FormulaDisplayProps {
  formula: Formula;
}

/**
 * Displays a multiplication formula with one value hidden as "?".
 * Shows "A × B = C" with the hidden value replaced by a placeholder.
 */
export default function FormulaDisplay({ formula }: FormulaDisplayProps) {
  const { factorA, factorB, product, hiddenPosition } = formula;

  const displayA = hiddenPosition === 'A' ? '?' : String(factorA);
  const displayB = hiddenPosition === 'B' ? '?' : String(factorB);
  const displayC = hiddenPosition === 'C' ? '?' : String(product);

  const ariaLabel = `Multiplication formula: ${displayA} times ${displayB} equals ${displayC}. Find the missing value.`;

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
