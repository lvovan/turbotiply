import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
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

describe('ScoreSummary', () => {
  it('renders the score and label in play mode', () => {
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} gameMode="play" />,
    );
    expect(screen.getByText('Score')).toBeInTheDocument();
    const scoreLabel = screen.getByText('Score');
    const scoreSection = scoreLabel.parentElement!;
    expect(scoreSection).toHaveTextContent('6');
  });

  it('renders Play Again and Back to Menu buttons', () => {
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to menu/i })).toBeInTheDocument();
  });

  it('calls onPlayAgain when Play Again is clicked', () => {
    const onPlayAgain = vi.fn();
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={onPlayAgain} onBackToMenu={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /play again/i }));
    expect(onPlayAgain).toHaveBeenCalled();
  });

  it('calls onBackToMenu when Back to Menu is clicked', () => {
    const onBackToMenu = vi.fn();
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={onBackToMenu} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /back to menu/i }));
    expect(onBackToMenu).toHaveBeenCalled();
  });

  it('renders the summary table with formula, answer, result, time, and points columns', () => {
    const rounds = createMockRounds();
    render(
      <ScoreSummary rounds={rounds} score={6} onPlayAgain={vi.fn()} onBackToMenu={vi.fn()} />,
    );
    expect(screen.getByRole('table', { name: /game summary table/i })).toBeInTheDocument();
    // Headers
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Formula')).toBeInTheDocument();
    expect(screen.getByText('Answer')).toBeInTheDocument();
    expect(screen.getByText('Result')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    // Formula display
    expect(screen.getByText(/3 × 7/)).toBeInTheDocument();
    // Player answers in the Answer column
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    // Correct/incorrect indicators
    expect(screen.getAllByText('✅').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('❌').length).toBeGreaterThanOrEqual(1);
    // Points
    expect(screen.getByText(/\+5/)).toBeInTheDocument();
    expect(screen.getByText(/\+3/)).toBeInTheDocument();
    // Response time
    expect(screen.getByText(/1\.5s/)).toBeInTheDocument();
  });
});
