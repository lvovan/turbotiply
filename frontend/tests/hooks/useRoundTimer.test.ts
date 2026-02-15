import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoundTimer } from '../../src/hooks/useRoundTimer';

describe('useRoundTimer', () => {
  let mockNow: ReturnType<typeof vi.spyOn>;
  let originalRAF: typeof requestAnimationFrame;
  let originalCAF: typeof cancelAnimationFrame;

  beforeEach(() => {
    mockNow = vi.spyOn(performance, 'now');
    // Replace rAF with a simple implementation that calls back immediately
    originalRAF = globalThis.requestAnimationFrame;
    originalCAF = globalThis.cancelAnimationFrame;
    let rafId = 0;
    const rafCallbacks = new Map<number, FrameRequestCallback>();
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      const id = ++rafId;
      rafCallbacks.set(id, cb);
      // Execute on next microtask to avoid synchronous recursion
      Promise.resolve().then(() => {
        const callback = rafCallbacks.get(id);
        if (callback) {
          rafCallbacks.delete(id);
          callback(performance.now());
        }
      });
      return id;
    };
    globalThis.cancelAnimationFrame = (id: number) => {
      rafCallbacks.delete(id);
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

    // Stopping immediately should give ~0ms elapsed
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

    // After reset, stop should return 0
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

  it('cleanup cancels rAF on unmount', () => {
    mockNow.mockReturnValue(1000);
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
    const { result, unmount } = renderHook(() => useRoundTimer());

    act(() => result.current.start());
    unmount();

    // cancelAnimationFrame should have been called
    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
  });
});
