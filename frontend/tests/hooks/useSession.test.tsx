import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SessionProvider, useSession } from '../../src/hooks/useSession.tsx';
import * as playerStorage from '../../src/services/playerStorage';
import type { Session } from '../../src/types/player';

/** Test component that exposes the useSession hook values. */
function TestConsumer() {
  const { session, isActive, startSession, endSession } = useSession();
  return (
    <div>
      <span data-testid="is-active">{String(isActive)}</span>
      <span data-testid="player-name">{session?.playerName ?? 'none'}</span>
      <button
        data-testid="start-btn"
        onClick={() => startSession({ name: 'Mia', avatarId: 'cat' })}
      >
        Start
      </button>
      <button data-testid="end-btn" onClick={() => endSession()}>
        End
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <SessionProvider>
      <TestConsumer />
    </SessionProvider>,
  );
}

describe('useSession', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('reads existing session from sessionStorage on mount', () => {
    const existingSession: Session = {
      playerName: 'Mia',
      avatarId: 'cat',
      startedAt: 1000,
    };
    sessionStorage.setItem('turbotiply_session', JSON.stringify(existingSession));

    renderWithProvider();

    expect(screen.getByTestId('is-active').textContent).toBe('true');
    expect(screen.getByTestId('player-name').textContent).toBe('Mia');
  });

  it('shows no session on mount when sessionStorage is empty', () => {
    renderWithProvider();

    expect(screen.getByTestId('is-active').textContent).toBe('false');
    expect(screen.getByTestId('player-name').textContent).toBe('none');
  });

  it('startSession writes to sessionStorage and updates React state', () => {
    vi.spyOn(playerStorage, 'touchPlayer').mockImplementation(() => {});
    renderWithProvider();

    act(() => {
      screen.getByTestId('start-btn').click();
    });

    expect(screen.getByTestId('is-active').textContent).toBe('true');
    expect(screen.getByTestId('player-name').textContent).toBe('Mia');
    expect(sessionStorage.getItem('turbotiply_session')).not.toBeNull();

    vi.restoreAllMocks();
  });

  it('endSession clears sessionStorage and updates React state', () => {
    vi.spyOn(playerStorage, 'touchPlayer').mockImplementation(() => {});
    renderWithProvider();

    act(() => {
      screen.getByTestId('start-btn').click();
    });
    expect(screen.getByTestId('is-active').textContent).toBe('true');

    act(() => {
      screen.getByTestId('end-btn').click();
    });
    expect(screen.getByTestId('is-active').textContent).toBe('false');
    expect(screen.getByTestId('player-name').textContent).toBe('none');

    vi.restoreAllMocks();
  });
});
