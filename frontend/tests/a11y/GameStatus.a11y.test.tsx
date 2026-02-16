import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { axe } from 'vitest-axe';
import { createRef } from 'react';
import GameStatus from '../../src/components/GamePlay/GameStatus/GameStatus';

function defaultProps(overrides?: Partial<Parameters<typeof GameStatus>[0]>) {
  return {
    roundNumber: 1,
    totalRounds: 10,
    score: 0,
    timerRef: createRef<HTMLSpanElement>(),
    barRef: createRef<HTMLDivElement>(),
    isReplay: false,
    currentPhase: 'input' as const,
    isCorrect: null,
    correctAnswer: null,
    completedRound: 1,
    ...overrides,
  };
}

describe('GameStatus accessibility (Practice indicator)', () => {
  it('passes axe check in improve mode (Practice indicator)', async () => {
    const { container } = render(
      <GameStatus {...defaultProps({ gameMode: 'improve', score: 0 })} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe check in play mode (Score display)', async () => {
    const { container } = render(
      <GameStatus {...defaultProps({ gameMode: 'play', score: 15 })} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe check in improve mode during feedback', async () => {
    const { container } = render(
      <GameStatus
        {...defaultProps({
          gameMode: 'improve',
          currentPhase: 'feedback',
          isCorrect: true,
          correctAnswer: 42,
          completedRound: 3,
        })}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
