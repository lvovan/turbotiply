import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { axe } from 'vitest-axe';
import userEvent from '@testing-library/user-event';
import ScoreSummary from '../../../src/components/GamePlay/ScoreSummary/ScoreSummary';
import type { Round } from '../../../src/types/game';

function createMockRounds(): Round[] {
  return [
    {
      formula: { factorA: 3, factorB: 7, product: 21, hiddenPosition: 'C' },
      playerAnswer: 21,
      isCorrect: true,
      elapsedMs: 1500,
      points: 5,
    },
    {
      formula: { factorA: 4, factorB: 5, product: 20, hiddenPosition: 'A' },
      playerAnswer: 4,
      isCorrect: true,
      elapsedMs: 2500,
      points: 3,
    },
    {
      formula: { factorA: 6, factorB: 8, product: 48, hiddenPosition: 'B' },
      playerAnswer: 9,
      isCorrect: false,
      elapsedMs: 3000,
      points: -2,
    },
  ];
}

describe('ScoreSummary accessibility', () => {
  it('has no basic accessibility violations', async () => {
    const rounds = createMockRounds();
    const { container } = render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} gameMode="play" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Play Again and Back to Menu buttons are keyboard accessible', async () => {
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} gameMode="play" />,
    );
    const user = userEvent.setup();
    // Tab through interactive elements until we reach buttons
    const playAgainBtn = screen.getByRole('button', { name: /play again/i });
    const backBtn = screen.getByRole('button', { name: /back to menu/i });
    playAgainBtn.focus();
    expect(playAgainBtn).toHaveFocus();
    await user.tab();
    expect(backBtn).toHaveFocus();
  });

  it('summary table is accessible', () => {
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} gameMode="play" />,
    );
    expect(screen.getByRole('table', { name: /game summary table/i })).toBeInTheDocument();
  });
});
