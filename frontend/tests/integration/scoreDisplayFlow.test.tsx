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
  getRecentAverage,
  getRecentHighScores,
  getGameHistory,
} from '../../src/services/playerStorage';
import type { Formula } from '../../src/types/game';

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

function setUpActiveSession() {
  const session = {
    playerName: 'ScoreTestPlayer',
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

async function playFullGame(user: ReturnType<typeof userEvent.setup>, formulas: Formula[]) {
  // Click start
  const startButton = screen.getByRole('button', { name: /start game/i });
  await user.click(startButton);

  // Answer all 10 rounds correctly
  for (let i = 0; i < 10; i++) {
    const answer = getCorrectAnswer(formulas[i]);
    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, String(answer));
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Advance past feedback duration
    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
    });

    // Wait for next round or completed state
    if (i < 9) {
      await waitFor(() => {
        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
      });
    }
  }

  // Wait for completed state
  await waitFor(() => {
    expect(screen.getByText(/game over/i)).toBeInTheDocument();
  });
}

describe('Score Display Integration', () => {
  let formulas: Formula[];

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockNavigate.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    formulas = createTestFormulas();
    vi.spyOn(formulaGenerator, 'generateFormulas').mockReturnValue(formulas);

    // Create the player then set up session
    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
    savePlayer({ name: 'ScoreTestPlayer', avatarId: 'rocket' });
    setUpActiveSession();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('persists GameRecord after completing a game', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();
    await playFullGame(user, formulas);

    // Verify GameRecord was persisted
    const players = getPlayers();
    const player = players.find((p) => p.name === 'ScoreTestPlayer');
    expect(player).toBeDefined();
    expect(player!.gameHistory).toBeDefined();
    expect(player!.gameHistory!.length).toBeGreaterThanOrEqual(1);

    // The most recent GameRecord should have a score > 0 (all correct answers)
    const lastRecord = player!.gameHistory![player!.gameHistory!.length - 1];
    expect(lastRecord.score).toBeGreaterThan(0);
    expect(lastRecord.completedAt).toBeGreaterThan(0);
  }, 15000);

  it('getRecentAverage reflects game history after a game', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();
    await playFullGame(user, formulas);

    const players = getPlayers();
    const player = players.find((p) => p.name === 'ScoreTestPlayer')!;
    const avg = getRecentAverage(player, 10);
    expect(avg).not.toBeNull();
    expect(avg).toBeGreaterThan(0);
  }, 15000);

  it('getRecentHighScores returns scores sorted descending', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();
    await playFullGame(user, formulas);

    const players = getPlayers();
    const player = players.find((p) => p.name === 'ScoreTestPlayer')!;
    const highScores = getRecentHighScores(player, 5);
    expect(highScores.length).toBeGreaterThanOrEqual(1);

    // Should be sorted descending
    for (let i = 1; i < highScores.length; i++) {
      expect(highScores[i - 1].score).toBeGreaterThanOrEqual(highScores[i].score);
    }
  }, 15000);

  it('getGameHistory returns chronological game records', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();
    await playFullGame(user, formulas);

    const players = getPlayers();
    const player = players.find((p) => p.name === 'ScoreTestPlayer')!;
    const history = getGameHistory(player);
    expect(history.length).toBeGreaterThanOrEqual(1);

    // Should be chronological
    for (let i = 1; i < history.length; i++) {
      expect(history[i].completedAt).toBeGreaterThanOrEqual(history[i - 1].completedAt);
    }
  }, 15000);

  it('new player sees encouraging empty-state message on pre-game screen', () => {
    renderMainPage();
    expect(screen.getByText(/play your first game/i)).toBeInTheDocument();
  });

  it('RecentHighScores heading is visible on pre-game screen', () => {
    renderMainPage();
    expect(screen.getByRole('heading', { name: /recent high scores/i })).toBeInTheDocument();
  });
});
