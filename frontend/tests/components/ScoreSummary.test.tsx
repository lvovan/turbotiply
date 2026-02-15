import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScoreSummary from '../../src/components/GamePlay/ScoreSummary/ScoreSummary';
import type { Round } from '../../src/types/game';

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

describe('ScoreSummary', () => {
  it('renders total score prominently', () => {
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} />,
    );

    expect(screen.getByText('Total Score')).toBeInTheDocument();
    // Score value is within the total score section
    const totalLabel = screen.getByText('Total Score');
    const totalSection = totalLabel.parentElement!;
    expect(totalSection).toHaveTextContent('6');
  });

  it('renders round-by-round table with formulas', () => {
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} />,
    );

    // Should have a table
    expect(screen.getByRole('table')).toBeInTheDocument();
    // Check that formulas appear
    expect(screen.getByText(/3 × 7/)).toBeInTheDocument();
  });

  it('shows correct/incorrect indicators', () => {
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} />,
    );

    // Should show correct indicators for rounds 1-2 and incorrect for round 3
    const correctIndicators = screen.getAllByText('✓');
    const incorrectIndicators = screen.getAllByText('✗');
    expect(correctIndicators.length).toBeGreaterThanOrEqual(2);
    expect(incorrectIndicators.length).toBeGreaterThanOrEqual(1);
  });

  it('"Play again" button calls onPlayAgain', async () => {
    const user = userEvent.setup();
    const onPlayAgain = vi.fn();
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={onPlayAgain} onBackToMenu={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /play again/i }));
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });

  it('"Back to menu" button calls onBackToMenu', async () => {
    const user = userEvent.setup();
    const onBackToMenu = vi.fn();
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={onBackToMenu} />,
    );

    await user.click(screen.getByRole('button', { name: /back to menu/i }));
    expect(onBackToMenu).toHaveBeenCalledTimes(1);
  });

  it('handles negative scores', () => {
    const rounds: Round[] = [
      {
        formula: { factorA: 3, factorB: 7, product: 21, hiddenPosition: 'C' },
        playerAnswer: 10,
        isCorrect: false,
        elapsedMs: 1500,
        points: -2,
      },
    ];
    render(
      <ScoreSummary rounds={rounds} score={-2} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} />,
    );

    const totalLabel = screen.getByText('Total Score');
    const totalSection = totalLabel.parentElement!;
    expect(totalSection).toHaveTextContent('-2');
  });

  it('shows per-round points', () => {
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} />,
    );

    // Should show +5 and +3 for correct, -2 for incorrect
    expect(screen.getByText(/\+5/)).toBeInTheDocument();
    expect(screen.getByText(/\+3/)).toBeInTheDocument();
  });

  it('shows response times', () => {
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} />,
    );

    // Should show formatted time like "1.5s"
    expect(screen.getByText(/1\.5s/)).toBeInTheDocument();
  });
});
