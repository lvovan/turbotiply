import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';
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
    sessionStorage.setItem('multis_session', JSON.stringify(session));
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

  it('displays 👥 emoji as the switch-player button content', () => {
    renderHeader(mockSession);
    const btn = screen.getByRole('button', { name: /switch player/i });
    expect(btn).toHaveTextContent('👥');
  });

  it('does not display translated text inside the switch-player button', () => {
    renderHeader(mockSession);
    const btn = screen.getByRole('button', { name: /switch player/i });
    // The visible text content should be only the emoji, not the translated label
    expect(btn.textContent).toBe('👥');
  });

  it('has a localised aria-label on the switch-player button', () => {
    renderHeader(mockSession);
    const btn = screen.getByRole('button', { name: /switch player/i });
    expect(btn).toHaveAttribute('aria-label', 'Switch player');
  });

  it('calls endSession and navigates to / when "Switch player" is clicked', async () => {
    const user = userEvent.setup();
    renderHeader(mockSession);

    await user.click(screen.getByRole('button', { name: /switch player/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(sessionStorage.getItem('multis_session')).toBeNull();
  });

  it('shows app title "Multis!" when session is active', () => {
    renderHeader(mockSession);
    expect(screen.getByText('Multis!')).toBeInTheDocument();
  });
});

describe('Header (unauthenticated)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders a header element when no session is active', () => {
    renderHeader(null);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('shows app title "Multis!" when no session is active', () => {
    renderHeader(null);
    expect(screen.getByText('Multis!')).toBeInTheDocument();
  });

  it('does not show greeting when no session is active', () => {
    renderHeader(null);
    expect(screen.queryByText(/hi,/i)).not.toBeInTheDocument();
  });

  it('does not show "Switch player" button when no session is active', () => {
    renderHeader(null);
    expect(screen.queryByRole('button', { name: /switch player/i })).not.toBeInTheDocument();
  });
});
