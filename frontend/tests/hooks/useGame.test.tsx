import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from '../../src/hooks/useGame';

describe('useGame', () => {
  it('initial status is not-started', () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.gameState.status).toBe('not-started');
    expect(result.current.currentRound).toBeNull();
    expect(result.current.correctAnswer).toBeNull();
  });

  it('startGame sets status to playing with 10 rounds', () => {
    const { result } = renderHook(() => useGame());

    act(() => result.current.startGame());

    expect(result.current.gameState.status).toBe('playing');
    expect(result.current.gameState.rounds).toHaveLength(10);
    expect(result.current.currentRound).not.toBeNull();
    expect(result.current.correctAnswer).not.toBeNull();
  });

  it('submitAnswer transitions to feedback and records answer', () => {
    const { result } = renderHook(() => useGame());

    act(() => result.current.startGame());

    const correctAnswer = result.current.correctAnswer!;
    act(() => result.current.submitAnswer(correctAnswer, 1500));

    expect(result.current.gameState.currentPhase).toBe('feedback');
    expect(result.current.gameState.rounds[0].playerAnswer).toBe(correctAnswer);
    expect(result.current.gameState.rounds[0].isCorrect).toBe(true);
  });

  it('nextRound advances to next round', () => {
    const { result } = renderHook(() => useGame());

    act(() => result.current.startGame());

    const correctAnswer = result.current.correctAnswer!;
    act(() => result.current.submitAnswer(correctAnswer, 1500));
    act(() => result.current.nextRound());

    expect(result.current.gameState.currentRoundIndex).toBe(1);
    expect(result.current.gameState.currentPhase).toBe('input');
  });

  it('resetGame returns to not-started', () => {
    const { result } = renderHook(() => useGame());

    act(() => result.current.startGame());
    act(() => result.current.resetGame());

    expect(result.current.gameState.status).toBe('not-started');
    expect(result.current.currentRound).toBeNull();
  });

  it('currentRound and correctAnswer update as rounds advance', () => {
    const { result } = renderHook(() => useGame());

    act(() => result.current.startGame());

    const firstFormula = result.current.currentRound!.formula;
    const correctAnswer = result.current.correctAnswer!;

    act(() => result.current.submitAnswer(correctAnswer, 1500));
    act(() => result.current.nextRound());

    const secondFormula = result.current.currentRound!.formula;
    expect(secondFormula).not.toEqual(firstFormula);
  });
});
