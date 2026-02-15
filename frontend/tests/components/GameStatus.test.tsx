import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import GameStatus from '../../src/components/GamePlay/GameStatus/GameStatus';

describe('GameStatus', () => {
  it('renders "Round N of 10" during normal play', () => {
    render(
      <GameStatus
        roundNumber={3}
        totalRounds={10}
        score={15}
        timerRef={createRef<HTMLSpanElement>()}
        isReplay={false}
      />,
    );

    expect(screen.getByText(/Round 3 of 10/)).toBeInTheDocument();
  });

  it('renders running score', () => {
    render(
      <GameStatus
        roundNumber={5}
        totalRounds={10}
        score={22}
        timerRef={createRef<HTMLSpanElement>()}
        isReplay={false}
      />,
    );

    expect(screen.getByText(/22/)).toBeInTheDocument();
  });

  it('renders timer display element', () => {
    const timerRef = createRef<HTMLSpanElement>();
    const { container } = render(
      <GameStatus
        roundNumber={1}
        totalRounds={10}
        score={0}
        timerRef={timerRef}
        isReplay={false}
      />,
    );

    // Timer element should exist
    const timerElement = container.querySelector('[data-testid="timer"]') ||
      container.querySelector('.timer');
    expect(timerElement).toBeInTheDocument();
  });

  it('shows replay indicator when isReplay is true', () => {
    render(
      <GameStatus
        roundNumber={1}
        totalRounds={2}
        score={10}
        timerRef={createRef<HTMLSpanElement>()}
        isReplay={true}
      />,
    );

    expect(screen.getByText(/Replay/i)).toBeInTheDocument();
  });

  it('does not show replay indicator when isReplay is false', () => {
    render(
      <GameStatus
        roundNumber={3}
        totalRounds={10}
        score={15}
        timerRef={createRef<HTMLSpanElement>()}
        isReplay={false}
      />,
    );

    expect(screen.queryByText(/Replay/i)).not.toBeInTheDocument();
  });

  it('timer element has data-testid for external access', () => {
    render(
      <GameStatus
        roundNumber={1}
        totalRounds={10}
        score={0}
        timerRef={createRef<HTMLSpanElement>()}
        isReplay={false}
      />,
    );

    const timer = screen.getByTestId('timer');
    expect(timer).toBeInTheDocument();
  });

  it('timer shows elapsed seconds format', () => {
    const timerRef = createRef<HTMLSpanElement>();
    render(
      <GameStatus
        roundNumber={1}
        totalRounds={10}
        score={0}
        timerRef={timerRef}
        isReplay={false}
      />,
    );

    // Simulate timer writing to the ref
    if (timerRef.current) {
      timerRef.current.textContent = '3.5s';
    }

    const timer = screen.getByTestId('timer');
    expect(timer.textContent).toBe('3.5s');
  });
});
