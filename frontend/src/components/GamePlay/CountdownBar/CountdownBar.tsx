import type { RefObject } from 'react';
import styles from './CountdownBar.module.css';

interface CountdownBarProps {
  /** Ref attached to the bar fill element — useRoundTimer writes width + backgroundColor directly */
  barRef: RefObject<HTMLDivElement | null>;
}

/**
 * Animated countdown progress bar that shrinks from 100% to 0% over 5 seconds.
 * Color transitions through scoring-tier stages (green → lightGreen → orange → red).
 * The useRoundTimer hook drives the fill's style.width and style.backgroundColor via barRef.
 */
export default function CountdownBar({ barRef }: CountdownBarProps) {
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label="Time remaining"
      aria-valuemin={0}
      aria-valuemax={5}
    >
      <div
        ref={barRef}
        className={styles.fill}
        style={{ width: '100%', backgroundColor: '#0e8a1e' }}
      />
    </div>
  );
}
