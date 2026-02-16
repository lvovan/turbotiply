import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewPlayerForm from '../../src/components/WelcomeScreen/NewPlayerForm';

describe('NewPlayerForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    playerExists: vi.fn().mockReturnValue(false),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders name input, avatar picker, and submit button', () => {
    render(<NewPlayerForm {...defaultProps} />);

    expect(screen.getByRole('textbox', { name: /your name/i })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: /choose your avatar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /let's go/i })).toBeInTheDocument();
  });

  it('disables submit button when name is empty', () => {
    render(<NewPlayerForm {...defaultProps} />);
    const submitBtn = screen.getByRole('button', { name: /let's go/i });
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button when name is provided', async () => {
    const user = userEvent.setup();
    render(<NewPlayerForm {...defaultProps} />);

    const nameInput = screen.getByRole('textbox', { name: /your name/i });
    await user.type(nameInput, 'Mia');

    const submitBtn = screen.getByRole('button', { name: /let's go/i });
    expect(submitBtn).toBeEnabled();
  });

  it('disables submit button for whitespace-only name', async () => {
    const user = userEvent.setup();
    render(<NewPlayerForm {...defaultProps} />);

    const nameInput = screen.getByRole('textbox', { name: /your name/i });
    await user.type(nameInput, '   ');

    const submitBtn = screen.getByRole('button', { name: /let's go/i });
    expect(submitBtn).toBeDisabled();
  });

  it('enforces 20-character limit on name input', async () => {
    const user = userEvent.setup();
    render(<NewPlayerForm {...defaultProps} />);

    const nameInput = screen.getByRole('textbox', { name: /your name/i });
    await user.type(nameInput, 'A'.repeat(25));

    expect((nameInput as HTMLInputElement).value).toHaveLength(20);
  });

  it('has default avatar pre-selected', () => {
    render(<NewPlayerForm {...defaultProps} />);

    // First avatar (rocket) should be selected by default
    const avatarRadios = screen.getAllByRole('radio');
    const checkedRadios = avatarRadios.filter(
      (r) => (r as HTMLInputElement).getAttribute('aria-checked') === 'true',
    );
    expect(checkedRadios.length).toBeGreaterThanOrEqual(1); // one avatar
  });

  it('calls onSubmit with player data when form is submitted', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<NewPlayerForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByRole('textbox', { name: /your name/i });
    await user.type(nameInput, 'Mia');

    const submitBtn = screen.getByRole('button', { name: /let's go/i });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Mia',
        avatarId: expect.any(String),
      }),
    );
  });

  it('trims the name before submitting', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<NewPlayerForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByRole('textbox', { name: /your name/i });
    await user.type(nameInput, '  Mia  ');

    const submitBtn = screen.getByRole('button', { name: /let's go/i });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Mia' }),
    );
  });

  describe('duplicate name overwrite confirmation (FR-012)', () => {
    it('shows overwrite confirmation dialog when duplicate name is submitted', async () => {
      const playerExists = vi.fn().mockReturnValue(true);
      const user = userEvent.setup();
      render(<NewPlayerForm {...defaultProps} playerExists={playerExists} />);

      const nameInput = screen.getByRole('textbox', { name: /your name/i });
      await user.type(nameInput, 'Mia');
      await user.click(screen.getByRole('button', { name: /let's go/i }));

      // Confirmation dialog should appear
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/a player called mia already exists/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /replace/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('does not call onSubmit when duplicate dialog is shown', async () => {
      const onSubmit = vi.fn();
      const playerExists = vi.fn().mockReturnValue(true);
      const user = userEvent.setup();
      render(<NewPlayerForm onSubmit={onSubmit} playerExists={playerExists} />);

      const nameInput = screen.getByRole('textbox', { name: /your name/i });
      await user.type(nameInput, 'Mia');
      await user.click(screen.getByRole('button', { name: /let's go/i }));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit when "Replace" is clicked in overwrite confirmation', async () => {
      const onSubmit = vi.fn();
      const playerExists = vi.fn().mockReturnValue(true);
      const user = userEvent.setup();
      render(<NewPlayerForm onSubmit={onSubmit} playerExists={playerExists} />);

      const nameInput = screen.getByRole('textbox', { name: /your name/i });
      await user.type(nameInput, 'Mia');
      await user.click(screen.getByRole('button', { name: /let's go/i }));
      await user.click(screen.getByRole('button', { name: /replace/i }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Mia' }),
      );
    });

    it('dismisses dialog when "Go back" is clicked', async () => {
      const onSubmit = vi.fn();
      const playerExists = vi.fn().mockReturnValue(true);
      const user = userEvent.setup();
      render(<NewPlayerForm onSubmit={onSubmit} playerExists={playerExists} />);

      const nameInput = screen.getByRole('textbox', { name: /your name/i });
      await user.type(nameInput, 'Mia');
      await user.click(screen.getByRole('button', { name: /let's go/i }));

      // Dialog is visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click Go back
      await user.click(screen.getByRole('button', { name: /go back/i }));

      // Dialog should be dismissed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('dismisses dialog on Escape key', async () => {
      const playerExists = vi.fn().mockReturnValue(true);
      const user = userEvent.setup();
      render(<NewPlayerForm {...defaultProps} playerExists={playerExists} />);

      const nameInput = screen.getByRole('textbox', { name: /your name/i });
      await user.type(nameInput, 'Mia');
      await user.click(screen.getByRole('button', { name: /let's go/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('submit button stays enabled for duplicate names (not error-blocked)', async () => {
      const playerExists = vi.fn().mockReturnValue(true);
      const user = userEvent.setup();
      render(<NewPlayerForm {...defaultProps} playerExists={playerExists} />);

      const nameInput = screen.getByRole('textbox', { name: /your name/i });
      await user.type(nameInput, 'Mia');

      const submitBtn = screen.getByRole('button', { name: /let's go/i });
      expect(submitBtn).toBeEnabled();
    });
  });
});
