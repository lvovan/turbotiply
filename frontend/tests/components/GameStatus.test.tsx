import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import GameStatus from '../../src/components/GamePlay/GameStatus/GameStatus';

/** Helper to create default props with both refs */
function defaultProps(overrides?: Partial<Parameters<typeof GameStatus>[0]>) {
  return {
    roundNumber: 1,
    totalRounds: 10,
    score: 0,
    timerRef: createRef<HTMLSpanElement>(),
    barRef: createRef<HTMLDivElement>(),
    isReplay: false,
    ...overrides,
  };
}

describe('GameStatus', () => {
  it('renders "Round N of 10" during normal play', () => {
    render(<GameStatus {...defaultProps({ roundNumber: 3, score: 15 })} />);
    expect(screen.getByText(/Round 3 of 10/)).toBeInTheDocument();
  });

  it('renders running score', () => {
    render(<GameStatus {...defaultProps({ roundNumber: 5, score: 22 })} />);
    expect(screen.getByText(/22/)).toBeInTheDocument();
  });

  it('renders timer display element', () => {
    const timerRef = createRef<HTMLSpanElement>();
    const { container } = render(<GameStatus {...defaultProps({ timerRef })} />);

    const timerElement = container.querySelector('[data-testid="timer"]') ||
      container.querySelector('.timer');
    expect(timerElement).toBeInTheDocument();
  });

  it('shows replay indicator when isReplay is true', () => {
    render(<GameStatus {...defaultProps({ roundNumber: 1, totalRounds: 2, score: 10, isReplay: true })} />);
    expect(screen.getByText(/Replay/i)).toBeInTheDocument();
  });

  it('does not show replay indicator when isReplay is false', () => {
    render(<GameStatus {...defaultProps({ roundNumber: 3, score: 15 })} />);
    expect(screen.queryByText(/Replay/i)).not.toBeInTheDocument();
  });

  it('timer element has data-testid for external access', () => {
    render(<GameStatus {...defaultProps()} />);
    const timer = screen.getByTestId('timer');
    expect(timer).toBeInTheDocument();
  });

  it('timer shows elapsed seconds format', () => {
    const timerRef = createRef<HTMLSpanElement>();
    render(<GameStatus {...defaultProps({ timerRef })} />);

    if (timerRef.current) {
      timerRef.current.textContent = '3.5s';
    }
    const timer = screen.getByTestId('timer');
    expect(timer.textContent).toBe('3.5s');
  });

  // --- New tests for countdown bar ---

  it('timer initial text is "5.0s"', () => {
    render(<GameStatus {...defaultProps()} />);
    const timer = screen.getByTestId('timer');
    expect(timer.textContent).toBe('5.0s');
  });

  it('renders CountdownBar component', () => {
    const { container } = render(<GameStatus {...defaultProps()} />);
    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toBeInTheDocument();
  });

  it('passes barRef to CountdownBar', () => {
    const barRef = createRef<HTMLDivElement>();
    render(<GameStatus {...defaultProps({ barRef })} />);
    expect(barRef.current).toBeInstanceOf(HTMLDivElement);
  });
});
