import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import ModeSelector from '../../src/components/GamePlay/ModeSelector/ModeSelector';

function defaultProps(overrides?: Partial<Parameters<typeof ModeSelector>[0]>) {
  return {
    onStartPlay: vi.fn(),
    onStartImprove: vi.fn(),
    trickyNumbers: [] as number[],
    showImprove: false,
    showEncouragement: false,
    ...overrides,
  };
}

describe('ModeSelector', () => {
  it('always renders Play button with descriptor', () => {
    render(<ModeSelector {...defaultProps()} />);
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByText(/go for a high score/i)).toBeInTheDocument();
  });

  it('calls onStartPlay when Play button is clicked', async () => {
    const user = userEvent.setup();
    const onStartPlay = vi.fn();
    render(<ModeSelector {...defaultProps({ onStartPlay })} />);
    await user.click(screen.getByRole('button', { name: /play/i }));
    expect(onStartPlay).toHaveBeenCalledTimes(1);
  });

  it('shows Improve button when showImprove is true', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: true, trickyNumbers: [6, 7, 8, 9] })}
      />,
    );
    expect(screen.getByRole('button', { name: /improve/i })).toBeInTheDocument();
  });

  it('hides Improve button when showImprove is false', () => {
    render(<ModeSelector {...defaultProps({ showImprove: false })} />);
    expect(screen.queryByRole('button', { name: /improve/i })).not.toBeInTheDocument();
  });

  it('calls onStartImprove when Improve button is clicked', async () => {
    const user = userEvent.setup();
    const onStartImprove = vi.fn();
    render(
      <ModeSelector
        {...defaultProps({
          showImprove: true,
          trickyNumbers: [7, 8],
          onStartImprove,
        })}
      />,
    );
    await user.click(screen.getByRole('button', { name: /improve/i }));
    expect(onStartImprove).toHaveBeenCalledTimes(1);
  });

  it('renders tricky numbers in Improve descriptor', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: true, trickyNumbers: [6, 7, 8, 9] })}
      />,
    );
    expect(screen.getByText(/6, 7, 8, 9/)).toBeInTheDocument();
  });

  it('shows encouraging message when showEncouragement is true and showImprove is false', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: false, showEncouragement: true })}
      />,
    );
    expect(screen.getByText(/no tricky numbers/i)).toBeInTheDocument();
  });

  it('does not show encouraging message when showEncouragement is false', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: false, showEncouragement: false })}
      />,
    );
    expect(screen.queryByText(/no tricky numbers/i)).not.toBeInTheDocument();
  });

  it('Play button is keyboard-focusable', () => {
    render(<ModeSelector {...defaultProps()} />);
    const btn = screen.getByRole('button', { name: /play/i });
    btn.focus();
    expect(btn).toHaveFocus();
  });

  it('Improve button is keyboard-focusable', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: true, trickyNumbers: [7, 8] })}
      />,
    );
    const btn = screen.getByRole('button', { name: /improve/i });
    btn.focus();
    expect(btn).toHaveFocus();
  });

  it('renders numbers as comma-separated ascending list', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: true, trickyNumbers: [3, 7, 5] })}
      />,
    );
    expect(screen.getByText(/3, 5, 7/)).toBeInTheDocument();
  });

  it('renders ellipsis when more than 8 numbers', () => {
    render(
      <ModeSelector
        {...defaultProps({
          showImprove: true,
          trickyNumbers: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        })}
      />,
    );
    // Should show first 8 + ellipsis
    expect(screen.getByText(/2, 3, 4, 5, 6, 7, 8, 9/)).toBeInTheDocument();
    expect(screen.getByText(/…/)).toBeInTheDocument();
  });

  it('renders exactly 8 numbers without ellipsis when exactly 8', () => {
    render(
      <ModeSelector
        {...defaultProps({
          showImprove: true,
          trickyNumbers: [2, 3, 4, 5, 6, 7, 8, 9],
        })}
      />,
    );
    expect(screen.getByText(/2, 3, 4, 5, 6, 7, 8, 9/)).toBeInTheDocument();
    expect(screen.queryByText(/…/)).not.toBeInTheDocument();
  });

  it('Improve button aria-label includes all tricky numbers', () => {
    render(
      <ModeSelector
        {...defaultProps({ showImprove: true, trickyNumbers: [6, 7, 8, 9] })}
      />,
    );
    const btn = screen.getByRole('button', { name: /improve/i });
    expect(btn.getAttribute('aria-label')).toContain('6, 7, 8, 9');
  });

  describe('accessibility', () => {
    it('passes axe check with Play button only', async () => {
      const { container } = render(<ModeSelector {...defaultProps()} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe check with both buttons', async () => {
      const { container } = render(
        <ModeSelector
          {...defaultProps({ showImprove: true, trickyNumbers: [7, 8] })}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe check with encouraging message', async () => {
      const { container } = render(
        <ModeSelector
          {...defaultProps({ showImprove: false, showEncouragement: true })}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
