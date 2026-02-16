import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../src/hooks/useSession.tsx';
import * as playerStorage from '../../src/services/playerStorage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// We need to import WelcomePage AFTER the mock is set up
import WelcomePage from '../../src/pages/WelcomePage';

function renderWelcome() {
  return render(
    <MemoryRouter>
      <SessionProvider>
        <WelcomePage />
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('Clear All Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('shows "Clear all profiles" button when players exist', () => {
    playerStorage.savePlayer({ name: 'Alice', avatarId: 'cat' });
    playerStorage.savePlayer({ name: 'Bob', avatarId: 'robot' });

    renderWelcome();
    expect(screen.getByRole('button', { name: /clear all profiles/i })).toBeInTheDocument();
  });

  it('does not show "Clear all profiles" button on new player view', () => {
    renderWelcome();
    expect(screen.queryByRole('button', { name: /clear all profiles/i })).not.toBeInTheDocument();
  });

  it('opens confirmation dialog when clear-all is clicked', async () => {
    playerStorage.savePlayer({ name: 'Alice', avatarId: 'cat' });
    const user = userEvent.setup();
    renderWelcome();

    await user.click(screen.getByRole('button', { name: /clear all profiles/i }));
    expect(screen.getByRole('dialog', { name: /clear all profiles/i })).toBeInTheDocument();
    expect(screen.getByText(/this will delete all players/i)).toBeInTheDocument();
  });

  it('dismisses dialog without data loss on cancel', async () => {
    playerStorage.savePlayer({ name: 'Alice', avatarId: 'cat' });
    const user = userEvent.setup();
    renderWelcome();

    await user.click(screen.getByRole('button', { name: /clear all profiles/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Dialog dismissed
    expect(screen.queryByRole('dialog', { name: /clear all profiles/i })).not.toBeInTheDocument();
    // Players still here
    expect(screen.getByText('Alice')).toBeInTheDocument();
    // Storage intact
    expect(playerStorage.getPlayers()).toHaveLength(1);
  });

  it('clears storage when confirmed', async () => {
    playerStorage.savePlayer({ name: 'Alice', avatarId: 'cat' });
    playerStorage.savePlayer({ name: 'Bob', avatarId: 'robot' });

    // Mock window.location.reload to prevent JSDOM errors
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    const user = userEvent.setup();
    renderWelcome();

    await user.click(screen.getByRole('button', { name: /clear all profiles/i }));
    await user.click(screen.getByRole('button', { name: /clear all$/i }));

    // localStorage should be empty
    expect(localStorage.getItem(playerStorage.STORAGE_KEY)).toBeNull();
    // sessionStorage should be empty
    expect(sessionStorage.length).toBe(0);
    // Reload should have been called
    expect(reloadMock).toHaveBeenCalled();
  });

  it('dismisses dialog on Escape key', async () => {
    playerStorage.savePlayer({ name: 'Alice', avatarId: 'cat' });
    const user = userEvent.setup();
    renderWelcome();

    await user.click(screen.getByRole('button', { name: /clear all profiles/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: /clear all profiles/i })).not.toBeInTheDocument();
    // Storage intact
    expect(playerStorage.getPlayers()).toHaveLength(1);
  });
});
