import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import ClearAllConfirmation from '../../src/components/ClearAllConfirmation/ClearAllConfirmation';

describe('ClearAllConfirmation', () => {
  const defaultProps = {
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders a dialog with role="dialog" and aria-modal', () => {
    render(<ClearAllConfirmation {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-label "Clear all profiles"', () => {
    render(<ClearAllConfirmation {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Clear all profiles');
  });

  it('displays the warning title and message', () => {
    render(<ClearAllConfirmation {...defaultProps} />);
    expect(screen.getByText('Clear all profiles?')).toBeInTheDocument();
    expect(
      screen.getByText(/This will delete all players and scores/),
    ).toBeInTheDocument();
  });

  it('renders Cancel and Clear all buttons', () => {
    render(<ClearAllConfirmation {...defaultProps} />);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('calls onConfirm when "Clear all" is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<ClearAllConfirmation onConfirm={onConfirm} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /clear all/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when "Cancel" is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ClearAllConfirmation onConfirm={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Escape key is pressed', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ClearAllConfirmation onConfirm={vi.fn()} onCancel={onCancel} />);

    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when overlay background is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ClearAllConfirmation onConfirm={vi.fn()} onCancel={onCancel} />,
    );

    // Click the overlay (first child of container)
    const overlay = container.firstElementChild as HTMLElement;
    await user.click(overlay);
    expect(onCancel).toHaveBeenCalled();
  });

  it('does not call onCancel when clicking inside the dialog', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ClearAllConfirmation onConfirm={vi.fn()} onCancel={onCancel} />);

    // Click the dialog title text — should not trigger cancel
    await user.click(screen.getByText('Clear all profiles?'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('focuses the dialog on mount', () => {
    render(<ClearAllConfirmation {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveFocus();
  });
});
