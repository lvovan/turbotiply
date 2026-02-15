import { useRef, useCallback, useEffect } from 'react';

export interface UseRoundTimerReturn {
  /** Ref to attach to the display element. The timer writes directly to textContent. */
  displayRef: React.RefObject<HTMLElement | null>;
  /** Start the timer. Records performance.now() as the start time. */
  start: () => void;
  /** Stop the timer and return elapsed milliseconds since start(). */
  stop: () => number;
  /** Reset the timer. Stops rAF loop and clears display. */
  reset: () => void;
}

/**
 * Tracks elapsed time for a single game round.
 * Uses performance.now() for precise measurement and requestAnimationFrame
 * for smooth display updates without triggering React re-renders.
 */
export function useRoundTimer(): UseRoundTimerReturn {
  const displayRef = useRef<HTMLElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    tickRef.current = () => {
      if (startTimeRef.current === null) return;

      const elapsed = performance.now() - startTimeRef.current;
      const seconds = (elapsed / 1000).toFixed(1);

      if (displayRef.current) {
        displayRef.current.textContent = `${seconds}s`;
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
      displayRef.current.textContent = '0.0s';
    }
  }, [cancelRaf]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRaf();
    };
  }, [cancelRaf]);

  return { displayRef, start, stop, reset };
}
