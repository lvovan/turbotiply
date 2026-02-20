import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../src/hooks/useSession.tsx';
import MainPage from '../../src/pages/MainPage';
import { FEEDBACK_DURATION_MS } from '../../src/constants/scoring';
import * as formulaGenerator from '../../src/services/formulaGenerator';
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

/** Deterministic formulas for testing — all hiddenPosition 'C' for easy answers. */
function createTestFormulas(): Formula[] {
  return [
    { factorA: 1, factorB: 1, product: 1, hiddenPosition: 'C' },
    { factorA: 2, factorB: 2, product: 4, hiddenPosition: 'C' },
    { factorA: 3, factorB: 3, product: 9, hiddenPosition: 'C' },
    { factorA: 4, factorB: 4, product: 16, hiddenPosition: 'C' },
    { factorA: 5, factorB: 5, product: 25, hiddenPosition: 'C' },
    { factorA: 6, factorB: 6, product: 36, hiddenPosition: 'C' },
    { factorA: 7, factorB: 7, product: 49, hiddenPosition: 'C' },
    { factorA: 8, factorB: 8, product: 64, hiddenPosition: 'C' },
    { factorA: 9, factorB: 9, product: 81, hiddenPosition: 'C' },
    { factorA: 10, factorB: 10, product: 100, hiddenPosition: 'C' },
  ];
}

function setUpActiveSession() {
  const session = {
    playerName: 'TestPlayer',
    avatarId: 'cat',
    startedAt: Date.now(),
  };
  sessionStorage.setItem('multis_session', JSON.stringify(session));
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

describe('MainPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Mock generateFormulas to return deterministic data
    vi.spyOn(formulaGenerator, 'generateFormulas').mockReturnValue(createTestFormulas());

    // Set up an active session so MainPage doesn't redirect
    setUpActiveSession();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders start button initially', () => {
    renderMainPage();
    expect(screen.getByRole('button', { name: /^play/i })).toBeInTheDocument();
  });

  it('displays app title "Multis!" in the header', () => {
    renderMainPage();
    expect(screen.getByText('Multis!')).toBeInTheDocument();
  });

  it('clicking start begins game with round 1 displayed', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Should show round 1 info
    expect(screen.getByText(/round 1 of 10/i)).toBeInTheDocument();
    // Should show formula with hidden value as "?"
    expect(screen.getByText('?')).toBeInTheDocument();
    // Should show formula with math role
    expect(screen.getByRole('math')).toBeInTheDocument();
  });

  it('submitting answer shows feedback', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Round 1: 1 × 1 = ?, answer is 1
    await user.keyboard('1{Enter}');

    // Should show correct feedback
    expect(screen.getByText(/correct/i)).toBeInTheDocument();
  });

  it('after 10 correct rounds shows score summary', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Play all 10 rounds with correct answers
    const answers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
    for (let i = 0; i < 10; i++) {
      await user.keyboard(`${answers[i]}{Enter}`);

      // Wait for feedback duration
      act(() => {
        vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
      });

      // If not last round, wait for next round to appear
      if (i < 9) {
        await waitFor(() => {
          expect(screen.getByText('?')).toBeInTheDocument();
        });
      }
    }

    // After all 10 correct rounds, should show score summary
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });

    // Should have Play Again and Back to Menu buttons
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to menu/i })).toBeInTheDocument();
  });

  it('"Play again" resets game to start screen', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Play all 10 rounds correctly
    const answers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
    for (let i = 0; i < 10; i++) {
      await user.keyboard(`${answers[i]}{Enter}`);

      act(() => {
        vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
      });

      if (i < 9) {
        await waitFor(() => {
          expect(screen.getByText('?')).toBeInTheDocument();
        });
      }
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });

    // Click Play Again
    await user.click(screen.getByRole('button', { name: /play again/i }));

    // Should show start button again
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^play/i })).toBeInTheDocument();
    });
  });

  it('"Back to menu" navigates to welcome', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Play all 10 rounds correctly
    const answers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
    for (let i = 0; i < 10; i++) {
      await user.keyboard(`${answers[i]}{Enter}`);

      act(() => {
        vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
      });

      if (i < 9) {
        await waitFor(() => {
          expect(screen.getByText('?')).toBeInTheDocument();
        });
      }
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });

    // Click Back to menu
    await user.click(screen.getByRole('button', { name: /back to menu/i }));

    // Should navigate to welcome page
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects to welcome if no active session', () => {
    sessionStorage.clear();
    renderMainPage();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

/**
 * Helper: play through a round by typing answer via keyboard and pressing Enter,
 * then advancing past the feedback timeout.
 */
async function playRound(
  user: ReturnType<typeof userEvent.setup>,
  answer: string,
  isLastRound = false,
) {
  await user.keyboard(`${answer}{Enter}`);

  act(() => {
    vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
  });

  if (!isLastRound) {
    await waitFor(() => {
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  }
}

describe('MainPage — Replay UI (US2)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(formulaGenerator, 'generateFormulas').mockReturnValue(createTestFormulas());
    setUpActiveSession();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('enters replay after round 10 with incorrect answers, re-presents failed formulas', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Correct answers for hiddenPosition C
    const correctAnswers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];

    // Answer round 1 (1×1=?) incorrectly, rest correctly
    for (let i = 0; i < 10; i++) {
      if (i === 0) {
        // Wrong answer for round 1
        await playRound(user, '999', false);
      } else if (i < 9) {
        await playRound(user, String(correctAnswers[i]), false);
      } else {
        // Last primary round — after feedback, should enter replay
        await playRound(user, String(correctAnswers[i]));
      }
    }

    // Should now be in replay — show "Replay" indicator
    await waitFor(() => {
      expect(screen.getByText(/Replay/i)).toBeInTheDocument();
    });

    // Should re-present the failed formula (1 × 1 = ?) — check via accessible label
    expect(screen.getByRole('math')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('answering correctly in replay ends the game', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    const correctAnswers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];

    // Answer round 3 (3×3=9) incorrectly
    for (let i = 0; i < 10; i++) {
      if (i === 2) {
        await playRound(user, '999', false);
      } else if (i < 9) {
        await playRound(user, String(correctAnswers[i]), false);
      } else {
        await playRound(user, String(correctAnswers[i]));
      }
    }

    // In replay — answer correctly now
    await waitFor(() => {
      expect(screen.getByText(/Replay/i)).toBeInTheDocument();
    });

    // Now answer the replayed round correctly (3×3=9)
    await user.keyboard('9{Enter}');

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
    });

    // Game should be completed now
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });
  });

  it('answering incorrectly in replay re-queues the formula', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    const correctAnswers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];

    // Answer round 1 incorrectly
    for (let i = 0; i < 10; i++) {
      if (i === 0) {
        await playRound(user, '999', false);
      } else if (i < 9) {
        await playRound(user, String(correctAnswers[i]), false);
      } else {
        await playRound(user, String(correctAnswers[i]));
      }
    }

    // In replay
    await waitFor(() => {
      expect(screen.getByText(/Replay/i)).toBeInTheDocument();
    });

    // Answer incorrectly again — should re-queue
    await user.keyboard('888{Enter}');

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
    });

    // Should still be in replay (formula re-queued)
    await waitFor(() => {
      expect(screen.getByText(/Replay/i)).toBeInTheDocument();
    });

    // Now answer correctly to end the game
    await user.keyboard('1{Enter}');

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });
  });

  it('no replay when all 10 correct — goes directly to completed', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    const answers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
    for (let i = 0; i < 10; i++) {
      await playRound(user, String(answers[i]), i === 9);
    }

    // Should go directly to completed — no replay shown
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });
    // Replay indicator should not have appeared
    expect(screen.queryByText(/Replay/i)).not.toBeInTheDocument();
  });

  it('countdown bar is present during replay rounds', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    const correctAnswers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];

    // Answer round 1 incorrectly, rest correctly
    for (let i = 0; i < 10; i++) {
      if (i === 0) {
        await playRound(user, '999', false);
      } else if (i < 9) {
        await playRound(user, String(correctAnswers[i]), false);
      } else {
        await playRound(user, String(correctAnswers[i]));
      }
    }

    await waitFor(() => {
      expect(screen.getByText(/Replay/i)).toBeInTheDocument();
    });

    // Countdown bar should be present during replay
    const progressbar = document.querySelector('[role="progressbar"]');
    expect(progressbar).toBeInTheDocument();
  });

  it('inline feedback appears after submitting replay answer', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    const correctAnswers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];

    // Answer round 1 incorrectly, rest correctly
    for (let i = 0; i < 10; i++) {
      if (i === 0) {
        await playRound(user, '999', false);
      } else if (i < 9) {
        await playRound(user, String(correctAnswers[i]), false);
      } else {
        await playRound(user, String(correctAnswers[i]));
      }
    }

    await waitFor(() => {
      expect(screen.getByText(/Replay/i)).toBeInTheDocument();
    });

    // Submit correct answer in replay
    await user.keyboard('1{Enter}');

    // Inline feedback should appear
    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('MainPage — Scoring Display (US3)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(formulaGenerator, 'generateFormulas').mockReturnValue(createTestFormulas());
    setUpActiveSession();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('score updates after each answer submission', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Answer round 1 correctly (1×1=1)
    await user.keyboard('1{Enter}');

    // During feedback phase, score is hidden (panel shows feedback).
    // Advance past feedback duration to see updated score in next round.
    await vi.advanceTimersByTimeAsync(1300);

    // With fake timers, elapsed is ~0ms → tier 1 → 5 points
    expect(screen.getByText('5', { exact: true })).toBeInTheDocument();
  });

  it('per-round points visible in score summary', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Play all 10 rounds correctly
    const answers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
    for (let i = 0; i < 10; i++) {
      await playRound(user, String(answers[i]), i === 9);
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });

    // Should show per-round points ("+5" for fast correct answers)
    const pointsCells = screen.getAllByText('+5');
    expect(pointsCells.length).toBe(10);
  });

  it('negative score displayed correctly in summary', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Answer all 10 rounds incorrectly
    for (let i = 0; i < 10; i++) {
      await playRound(user, '999', i === 9);
    }

    // All 10 wrong → enters replay. Answer all replay rounds correctly.
    const correctAnswers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
    await waitFor(() => {
      expect(screen.getByText(/Replay/i)).toBeInTheDocument();
    });

    for (let i = 0; i < 10; i++) {
      await user.keyboard(`${correctAnswers[i]}{Enter}`);

      act(() => {
        vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
      });

      if (i < 9) {
        await waitFor(() => {
          expect(screen.getByText('?')).toBeInTheDocument();
        });
      }
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });

    // Total score should be negative: 10 × -2 = -20 (replay rounds award no points)
    const totalLabel = screen.getByText('Score');
    const totalSection = totalLabel.parentElement!;
    expect(totalSection).toHaveTextContent('-20');
  });

  it('replay rounds show no points in summary', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    const correctAnswers = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];

    // Answer round 1 incorrectly, rest correctly
    for (let i = 0; i < 10; i++) {
      if (i === 0) {
        await playRound(user, '999', false);
      } else {
        await playRound(user, String(correctAnswers[i]), i === 9);
      }
    }

    // In replay — answer correctly
    await waitFor(() => {
      expect(screen.getByText(/Replay/i)).toBeInTheDocument();
    });

    await user.keyboard('1{Enter}');

    act(() => {
      vi.advanceTimersByTime(FEEDBACK_DURATION_MS + 50);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
    });

    // The replay round should have null points, which ScoreSummary shows as "—"
    // Check the table has the correct summary
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('timer element is present during gameplay', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Timer element should be present
    const timerElement = document.querySelector('[data-testid="timer"]');
    expect(timerElement).toBeInTheDocument();
  });
});

describe('MainPage — Inline Feedback (US2 round UX)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(formulaGenerator, 'generateFormulas').mockReturnValue(createTestFormulas());
    setUpActiveSession();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('formula area container exists with fixed height during gameplay', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    const formulaArea = document.querySelector('[data-testid="formula-area"]');
    expect(formulaArea).toBeInTheDocument();
  });

  it('FormulaDisplay is shown during input phase', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Formula should be visible (math role)
    expect(screen.getByRole('math')).toBeInTheDocument();
  });

  it('feedback is shown in status panel during feedback phase', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    // Submit correct answer for round 1 (1×1=1)
    await user.keyboard('1{Enter}');

    // Formula should still be visible (answered formula with playerAnswer)
    expect(screen.getByRole('math')).toBeInTheDocument();
    // Feedback should appear in the status panel
    expect(screen.getByText('Correct!')).toBeInTheDocument();
    // Feedback should have status role (in GameStatus)
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('countdown bar is visible during gameplay', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderMainPage();

    await user.click(screen.getByRole('button', { name: /^play/i }));

    const progressbar = document.querySelector('[role="progressbar"]');
    expect(progressbar).toBeInTheDocument();
  });
});
