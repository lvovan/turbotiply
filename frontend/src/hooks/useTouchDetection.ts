import { useState } from 'react';

/**
 * Detects whether the current device has a touchscreen.
 *
 * Returns `true` if `navigator.maxTouchPoints > 0` (touch-capable device),
 * `false` otherwise (desktop with mouse/keyboard only).
 *
 * Evaluated once on mount via a lazy `useState` initializer — touch hardware
 * capability is a static property that never changes during a session.
 */
export function useTouchDetection(): boolean {
  const [isTouchDevice] = useState(() => navigator.maxTouchPoints > 0);
  return isTouchDevice;
}
