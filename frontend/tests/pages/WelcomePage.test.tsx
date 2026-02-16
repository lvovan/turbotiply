import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../src/hooks/useSession.tsx';
import WelcomePage from '../../src/pages/WelcomePage';
import * as playerStorage from '../../src/services/playerStorage';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWelcomePage() {
  return render(
    <MemoryRouter>
      <SessionProvider>
        <WelcomePage />
      </SessionProvider>
    </MemoryRouter>,
  );
}

describe('WelcomePage (new player flow)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('shows the new player form when no players exist', () => {
    renderWelcomePage();
    expect(screen.getByRole('textbox', { name: /your name/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /let's go/i })).toBeInTheDocument();
  });

  it('navigates to /play after creating a new player', async () => {
    const user = userEvent.setup();
    renderWelcomePage();

    const nameInput = screen.getByRole('textbox', { name: /your name/i });
    await user.type(nameInput, 'Mia');

    const submitBtn = screen.getByRole('button', { name: /let's go/i });
    await user.click(submitBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/play');
  });
});

describe('WelcomePage (returning player flow)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('shows player list when players exist', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100);
    playerStorage.savePlayer({ name: 'Alice', avatarId: 'cat' });
    vi.spyOn(Date, 'now').mockReturnValue(200);
    playerStorage.savePlayer({ name: 'Bob', avatarId: 'dog' });
    vi.restoreAllMocks();

    renderWelcomePage();

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new player/i })).toBeInTheDocument();
  });

  it('navigates to /play when a player is selected', async () => {
    playerStorage.savePlayer({ name: 'Mia', avatarId: 'cat' });
    const user = userEvent.setup();
    renderWelcomePage();

    await user.click(screen.getByRole('button', { name: /play as mia/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/play');
  });

  it('shows NewPlayerForm when "New player" is clicked', async () => {
    playerStorage.savePlayer({ name: 'Mia', avatarId: 'cat' });
    const user = userEvent.setup();
    renderWelcomePage();

    await user.click(screen.getByRole('button', { name: /new player/i }));

    expect(screen.getByRole('textbox', { name: /your name/i })).toBeInTheDocument();
  });
});

describe('WelcomePage (storage unavailable)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('shows a warning and allows temporary play when storage is unavailable', async () => {
    vi.spyOn(playerStorage, 'isStorageAvailable').mockReturnValue(false);

    const user = userEvent.setup();
    renderWelcomePage();

    // Warning message is shown
    expect(screen.getByRole('alert')).toHaveTextContent(/storage is not available/i);
    expect(screen.getByText(/won't be saved/i)).toBeInTheDocument();

    // Form is still rendered
    const nameInput = screen.getByRole('textbox', { name: /your name/i });
    await user.type(nameInput, 'Guest');
    await user.click(screen.getByRole('button', { name: /let's go/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/play');

    vi.restoreAllMocks();
  });
});
