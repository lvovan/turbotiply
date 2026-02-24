import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { axe } from 'vitest-axe';
import ScoreSummary from '../../src/components/GamePlay/ScoreSummary/ScoreSummary';
import type { Round } from '../../src/types/game';
import { vi } from 'vitest';

function createMockRounds(): Round[] {
  return [
    {
      formula: { factorA: 3, factorB: 7, product: 21, hiddenPosition: 'C' },
      playerAnswer: 21,
      isCorrect: true,
      elapsedMs: 1500,
      points: 5,
      firstTryCorrect: true,
    },
    {
      formula: { factorA: 4, factorB: 5, product: 20, hiddenPosition: 'A' },
      playerAnswer: 4,
      isCorrect: true,
      elapsedMs: 2500,
      points: 3,
      firstTryCorrect: true,
    },
    {
      formula: { factorA: 6, factorB: 8, product: 48, hiddenPosition: 'B' },
      playerAnswer: 9,
      isCorrect: false,
      elapsedMs: 3000,
      points: -2,
      firstTryCorrect: false,
    },
  ];
}

describe('ScoreSummary accessibility (Improve mode)', () => {
  it('passes axe check in improve mode with incorrect pairs', async () => {
    const rounds = createMockRounds();
    const { container } = render(
      <ScoreSummary
        rounds={rounds}
        score={6}
        onPlayAgain={vi.fn()}
        onBackToMenu={vi.fn()}
        gameMode="improve"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe check in improve mode with all correct', async () => {
    const rounds: Round[] = [
      {
        formula: { factorA: 3, factorB: 7, product: 21, hiddenPosition: 'C' },
        playerAnswer: 21,
        isCorrect: true,
        elapsedMs: 1500,
        points: 5,
        firstTryCorrect: true,
      },
    ];
    const { container } = render(
      <ScoreSummary
        rounds={rounds}
        score={5}
        onPlayAgain={vi.fn()}
        onBackToMenu={vi.fn()}
        gameMode="improve"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe check in play mode', async () => {
    const rounds = createMockRounds();
    const { container } = render(
      <ScoreSummary
        rounds={rounds}
        score={6}
        onPlayAgain={vi.fn()}
        onBackToMenu={vi.fn()}
        gameMode="play"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
