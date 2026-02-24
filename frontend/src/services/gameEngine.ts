import type { Formula, GameState, Round } from '../types/game';
import type { RoundResult } from '../types/player';
import { calculateScore } from '../constants/scoring';

/** Actions that can be dispatched to the game reducer. */
export type GameAction =
  | { type: 'START_GAME'; formulas: Formula[]; mode?: 'play' | 'improve' }
  | { type: 'SUBMIT_ANSWER'; answer: number; elapsedMs: number }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_GAME' };

/** The initial game state before any game has started. */
export const initialGameState: GameState = {
  status: 'not-started',
  rounds: [],
  replayQueue: [],
  currentRoundIndex: 0,
  currentPhase: 'input',
  score: 0,
  gameMode: 'play',
};

/**
 * Returns the correct answer for a formula based on hiddenPosition.
 */
export function getCorrectAnswer(formula: Formula): number {
  switch (formula.hiddenPosition) {
    case 'A':
      return formula.factorA;
    case 'B':
      return formula.factorB;
    case 'C':
      return formula.product;
  }
}

/**
 * Returns the current round being played, or null if not in progress.
 */
export function getCurrentRound(state: GameState): Round | null {
  if (state.status === 'playing') {
    return state.rounds[state.currentRoundIndex] ?? null;
  }
  if (state.status === 'replay') {
    const roundIndex = state.replayQueue[state.currentRoundIndex];
    return state.rounds[roundIndex] ?? null;
  }
  return null;
}

/**
 * Pure reducer function for the game state machine.
 * Returns a new GameState for every dispatched action.
 * Invalid actions return the current state unchanged (no-op, no throw).
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return handleStartGame(state, action.formulas, action.mode);
    case 'SUBMIT_ANSWER':
      return handleSubmitAnswer(state, action.answer, action.elapsedMs);
    case 'NEXT_ROUND':
      return handleNextRound(state);
    case 'RESET_GAME':
      return initialGameState;
    default:
      return state;
  }
}

function handleStartGame(state: GameState, formulas: Formula[], mode?: 'play' | 'improve'): GameState {
  if (state.status !== 'not-started') {
    return state;
  }

  const rounds: Round[] = formulas.map((formula) => ({
    formula,
    playerAnswer: null,
    isCorrect: null,
    elapsedMs: null,
    points: null,
    firstTryCorrect: null,
  }));

  return {
    status: 'playing',
    rounds,
    replayQueue: [],
    currentRoundIndex: 0,
    currentPhase: 'input',
    score: 0,
    gameMode: mode ?? 'play',
  };
}

function handleSubmitAnswer(state: GameState, answer: number, elapsedMs: number): GameState {
  // Guard: must be in input phase and playing or replay
  if (state.currentPhase !== 'input') {
    return state;
  }
  if (state.status !== 'playing' && state.status !== 'replay') {
    return state;
  }

  // Determine the actual round index
  const actualRoundIndex =
    state.status === 'replay'
      ? state.replayQueue[state.currentRoundIndex]
      : state.currentRoundIndex;

  const round = state.rounds[actualRoundIndex];
  if (!round) return state;

  const correctAnswer = getCorrectAnswer(round.formula);
  const isCorrect = answer === correctAnswer;

  // Calculate score (only during primary playing phase)
  let points: number | null = null;
  let newScore = state.score;

  if (state.status === 'playing') {
    points = calculateScore(isCorrect, elapsedMs);
    newScore = state.score + points;
  }

  // Update the round
  const newRounds = [...state.rounds];
  newRounds[actualRoundIndex] = {
    ...round,
    playerAnswer: answer,
    isCorrect,
    elapsedMs,
    points,
    // Set firstTryCorrect only during primary play; preserve existing value during replay
    firstTryCorrect: state.status === 'playing' ? isCorrect : round.firstTryCorrect,
  };

  // During replay, if incorrect, re-append to queue
  let newReplayQueue = state.replayQueue;
  if (state.status === 'replay' && !isCorrect) {
    newReplayQueue = [...state.replayQueue, actualRoundIndex];
  }

  return {
    ...state,
    rounds: newRounds,
    replayQueue: newReplayQueue,
    score: newScore,
    currentPhase: 'feedback',
  };
}

function handleNextRound(state: GameState): GameState {
  // Guard: must be in feedback phase
  if (state.currentPhase !== 'feedback') {
    return state;
  }

  if (state.status === 'playing') {
    return handleNextRoundPlaying(state);
  }

  if (state.status === 'replay') {
    return handleNextRoundReplay(state);
  }

  return state;
}

function handleNextRoundPlaying(state: GameState): GameState {
  if (state.currentRoundIndex < 9) {
    // More rounds to play
    return {
      ...state,
      currentRoundIndex: state.currentRoundIndex + 1,
      currentPhase: 'input',
    };
  }

  // Round 10 complete — check for failures
  const failedIndices = state.rounds
    .map((round, index) => (round.isCorrect === false ? index : -1))
    .filter((index) => index !== -1);

  if (failedIndices.length === 0) {
    // All correct — game complete
    return {
      ...state,
      status: 'completed',
      currentPhase: 'input',
    };
  }

  // Enter replay phase
  return {
    ...state,
    status: 'replay',
    replayQueue: failedIndices,
    currentRoundIndex: 0,
    currentPhase: 'input',
  };
}

function handleNextRoundReplay(state: GameState): GameState {
  const nextIndex = state.currentRoundIndex + 1;

  if (nextIndex < state.replayQueue.length) {
    // More replay rounds to go
    return {
      ...state,
      currentRoundIndex: nextIndex,
      currentPhase: 'input',
    };
  }

  // All replay rounds processed — but some may have been re-queued
  // Check if any rounds in the queue (after the original set) are still pending
  // Actually, re-queued items are appended during SUBMIT_ANSWER, so if we've
  // reached the end of the queue, all have been handled
  // But we need to check: have new items been appended beyond the current length?
  // No — the queue grows during SUBMIT_ANSWER, so nextIndex < replayQueue.length
  // would catch them. If we're here, we've exhausted the queue.

  return {
    ...state,
    status: 'completed',
    currentPhase: 'input',
  };
}

/**
 * Extract RoundResult[] from the primary rounds (indices 0–9) for persistence.
 * Captures initial-attempt data: factors, correctness, and elapsed time.
 * Must be called at game completion before any further state changes.
 */
export function extractRoundResults(rounds: Round[]): RoundResult[] {
  return rounds.slice(0, 10).map((round) => ({
    factorA: round.formula.factorA,
    factorB: round.formula.factorB,
    isCorrect: round.isCorrect ?? false,
    elapsedMs: round.elapsedMs ?? 0,
  }));
}
