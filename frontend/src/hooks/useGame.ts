import { useReducer, useCallback, useMemo } from 'react';
import {
  gameReducer,
  initialGameState,
  getCorrectAnswer,
  getCurrentRound,
} from '../services/gameEngine';
import { generateFormulas, generateImproveFormulas } from '../services/formulaGenerator';
import { getChallengingPairsForPlayer } from '../services/challengeAnalyzer';
import type { GameState, Round } from '../types/game';
import type { GameMode } from '../types/player';

export interface UseGameReturn {
  /** Full game state. */
  gameState: GameState;
  /** The current round being played, or null if game not in progress. */
  currentRound: Round | null;
  /** The correct answer for the current round, or null if no active round. */
  correctAnswer: number | null;
  /** Start a new game. Generates formulas and dispatches START_GAME. */
  startGame: (mode?: GameMode, playerName?: string) => void;
  /** Submit an answer for the current round. */
  submitAnswer: (answer: number, elapsedMs: number) => void;
  /** Advance to the next round after feedback. */
  nextRound: () => void;
  /** Reset the game to not-started state. */
  resetGame: () => void;
  /** Which mode the current game is being played in. */
  gameMode: GameMode;
}

/**
 * Game lifecycle hook wrapping gameEngine.
 * Provides a clean API for components to interact with game state
 * without knowing about the reducer or action types.
 */
export function useGame(): UseGameReturn {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  const currentRound = useMemo(() => getCurrentRound(gameState), [gameState]);

  const correctAnswer = useMemo(
    () => (currentRound ? getCorrectAnswer(currentRound.formula) : null),
    [currentRound],
  );

  const startGame = useCallback((mode?: GameMode, playerName?: string) => {
    let formulas;
    if (mode === 'improve' && playerName) {
      const pairs = getChallengingPairsForPlayer(playerName);
      formulas = pairs.length > 0 ? generateImproveFormulas(pairs) : generateFormulas();
    } else {
      formulas = generateFormulas();
    }
    dispatch({ type: 'START_GAME', formulas, mode: mode ?? 'play' });
  }, []);

  const submitAnswer = useCallback((answer: number, elapsedMs: number) => {
    dispatch({ type: 'SUBMIT_ANSWER', answer, elapsedMs });
  }, []);

  const nextRound = useCallback(() => {
    dispatch({ type: 'NEXT_ROUND' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    gameState,
    currentRound,
    correctAnswer,
    startGame,
    submitAnswer,
    nextRound,
    resetGame,
    gameMode: gameState.gameMode,
  };
}
