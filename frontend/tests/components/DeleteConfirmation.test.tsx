import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import DeleteConfirmation from '../../src/components/DeleteConfirmation/DeleteConfirmation';

describe('DeleteConfirmation', () => {
  const defaultProps = {
    playerName: 'Mia',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('shows the player name in the confirmation prompt', () => {
    render(<DeleteConfirmation {...defaultProps} />);
    expect(screen.getByText(/remove mia/i)).toBeInTheDocument();
    expect(screen.getByText(/scores will be lost/i)).toBeInTheDocument();
  });

  it('calls onConfirm when "Remove" is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<DeleteConfirmation {...defaultProps} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: /^remove$/i }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when "Cancel" is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<DeleteConfirmation {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('has accessible dialog role', () => {
    render(<DeleteConfirmation {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('dismisses on Escape key', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<DeleteConfirmation {...defaultProps} onCancel={onCancel} />);

    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });
});
