import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../src/hooks/useSession.tsx';
import MainPage from '../../src/pages/MainPage';
import { FEEDBACK_DURATION_MS } from '../../src/constants/scoring';
import * as formulaGenerator from '../../src/services/formulaGenerator';
import { getCorrectAnswer } from '../../src/services/gameEngine';
import {
  savePlayer,
  getPlayers,
  getRecentHighScores,
  getGameHistory,
  saveGameRecord,
} from '../../src/services/playerStorage';
import type { Formula } from '../../src/types/game';
import type { RoundResult } from '../../src/types/player';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }: { to: string }) => {
      mockNavigate(to);
      return null;
    },
  };
});

function createTestFormulas(): Formula[] {
  return [
    { factorA: 2, factorB: 3, product: 6, hiddenPosition: 'C' },
    { factorA: 4, factorB: 5, product: 20, hiddenPosition: 'A' },
    { factorA: 6, factorB: 7, product: 42, hiddenPosition: 'B' },
    { factorA: 8, factorB: 9, product: 72, hiddenPosition: 'C' },
    { factorA: 1, factorB: 11, product: 11, hiddenPosition: 'C' },
    { factorA: 3, factorB: 4, product: 12, hiddenPosition: 'A' },
    { factorA: 5, factorB: 6, product: 30, hiddenPosition: 'B' },
    { factorA: 7, factorB: 8, product: 56, hiddenPosition: 'C' },
    { factorA: 10, factorB: 12, product: 120, hiddenPosition: 'C' },
    { factorA: 9, factorB: 11, product: 99, hiddenPosition: 'A' },
  ];
}

function setUpActiveSession(playerName = 'ImproveTestPlayer') {
  const session = {
    playerName,
    avatarId: 'rocket',
    startedAt: Date.now(),
  };
  sessionStorage.setItem('turbotiply_session', JSON.stringify(session));
}

function renderMainPage() {
  return render(
    <MemoryRouter initialEntries={['/play']}>
      <SessionProvider>
        <MainPage />
      </SessionProvider>
    </MemoryRouter>,
  );
}

/**
 * Create a game record with some incorrect rounds to trigger challenging pairs.
 */
function createGameWithChallengingPairs(playerName: string) {
  const rounds: RoundResult[] = [
    { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 8000 },
    { factorA: 6, factorB: 9, isCorrect: false, elapsedMs: 7000 },
    { factorA: 2, factorB: 3, isCorrect: true, elapsedMs: 1000 },
    { factorA: 3, factorB: 4, isCorrect: true, elapsedMs: 1200 },
    { factorA: 4, factorB: 5, isCorrect: true, elapsedMs: 900 },
    { factorA: 5, factorB: 6, isCorrect: true, elapsedMs: 1100 },
    { factorA: 2, factorB: 5, isCorrect: true, elapsedMs: 800 },
    { factorA: 3, factorB: 6, isCorrect: true, elapsedMs: 1000 },
    { factorA: 4, factorB: 7, isCorrect: true, elapsedMs: 950 },
    { factorA: 2, factorB: 8, isCorrect: true, elapsedMs: 1050 },
  ];
  saveGameRecord(playerName, 25, rounds, 'play');
}

describe('Improve Mode — Score Isolation', () => {
  let formulas: Formula[];

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockNavigate.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    formulas = createTestFormulas();
    // Mock both formula generators to return controlled formulas
    vi.spyOn(formulaGenerator, 'generateFormulas').mockReturnValue(formulas);
    vi.spyOn(formulaGenerator, 'generateImproveFormulas').mockReturnValue(formulas);

    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
    savePlayer({ name: 'ImproveTestPlayer', avatarId: 'rocket' });
    // Create a play game to establish baseline scores and challenging pairs
    createGameWithChallengingPairs('ImproveTestPlayer');
    setUpActiveSession();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does not change totalScore or gamesPlayed after completing an Improve game', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Record baseline
    const playerBefore = getPlayers().find((p) => p.name === 'ImproveTestPlayer')!;
    const totalScoreBefore = playerBefore.totalScore;
    const gamesPlayedBefore = playerBefore.gamesPlayed;

    renderMainPage();

    // Click Improve button
    const improveButton = screen.getByRole('button', { name: /improve/i });
    await user.click(improveButton);

    // Play through all 10 rounds
    for (let i = 0; i < 10; i++) {
      const answer = getCorrectAnswer(formulas[i]);
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, String(answer));
      await user.click(screen.getByRole('button', { name: /submit/i }));
      act(() => {
        vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
      });
      if (i < 9) {
        await waitFor(() => {
          expect(screen.getByRole('textbox')).toBeInTheDocument();
        });
      }
    }

    // Wait for completed state
    await waitFor(() => {
      expect(screen.getByText(/you got/i)).toBeInTheDocument();
    });

    // Verify scores unchanged
    const playerAfter = getPlayers().find((p) => p.name === 'ImproveTestPlayer')!;
    expect(playerAfter.totalScore).toBe(totalScoreBefore);
    expect(playerAfter.gamesPlayed).toBe(gamesPlayedBefore);
  }, 20000);

  it('does not add to getRecentHighScores or getGameHistory after Improve game', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    const playerBefore = getPlayers().find((p) => p.name === 'ImproveTestPlayer')!;
    const highScoresBefore = getRecentHighScores(playerBefore, 5);
    const historyBefore = getGameHistory(playerBefore);

    renderMainPage();

    const improveButton = screen.getByRole('button', { name: /improve/i });
    await user.click(improveButton);

    for (let i = 0; i < 10; i++) {
      const answer = getCorrectAnswer(formulas[i]);
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, String(answer));
      await user.click(screen.getByRole('button', { name: /submit/i }));
      act(() => {
        vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
      });
      if (i < 9) {
        await waitFor(() => {
          expect(screen.getByRole('textbox')).toBeInTheDocument();
        });
      }
    }

    await waitFor(() => {
      expect(screen.getByText(/you got/i)).toBeInTheDocument();
    });

    const playerAfter = getPlayers().find((p) => p.name === 'ImproveTestPlayer')!;
    const highScoresAfter = getRecentHighScores(playerAfter, 5);
    const historyAfter = getGameHistory(playerAfter);

    // High scores and game history for progression should not include improve games
    expect(highScoresAfter.length).toBe(highScoresBefore.length);
    expect(historyAfter.length).toBe(historyBefore.length);
  }, 20000);

  it('saves round data with gameMode improve even though scores are excluded', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    renderMainPage();

    const improveButton = screen.getByRole('button', { name: /improve/i });
    await user.click(improveButton);

    for (let i = 0; i < 10; i++) {
      const answer = getCorrectAnswer(formulas[i]);
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, String(answer));
      await user.click(screen.getByRole('button', { name: /submit/i }));
      act(() => {
        vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
      });
      if (i < 9) {
        await waitFor(() => {
          expect(screen.getByRole('textbox')).toBeInTheDocument();
        });
      }
    }

    await waitFor(() => {
      expect(screen.getByText(/you got/i)).toBeInTheDocument();
    });

    // Verify the improve game record IS saved (just excluded from scoring)
    const player = getPlayers().find((p) => p.name === 'ImproveTestPlayer')!;
    const allRecords = player.gameHistory ?? [];
    const improveRecords = allRecords.filter((r) => r.gameMode === 'improve');
    expect(improveRecords.length).toBe(1);
    expect(improveRecords[0].rounds).toBeDefined();
    expect(improveRecords[0].rounds!.length).toBe(10);
  }, 20000);
});

describe('Improve Mode — Full Flow Integration', () => {
  let formulas: Formula[];

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockNavigate.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    formulas = createTestFormulas();
    vi.spyOn(formulaGenerator, 'generateFormulas').mockReturnValue(formulas);
    vi.spyOn(formulaGenerator, 'generateImproveFormulas').mockReturnValue(formulas);

    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
    savePlayer({ name: 'FlowTestPlayer', avatarId: 'star' });
    createGameWithChallengingPairs('FlowTestPlayer');
    setUpActiveSession('FlowTestPlayer');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('full Improve flow: see button → play → practice completion → scores unchanged → return to menu', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Baseline
    const playerBefore = getPlayers().find((p) => p.name === 'FlowTestPlayer')!;
    const totalScoreBefore = playerBefore.totalScore;

    renderMainPage();

    // 1. Improve button is visible (player has challenging pairs)
    expect(screen.getByRole('button', { name: /improve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^play/i })).toBeInTheDocument();

    // 2. Click Improve to start
    await user.click(screen.getByRole('button', { name: /improve/i }));

    // 3. Verify "Practice" indicator during gameplay
    expect(screen.getByText('Practice')).toBeInTheDocument();
    expect(screen.queryByText('Score:')).not.toBeInTheDocument();

    // 4. Play through all 10 rounds correctly
    for (let i = 0; i < 10; i++) {
      const answer = getCorrectAnswer(formulas[i]);
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, String(answer));
      await user.click(screen.getByRole('button', { name: /submit/i }));
      act(() => {
        vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
      });
      if (i < 9) {
        await waitFor(() => {
          expect(screen.getByRole('textbox')).toBeInTheDocument();
        });
      }
    }

    // 5. Verify practice completion screen (not score-based)
    await waitFor(() => {
      expect(screen.getByText(/you got/i)).toBeInTheDocument();
    });
    expect(screen.queryByText('Game Over!')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Score')).not.toBeInTheDocument();

    // 6. Verify scores unchanged
    const playerAfter = getPlayers().find((p) => p.name === 'FlowTestPlayer')!;
    expect(playerAfter.totalScore).toBe(totalScoreBefore);

    // 7. Click "Back to menu" to return
    await user.click(screen.getByRole('button', { name: /back to menu/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  }, 25000);
});
