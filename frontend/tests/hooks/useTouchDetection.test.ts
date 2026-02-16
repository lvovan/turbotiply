import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('useTouchDetection', () => {
  const originalMaxTouchPoints = navigator.maxTouchPoints;

  afterEach(() => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: originalMaxTouchPoints,
      writable: true,
      configurable: true,
    });
    vi.resetModules();
  });

  function mockMaxTouchPoints(value: number) {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value,
      writable: true,
      configurable: true,
    });
  }

  it('returns true when device has a touchscreen (maxTouchPoints > 0)', async () => {
    mockMaxTouchPoints(5);
    const { useTouchDetection } = await import('../../src/hooks/useTouchDetection');
    const { result } = renderHook(() => useTouchDetection());
    expect(result.current).toBe(true);
  });

  it('returns false when device has no touchscreen (maxTouchPoints === 0)', async () => {
    mockMaxTouchPoints(0);
    const { useTouchDetection } = await import('../../src/hooks/useTouchDetection');
    const { result } = renderHook(() => useTouchDetection());
    expect(result.current).toBe(false);
  });

  it('returns true for hybrid devices (maxTouchPoints > 0)', async () => {
    mockMaxTouchPoints(10); // Surface Pro reports 10
    const { useTouchDetection } = await import('../../src/hooks/useTouchDetection');
    const { result } = renderHook(() => useTouchDetection());
    expect(result.current).toBe(true);
  });

  it('returns a stable value across re-renders', async () => {
    mockMaxTouchPoints(5);
    const { useTouchDetection } = await import('../../src/hooks/useTouchDetection');
    const { result, rerender } = renderHook(() => useTouchDetection());

    const firstValue = result.current;
    rerender();
    rerender();
    expect(result.current).toBe(firstValue);
  });
});
