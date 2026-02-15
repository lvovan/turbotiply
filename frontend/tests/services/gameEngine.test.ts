import { describe, it, expect } from 'vitest';
import {
  gameReducer,
  initialGameState,
  getCorrectAnswer,
  getCurrentRound,
} from '../../src/services/gameEngine';
import type { Formula, GameState } from '../../src/types/game';
import { calculateScore } from '../../src/constants/scoring';

/** Helper: create a set of 10 mock formulas for testing. */
function createMockFormulas(): Formula[] {
  return Array.from({ length: 10 }, (_, i) => ({
    factorA: i + 1,
    factorB: i + 2,
    product: (i + 1) * (i + 2),
    hiddenPosition: (['A', 'B', 'C'] as const)[i % 3],
  }));
}

/** Helper: advance state through N rounds with correct answers. */
function playCorrectRounds(state: GameState, count: number): GameState {
  let s = state;
  for (let i = 0; i < count; i++) {
    const round = getCurrentRound(s);
    if (!round) break;
    const correct = getCorrectAnswer(round.formula);
    s = gameReducer(s, { type: 'SUBMIT_ANSWER', answer: correct, elapsedMs: 1500 });
    s = gameReducer(s, { type: 'NEXT_ROUND' });
  }
  return s;
}

describe('initialGameState', () => {
  it('has the correct initial shape', () => {
    expect(initialGameState).toEqual({
      status: 'not-started',
      rounds: [],
      replayQueue: [],
      currentRoundIndex: 0,
      currentPhase: 'input',
      score: 0,
    });
  });
});

describe('getCorrectAnswer', () => {
  it('returns factorA when hiddenPosition is A', () => {
    const formula: Formula = { factorA: 3, factorB: 7, product: 21, hiddenPosition: 'A' };
    expect(getCorrectAnswer(formula)).toBe(3);
  });

  it('returns factorB when hiddenPosition is B', () => {
    const formula: Formula = { factorA: 3, factorB: 7, product: 21, hiddenPosition: 'B' };
    expect(getCorrectAnswer(formula)).toBe(7);
  });

  it('returns product when hiddenPosition is C', () => {
    const formula: Formula = { factorA: 3, factorB: 7, product: 21, hiddenPosition: 'C' };
    expect(getCorrectAnswer(formula)).toBe(21);
  });
});

describe('getCurrentRound', () => {
  it('returns null when game is not-started', () => {
    expect(getCurrentRound(initialGameState)).toBeNull();
  });

  it('returns null when game is completed', () => {
    const state: GameState = {
      ...initialGameState,
      status: 'completed',
      rounds: createMockFormulas().map((formula) => ({
        formula,
        playerAnswer: 1,
        isCorrect: true,
        elapsedMs: 1000,
        points: 5,
      })),
    };
    expect(getCurrentRound(state)).toBeNull();
  });

  it('returns correct round during playing', () => {
    const formulas = createMockFormulas();
    let state = gameReducer(initialGameState, {
      type: 'START_GAME',
      formulas,
    });
    const round = getCurrentRound(state);
    expect(round).not.toBeNull();
    expect(round!.formula).toEqual(formulas[0]);
  });

  it('returns correct round during replay', () => {
    const formulas = createMockFormulas();
    let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

    // Answer round 0 incorrectly
    state = gameReducer(state, { type: 'SUBMIT_ANSWER', answer: -999, elapsedMs: 1000 });
    state = gameReducer(state, { type: 'NEXT_ROUND' });

    // Answer rounds 1-9 correctly
    state = playCorrectRounds(state, 9);

    expect(state.status).toBe('replay');
    const replayRound = getCurrentRound(state);
    expect(replayRound).not.toBeNull();
    expect(replayRound!.formula).toEqual(formulas[0]);
  });
});

describe('gameReducer', () => {
  describe('START_GAME', () => {
    it('creates 10 rounds and sets status to playing', () => {
      const formulas = createMockFormulas();
      const state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      expect(state.status).toBe('playing');
      expect(state.rounds).toHaveLength(10);
      expect(state.currentRoundIndex).toBe(0);
      expect(state.currentPhase).toBe('input');
      expect(state.score).toBe(0);
      expect(state.replayQueue).toEqual([]);
    });

    it('initializes each round with null fields', () => {
      const formulas = createMockFormulas();
      const state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      state.rounds.forEach((round, i) => {
        expect(round.formula).toEqual(formulas[i]);
        expect(round.playerAnswer).toBeNull();
        expect(round.isCorrect).toBeNull();
        expect(round.elapsedMs).toBeNull();
        expect(round.points).toBeNull();
      });
    });

    it('is a no-op when not in not-started state', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });
      const state2 = gameReducer(state, { type: 'START_GAME', formulas });
      expect(state2).toBe(state);
    });
  });

  describe('SUBMIT_ANSWER', () => {
    it('evaluates correct answer and transitions to feedback', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      const correctAnswer = getCorrectAnswer(formulas[0]);
      state = gameReducer(state, {
        type: 'SUBMIT_ANSWER',
        answer: correctAnswer,
        elapsedMs: 1500,
      });

      expect(state.currentPhase).toBe('feedback');
      expect(state.rounds[0].isCorrect).toBe(true);
      expect(state.rounds[0].playerAnswer).toBe(correctAnswer);
      expect(state.rounds[0].elapsedMs).toBe(1500);
    });

    it('calculates score for correct answer using calculateScore', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      const correctAnswer = getCorrectAnswer(formulas[0]);
      state = gameReducer(state, {
        type: 'SUBMIT_ANSWER',
        answer: correctAnswer,
        elapsedMs: 1500,
      });

      const expectedPoints = calculateScore(true, 1500);
      expect(state.rounds[0].points).toBe(expectedPoints);
      expect(state.score).toBe(expectedPoints);
    });

    it('evaluates incorrect answer with penalty', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      state = gameReducer(state, {
        type: 'SUBMIT_ANSWER',
        answer: -999,
        elapsedMs: 800,
      });

      expect(state.rounds[0].isCorrect).toBe(false);
      expect(state.rounds[0].points).toBe(-2);
      expect(state.score).toBe(-2);
    });

    it('is a no-op during feedback phase', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      const correctAnswer = getCorrectAnswer(formulas[0]);
      state = gameReducer(state, {
        type: 'SUBMIT_ANSWER',
        answer: correctAnswer,
        elapsedMs: 1500,
      });

      const state2 = gameReducer(state, {
        type: 'SUBMIT_ANSWER',
        answer: 999,
        elapsedMs: 500,
      });
      expect(state2).toBe(state);
    });

    it('is a no-op when game is not-started', () => {
      const state = gameReducer(initialGameState, {
        type: 'SUBMIT_ANSWER',
        answer: 5,
        elapsedMs: 1000,
      });
      expect(state).toBe(initialGameState);
    });
  });

  describe('NEXT_ROUND', () => {
    it('advances currentRoundIndex', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      const correctAnswer = getCorrectAnswer(formulas[0]);
      state = gameReducer(state, {
        type: 'SUBMIT_ANSWER',
        answer: correctAnswer,
        elapsedMs: 1500,
      });
      state = gameReducer(state, { type: 'NEXT_ROUND' });

      expect(state.currentRoundIndex).toBe(1);
      expect(state.currentPhase).toBe('input');
    });

    it('transitions to completed when all 10 rounds correct', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      state = playCorrectRounds(state, 10);

      expect(state.status).toBe('completed');
    });

    it('transitions to replay when failures exist after round 10', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      // Answer round 0 incorrectly
      state = gameReducer(state, { type: 'SUBMIT_ANSWER', answer: -999, elapsedMs: 1000 });
      state = gameReducer(state, { type: 'NEXT_ROUND' });

      // Answer rounds 1–9 correctly
      state = playCorrectRounds(state, 9);

      expect(state.status).toBe('replay');
      expect(state.replayQueue).toContain(0);
      expect(state.currentRoundIndex).toBe(0);
      expect(state.currentPhase).toBe('input');
    });

    it('is a no-op during input phase', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      const state2 = gameReducer(state, { type: 'NEXT_ROUND' });
      expect(state2).toBe(state);
    });
  });

  describe('Replay phase', () => {
    function setupReplayState(): GameState {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      // Answer rounds 0 and 1 incorrectly
      state = gameReducer(state, { type: 'SUBMIT_ANSWER', answer: -999, elapsedMs: 1000 });
      state = gameReducer(state, { type: 'NEXT_ROUND' });
      state = gameReducer(state, { type: 'SUBMIT_ANSWER', answer: -999, elapsedMs: 1000 });
      state = gameReducer(state, { type: 'NEXT_ROUND' });

      // Answer rounds 2–9 correctly
      state = playCorrectRounds(state, 8);

      expect(state.status).toBe('replay');
      return state;
    }

    it('does not award or deduct points during replay', () => {
      let state = setupReplayState();
      const scoreBefore = state.score;

      // Answer replay round correctly
      const round = getCurrentRound(state);
      const correct = getCorrectAnswer(round!.formula);
      state = gameReducer(state, { type: 'SUBMIT_ANSWER', answer: correct, elapsedMs: 2000 });

      expect(state.score).toBe(scoreBefore);
      // Points should be null for replay rounds
      const replayRoundIndex = state.replayQueue[0];
      expect(state.rounds[replayRoundIndex].points).toBeNull();
    });

    it('re-queues incorrect replay round', () => {
      let state = setupReplayState();
      const queueLengthBefore = state.replayQueue.length;

      // Answer replay round incorrectly
      state = gameReducer(state, { type: 'SUBMIT_ANSWER', answer: -999, elapsedMs: 1000 });
      state = gameReducer(state, { type: 'NEXT_ROUND' });

      // The failed round should be re-appended
      expect(state.replayQueue.length).toBeGreaterThanOrEqual(queueLengthBefore);
    });

    it('transitions to completed when all replay rounds answered correctly', () => {
      let state = setupReplayState();

      // Answer all replay rounds correctly
      while (state.status === 'replay') {
        const round = getCurrentRound(state);
        if (!round) break;
        const correct = getCorrectAnswer(round.formula);
        state = gameReducer(state, { type: 'SUBMIT_ANSWER', answer: correct, elapsedMs: 1500 });
        state = gameReducer(state, { type: 'NEXT_ROUND' });
      }

      expect(state.status).toBe('completed');
    });

    it('uses same formula and hidden position as original round', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      // Answer round 0 incorrectly
      const originalFormula = state.rounds[0].formula;
      state = gameReducer(state, { type: 'SUBMIT_ANSWER', answer: -999, elapsedMs: 1000 });
      state = gameReducer(state, { type: 'NEXT_ROUND' });

      // Complete remaining 9 rounds
      state = playCorrectRounds(state, 9);

      expect(state.status).toBe('replay');
      const replayRound = getCurrentRound(state);
      expect(replayRound!.formula).toEqual(originalFormula);
    });
  });

  describe('RESET_GAME', () => {
    it('returns to initialGameState', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });

      state = gameReducer(state, { type: 'RESET_GAME' });
      expect(state).toEqual(initialGameState);
    });

    it('works from any state', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });
      const correctAnswer = getCorrectAnswer(formulas[0]);
      state = gameReducer(state, {
        type: 'SUBMIT_ANSWER',
        answer: correctAnswer,
        elapsedMs: 1500,
      });

      state = gameReducer(state, { type: 'RESET_GAME' });
      expect(state).toEqual(initialGameState);
    });
  });

  describe('Invalid actions', () => {
    it('returns state unchanged for invalid action', () => {
      const state = gameReducer(initialGameState, { type: 'NEXT_ROUND' });
      expect(state).toBe(initialGameState);
    });

    it('SUBMIT_ANSWER is a no-op when completed', () => {
      const formulas = createMockFormulas();
      let state = gameReducer(initialGameState, { type: 'START_GAME', formulas });
      state = playCorrectRounds(state, 10);
      expect(state.status).toBe('completed');

      const state2 = gameReducer(state, {
        type: 'SUBMIT_ANSWER',
        answer: 5,
        elapsedMs: 1000,
      });
      expect(state2).toBe(state);
    });
  });
});
