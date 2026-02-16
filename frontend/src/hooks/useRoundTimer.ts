import { useRef, useCallback, useEffect } from 'react';
import { COUNTDOWN_DURATION_MS, COUNTDOWN_COLORS } from '../constants/scoring';

export interface UseRoundTimerReturn {
  /** Ref to attach to the display element. The timer writes countdown text directly to textContent. */
  displayRef: React.RefObject<HTMLElement | null>;
  /** Ref to attach to the bar fill element. The timer writes width + backgroundColor directly. */
  barRef: React.RefObject<HTMLDivElement | null>;
  /** Start the timer. Records performance.now() as the start time. */
  start: () => void;
  /** Stop the timer and return elapsed milliseconds since start(). */
  stop: () => number;
  /** Reset the timer. Stops rAF loop and sets display to "5.0s", bar to full width + green. */
  reset: () => void;
}

/**
 * Determine countdown bar color based on elapsed milliseconds.
 * Maps to scoring tiers: green (0–2s), lightGreen (2–3s), orange (3–4s), red (4s+).
 */
function getBarColor(elapsedMs: number): string {
  if (elapsedMs < 2000) return COUNTDOWN_COLORS.green;
  if (elapsedMs < 3000) return COUNTDOWN_COLORS.lightGreen;
  if (elapsedMs < 4000) return COUNTDOWN_COLORS.orange;
  return COUNTDOWN_COLORS.red;
}

/**
 * Tracks elapsed time for a single game round with countdown display.
 * Uses performance.now() for precise measurement and requestAnimationFrame
 * for smooth display updates without triggering React re-renders.
 *
 * @param reducedMotion When true, updates happen at 500ms discrete steps instead of every frame.
 */
export function useRoundTimer(reducedMotion?: boolean): UseRoundTimerReturn {
  const displayRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    tickRef.current = () => {
      if (startTimeRef.current === null) return;

      let elapsed = performance.now() - startTimeRef.current;

      // In reduced motion mode, snap to 500ms discrete steps
      if (reducedMotion) {
        elapsed = Math.floor(elapsed / 500) * 500;
      }

      // Clamp to countdown range
      const clampedElapsed = Math.min(elapsed, COUNTDOWN_DURATION_MS);
      const remaining = COUNTDOWN_DURATION_MS - clampedElapsed;
      const remainingSeconds = (remaining / 1000).toFixed(1);

      // Update countdown display
      if (displayRef.current) {
        displayRef.current.textContent = `${remainingSeconds}s`;
      }

      // Update bar width and color
      if (barRef.current) {
        const widthPercent = ((remaining / COUNTDOWN_DURATION_MS) * 100).toFixed(1);
        barRef.current.style.width = `${widthPercent}%`;
        barRef.current.style.backgroundColor = getBarColor(clampedElapsed);

        // Update ARIA attributes for accessibility
        barRef.current.setAttribute('aria-valuenow', remainingSeconds);
        barRef.current.setAttribute('aria-valuetext', `${remainingSeconds} seconds remaining`);
      }

      rafIdRef.current = requestAnimationFrame(tickRef.current);
    };
  });

  const cancelRaf = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    cancelRaf();
    rafIdRef.current = requestAnimationFrame(tickRef.current);
  }, [cancelRaf]);

  const stop = useCallback((): number => {
    cancelRaf();
    if (startTimeRef.current === null) return 0;
    const elapsed = performance.now() - startTimeRef.current;
    return elapsed;
  }, [cancelRaf]);

  const reset = useCallback(() => {
    cancelRaf();
    startTimeRef.current = null;
    if (displayRef.current) {
      displayRef.current.textContent = '5.0s';
    }
    if (barRef.current) {
      barRef.current.style.width = '100%';
      barRef.current.style.backgroundColor = COUNTDOWN_COLORS.green;
      barRef.current.setAttribute('aria-valuenow', '5.0');
      barRef.current.setAttribute('aria-valuetext', '5.0 seconds remaining');
    }
  }, [cancelRaf]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRaf();
    };
  }, [cancelRaf]);

  return { displayRef, barRef, start, stop, reset };
}
