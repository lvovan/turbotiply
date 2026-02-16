import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoundTimer } from '../../src/hooks/useRoundTimer';
import { COUNTDOWN_COLORS } from '../../src/constants/scoring';

/** Convert hex color to the rgb() string that jsdom produces */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

describe('useRoundTimer', () => {
  let mockNow: ReturnType<typeof vi.spyOn>;
  let originalRAF: typeof requestAnimationFrame;
  let originalCAF: typeof cancelAnimationFrame;
  let pendingCallbacks: Map<number, FrameRequestCallback>;
  let nextRafId: number;

  /** Flush one pending rAF callback (the most recent one). */
  function flushRAF() {
    const entries = Array.from(pendingCallbacks.entries());
    if (entries.length === 0) return;
    const [id, cb] = entries[entries.length - 1];
    pendingCallbacks.delete(id);
    cb(performance.now());
  }

  beforeEach(() => {
    mockNow = vi.spyOn(performance, 'now');
    originalRAF = globalThis.requestAnimationFrame;
    originalCAF = globalThis.cancelAnimationFrame;
    nextRafId = 0;
    pendingCallbacks = new Map();

    // rAF mock that stores callbacks without auto-executing
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      const id = ++nextRafId;
      pendingCallbacks.set(id, cb);
      return id;
    };
    globalThis.cancelAnimationFrame = (id: number) => {
      pendingCallbacks.delete(id);
    };
  });

  afterEach(() => {
    mockNow.mockRestore();
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCAF;
  });

  it('start records performance.now as start time', () => {
    mockNow.mockReturnValue(1000);
    const { result } = renderHook(() => useRoundTimer());

    act(() => result.current.start());

    mockNow.mockReturnValue(1000);
    let elapsed: number = 0;
    act(() => {
      elapsed = result.current.stop();
    });
    expect(elapsed).toBe(0);
  });

  it('stop returns elapsed ms since start', () => {
    mockNow.mockReturnValue(1000);
    const { result } = renderHook(() => useRoundTimer());

    act(() => result.current.start());

    mockNow.mockReturnValue(2500);
    let elapsed: number = 0;
    act(() => {
      elapsed = result.current.stop();
    });
    expect(elapsed).toBe(1500);
  });

  it('reset clears timer state', () => {
    mockNow.mockReturnValue(1000);
    const { result } = renderHook(() => useRoundTimer());

    act(() => result.current.start());
    mockNow.mockReturnValue(2000);
    act(() => result.current.reset());

    mockNow.mockReturnValue(3000);
    let elapsed: number = 0;
    act(() => {
      elapsed = result.current.stop();
    });
    expect(elapsed).toBe(0);
  });

  it('displayRef can be attached to an element', () => {
    const { result } = renderHook(() => useRoundTimer());
    expect(result.current.displayRef).toBeDefined();
  });

  it('barRef can be attached to an element', () => {
    const { result } = renderHook(() => useRoundTimer());
    expect(result.current.barRef).toBeDefined();
  });

  it('cleanup cancels rAF on unmount', () => {
    mockNow.mockReturnValue(1000);
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
    const { result, unmount } = renderHook(() => useRoundTimer());

    act(() => result.current.start());
    unmount();

    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
  });

  describe('countdown display', () => {
    it('reset sets display to "5.0s"', () => {
      const { result } = renderHook(() => useRoundTimer());
      const el = document.createElement('span');
      (result.current.displayRef as React.MutableRefObject<HTMLElement | null>).current = el;

      act(() => result.current.reset());
      expect(el.textContent).toBe('5.0s');
    });

    it('displays countdown from 5.0s toward 0.0s', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const el = document.createElement('span');
      (result.current.displayRef as React.MutableRefObject<HTMLElement | null>).current = el;

      act(() => result.current.start());

      // Simulate 2 seconds elapsed
      mockNow.mockReturnValue(3000);
      act(() => flushRAF());

      expect(el.textContent).toBe('3.0s');
    });

    it('countdown never goes below 0.0s', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const el = document.createElement('span');
      (result.current.displayRef as React.MutableRefObject<HTMLElement | null>).current = el;

      act(() => result.current.start());

      mockNow.mockReturnValue(8000);
      act(() => flushRAF());

      expect(el.textContent).toBe('0.0s');
    });
  });

  describe('bar ref updates', () => {
    it('reset sets bar to full width and green', () => {
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;

      act(() => result.current.reset());
      expect(barEl.style.width).toBe('100%');
      expect(barEl.style.backgroundColor).toBe(hexToRgb(COUNTDOWN_COLORS.green));
    });

    it('bar width decreases as time elapses', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;

      act(() => result.current.start());

      mockNow.mockReturnValue(3500); // 2.5s elapsed, 50% remaining
      act(() => flushRAF());

      expect(barEl.style.width).toBe('50%');
    });

    it('bar width is 0% after 5+ seconds', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;

      act(() => result.current.start());

      mockNow.mockReturnValue(7000);
      act(() => flushRAF());

      expect(barEl.style.width).toBe('0%');
    });

    it('bar color is green in 0-2s range', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;

      act(() => result.current.start());

      mockNow.mockReturnValue(2500); // 1.5s elapsed
      act(() => flushRAF());

      expect(barEl.style.backgroundColor).toBe(hexToRgb(COUNTDOWN_COLORS.green));
    });

    it('bar color is lightGreen in 2-3s range', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;

      act(() => result.current.start());

      mockNow.mockReturnValue(3500); // 2.5s elapsed
      act(() => flushRAF());

      expect(barEl.style.backgroundColor).toBe(hexToRgb(COUNTDOWN_COLORS.lightGreen));
    });

    it('bar color is orange in 3-4s range', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;

      act(() => result.current.start());

      mockNow.mockReturnValue(4500); // 3.5s elapsed
      act(() => flushRAF());

      expect(barEl.style.backgroundColor).toBe(hexToRgb(COUNTDOWN_COLORS.orange));
    });

    it('bar color is red in 4-5s range', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;

      act(() => result.current.start());

      mockNow.mockReturnValue(5500); // 4.5s elapsed
      act(() => flushRAF());

      expect(barEl.style.backgroundColor).toBe(hexToRgb(COUNTDOWN_COLORS.red));
    });

    it('bar ARIA attributes are updated with remaining time', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;

      act(() => result.current.start());

      mockNow.mockReturnValue(3000); // 2s elapsed, 3.0s remaining
      act(() => flushRAF());

      expect(barEl.getAttribute('aria-valuenow')).toBe('3.0');
      expect(barEl.getAttribute('aria-valuetext')).toBe('3.0 seconds remaining');
    });
  });

  describe('freeze on stop', () => {
    it('bar and display freeze when stop is called', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer());
      const displayEl = document.createElement('span');
      const barEl = document.createElement('div');
      (result.current.displayRef as React.MutableRefObject<HTMLElement | null>).current = displayEl;
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;

      act(() => result.current.start());

      mockNow.mockReturnValue(2000); // 1s elapsed
      act(() => flushRAF());

      const frozenDisplay = displayEl.textContent;
      const frozenWidth = barEl.style.width;

      act(() => result.current.stop());

      // After stop, rAF is cancelled, so flush does nothing
      mockNow.mockReturnValue(5000);
      act(() => flushRAF());

      expect(displayEl.textContent).toBe(frozenDisplay);
      expect(barEl.style.width).toBe(frozenWidth);
    });
  });

  describe('reduced motion', () => {
    it('updates in discrete steps when reducedMotion is true', () => {
      mockNow.mockReturnValue(1000);
      const { result } = renderHook(() => useRoundTimer(true));
      const barEl = document.createElement('div');
      (result.current.barRef as React.MutableRefObject<HTMLDivElement | null>).current = barEl;

      act(() => result.current.start());

      // 250ms elapsed - should snap to 0ms boundary (100%)
      mockNow.mockReturnValue(1250);
      act(() => flushRAF());
      expect(barEl.style.width).toBe('100%');

      // 500ms elapsed - should snap to 500ms boundary (90%)
      mockNow.mockReturnValue(1500);
      act(() => flushRAF());
      expect(barEl.style.width).toBe('90%');
    });
  });
});
