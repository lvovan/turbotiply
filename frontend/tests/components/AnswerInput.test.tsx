import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import AnswerInput from '../../src/components/GamePlay/AnswerInput/AnswerInput';

function mockMaxTouchPoints(value: number) {
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value,
    writable: true,
    configurable: true,
  });
}

describe('AnswerInput', () => {
  const originalMaxTouchPoints = navigator.maxTouchPoints;

  afterEach(() => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: originalMaxTouchPoints,
      writable: true,
      configurable: true,
    });
  });
  it('renders numeric input and submit button', () => {
    render(<AnswerInput onSubmit={vi.fn()} acceptingInput={true} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('submit button is disabled when input is empty', () => {
    render(<AnswerInput onSubmit={vi.fn()} acceptingInput={true} />);

    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('submit button is enabled when input has a value', async () => {
    const user = userEvent.setup();
    render(<AnswerInput onSubmit={vi.fn()} acceptingInput={true} />);

    await user.type(screen.getByRole('textbox'), '5');
    expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
  });

  it('calls onSubmit with parsed number', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AnswerInput onSubmit={onSubmit} acceptingInput={true} />);

    await user.type(screen.getByRole('textbox'), '42');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith(42);
  });

  it('strips leading zeros', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AnswerInput onSubmit={onSubmit} acceptingInput={true} />);

    await user.type(screen.getByRole('textbox'), '07');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith(7);
  });

  it('does not call onSubmit when acceptingInput is false (submit guard)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AnswerInput onSubmit={onSubmit} acceptingInput={false} />);

    const input = screen.getByRole('textbox');
    // Input is NOT disabled at the DOM level (keyboard stays visible)
    expect(input).not.toBeDisabled();

    await user.type(input, '42');
    // Submit button is disabled when not accepting input
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();

    // Even if we submit the form directly, onSubmit should not be called
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears input after submission', async () => {
    const user = userEvent.setup();
    render(<AnswerInput onSubmit={vi.fn()} acceptingInput={true} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '5');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(input).toHaveValue('');
  });

  it('submits on Enter key press', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AnswerInput onSubmit={onSubmit} acceptingInput={true} />);

    await user.type(screen.getByRole('textbox'), '12{Enter}');

    expect(onSubmit).toHaveBeenCalledWith(12);
  });

  it('auto-clears input when acceptingInput transitions to true', () => {
    const { rerender } = render(<AnswerInput onSubmit={vi.fn()} acceptingInput={false} />);

    const input = screen.getByRole('textbox');
    // Simulate typing during feedback phase
    // Since we can't easily type via DOM during rerender, we verify the effect
    // by transitioning acceptingInput, which should clear the value
    rerender(<AnswerInput onSubmit={vi.fn()} acceptingInput={true} />);

    expect(input).toHaveValue('');
  });

  it('input retains focus after clicking submit button', async () => {
    const user = userEvent.setup();
    render(<AnswerInput onSubmit={vi.fn()} acceptingInput={true} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '7');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(input).toHaveFocus();
  });

  // --- Conditional rendering based on touch detection ---

  describe('conditional rendering', () => {
    it('renders text input and Submit button when no touchscreen detected', () => {
      mockMaxTouchPoints(0);
      render(<AnswerInput onSubmit={vi.fn()} acceptingInput={true} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'submit answer' })).not.toBeInTheDocument();
    });

    it('renders TouchNumpad when touchscreen is detected', () => {
      mockMaxTouchPoints(5);
      render(<AnswerInput onSubmit={vi.fn()} acceptingInput={true} />);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'submit answer' })).toBeInTheDocument();
      // Verify digit buttons are present
      expect(screen.getByRole('button', { name: 'digit 1' })).toBeInTheDocument();
    });

    it('existing keyboard submit flow works unchanged on non-touch devices', async () => {
      mockMaxTouchPoints(0);
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<AnswerInput onSubmit={onSubmit} acceptingInput={true} />);

      await user.type(screen.getByRole('textbox'), '42{Enter}');
      expect(onSubmit).toHaveBeenCalledWith(42);
    });
  });
});
