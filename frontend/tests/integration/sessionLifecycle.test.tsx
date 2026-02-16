import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider, useSession } from '../../src/hooks/useSession.tsx';
import type { Session } from '../../src/types/player';
import * as playerStorage from '../../src/services/playerStorage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/** Test component that reads session state */
function SessionDisplay() {
  const { session, isActive } = useSession();
  return (
    <div>
      <span data-testid="active">{String(isActive)}</span>
      <span data-testid="name">{session?.playerName ?? 'none'}</span>
    </div>
  );
}

function TestApp() {
  return (
    <MemoryRouter>
      <SessionProvider>
        <SessionDisplay />
      </SessionProvider>
    </MemoryRouter>
  );
}

describe('Session Lifecycle', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows no session when sessionStorage is empty (simulating tab close)', () => {
    render(<TestApp />);
    expect(screen.getByTestId('active').textContent).toBe('false');
    expect(screen.getByTestId('name').textContent).toBe('none');
  });

  it('preserves session within the same tab (sessionStorage still has data)', () => {
    const session: Session = {
      playerName: 'Mia',
      avatarId: 'cat',
      startedAt: 1000,
    };
    sessionStorage.setItem('turbotiply_session', JSON.stringify(session));

    render(<TestApp />);
    expect(screen.getByTestId('active').textContent).toBe('true');
    expect(screen.getByTestId('name').textContent).toBe('Mia');
  });

  it('visibilitychange updates lastActive via touchPlayer', () => {
    const touchSpy = vi.spyOn(playerStorage, 'touchPlayer').mockImplementation(() => {});

    const session: Session = {
      playerName: 'Mia',
      avatarId: 'cat',
      startedAt: 1000,
    };
    sessionStorage.setItem('turbotiply_session', JSON.stringify(session));

    render(<TestApp />);

    // Simulate visibilitychange to hidden
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(touchSpy).toHaveBeenCalledWith('Mia');

    // Reset
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
    vi.restoreAllMocks();
  });
});
