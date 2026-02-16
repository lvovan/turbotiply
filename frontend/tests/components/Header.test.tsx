import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../src/components/Header/Header';
import { SessionProvider } from '../../src/hooks/useSession.tsx';
import type { Session } from '../../src/types/player';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderHeader(session: Session | null = null) {
  if (session) {
    sessionStorage.setItem('turbotiply_session', JSON.stringify(session));
  }
  return render(
    <MemoryRouter>
      <SessionProvider>
        <Header />
      </SessionProvider>
    </MemoryRouter>,
  );
}

const mockSession: Session = {
  playerName: 'Mia',
  avatarId: 'cat',
  startedAt: Date.now(),
};

describe('Header', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('displays the player name when session is active', () => {
    renderHeader(mockSession);
    expect(screen.getByText(/hi, mia/i)).toBeInTheDocument();
  });

  it('displays the player avatar', () => {
    renderHeader(mockSession);
    expect(screen.getByText('🐱')).toBeInTheDocument();
  });

  it('shows "Switch player" button', () => {
    renderHeader(mockSession);
    expect(screen.getByRole('button', { name: /switch player/i })).toBeInTheDocument();
  });

  it('calls endSession and navigates to / when "Switch player" is clicked', async () => {
    const user = userEvent.setup();
    renderHeader(mockSession);

    await user.click(screen.getByRole('button', { name: /switch player/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(sessionStorage.getItem('turbotiply_session')).toBeNull();
  });

  it('renders nothing when no session is active', () => {
    const { container } = renderHeader(null);
    expect(container.innerHTML).toBe('');
  });
});
