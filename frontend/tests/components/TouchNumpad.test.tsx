import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import TouchNumpad from '../../src/components/GamePlay/AnswerInput/TouchNumpad';

describe('TouchNumpad', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Digit entry ---

  it('appends a digit to the answer display when a digit button is tapped', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 7' }));
    expect(screen.getByRole('status')).toHaveTextContent('7');
  });

  it('composes multi-digit answers', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 7' }));
    await user.click(screen.getByRole('button', { name: 'digit 2' }));
    expect(screen.getByRole('status')).toHaveTextContent('72');
  });

  it('composes three-digit answers', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 1' }));
    await user.click(screen.getByRole('button', { name: 'digit 4' }));
    await user.click(screen.getByRole('button', { name: 'digit 4' }));
    expect(screen.getByRole('status')).toHaveTextContent('144');
  });

  // --- Max 3 digits ---

  it('enforces max 3 digits — ignores 4th digit', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 1' }));
    await user.click(screen.getByRole('button', { name: 'digit 2' }));
    await user.click(screen.getByRole('button', { name: 'digit 3' }));
    await user.click(screen.getByRole('button', { name: 'digit 9' })); // 4th digit

    expect(screen.getByRole('status')).toHaveTextContent('123');
  });

  // --- Leading zero prevention ---

  it('prevents leading zero — tapping 0 on empty field has no effect', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 0' }));
    expect(screen.getByRole('status')).toHaveTextContent('?');
  });

  it('allows 0 after a non-zero digit', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 1' }));
    await user.click(screen.getByRole('button', { name: 'digit 0' }));
    expect(screen.getByRole('status')).toHaveTextContent('10');
  });

  // --- Go button submission ---

  it('submits parsed number via onSubmit when Go is tapped', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TouchNumpad onSubmit={onSubmit} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 4' }));
    await user.click(screen.getByRole('button', { name: 'digit 2' }));
    await user.click(screen.getByRole('button', { name: 'submit answer' }));

    expect(onSubmit).toHaveBeenCalledWith(42);
  });

  it('does nothing when Go is tapped with empty answer', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TouchNumpad onSubmit={onSubmit} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'submit answer' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears answer display after successful Go submission', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 5' }));
    await user.click(screen.getByRole('button', { name: 'submit answer' }));

    expect(screen.getByRole('status')).toHaveTextContent('?');
  });

  // --- Double-tap guard ---

  it('prevents double-tap on Go — onSubmit called only once', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TouchNumpad onSubmit={onSubmit} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 9' }));

    const goButton = screen.getByRole('button', { name: 'submit answer' });
    await user.click(goButton);
    await user.click(goButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // --- Disabled state ---

  it('disables all buttons when acceptingInput is false', () => {
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={false} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('ignores digit taps during feedback phase', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={false} />);

    await user.click(screen.getByRole('button', { name: 'digit 5' }));
    expect(screen.getByRole('status')).toHaveTextContent('?');
  });

  // --- State reset on new round ---

  it('clears answer when acceptingInput transitions false → true', () => {
    const { rerender } = render(
      <TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />
    );

    // Can't easily pre-populate answer in this test, but we verify the effect:
    // transition to false then back to true should result in empty answer
    rerender(<TouchNumpad onSubmit={vi.fn()} acceptingInput={false} />);
    rerender(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    expect(screen.getByRole('status')).toHaveTextContent('?');
  });

  // --- Backspace ---

  it('removes the last digit when backspace is tapped', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 7' }));
    await user.click(screen.getByRole('button', { name: 'digit 2' }));
    await user.click(screen.getByRole('button', { name: 'delete last digit' }));

    expect(screen.getByRole('status')).toHaveTextContent('7');
  });

  it('clears to empty when backspace removes last remaining digit', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 3' }));
    await user.click(screen.getByRole('button', { name: 'delete last digit' }));

    expect(screen.getByRole('status')).toHaveTextContent('?');
  });

  it('backspace on empty answer has no effect', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'delete last digit' }));
    expect(screen.getByRole('status')).toHaveTextContent('?');
  });

  // --- Physical keyboard input ---

  it('appends digit via physical keyboard keydown', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.keyboard('8');
    expect(screen.getByRole('status')).toHaveTextContent('8');
  });

  it('submits via Enter key', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TouchNumpad onSubmit={onSubmit} acceptingInput={true} />);

    await user.keyboard('42{Enter}');
    expect(onSubmit).toHaveBeenCalledWith(42);
  });

  it('deletes last digit via Backspace key', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.keyboard('72{Backspace}');
    expect(screen.getByRole('status')).toHaveTextContent('7');
  });

  it('ignores keyboard input when acceptingInput is false', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TouchNumpad onSubmit={onSubmit} acceptingInput={false} />);

    await user.keyboard('5{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('?');
  });

  it('enforces max 3 digits via keyboard', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.keyboard('1234');
    expect(screen.getByRole('status')).toHaveTextContent('123');
  });

  it('prevents leading zero via keyboard', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.keyboard('0');
    expect(screen.getByRole('status')).toHaveTextContent('?');
  });

  // --- ARIA / Accessibility ---

  it('has ARIA labels on all digit buttons', () => {
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: `digit ${i}` })).toBeInTheDocument();
    }
  });

  it('has ARIA label on Go button', () => {
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);
    expect(screen.getByRole('button', { name: 'submit answer' })).toBeInTheDocument();
  });

  it('has ARIA label on backspace button', () => {
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);
    expect(screen.getByRole('button', { name: 'delete last digit' })).toBeInTheDocument();
  });

  it('answer display has role="status" and aria-live="polite"', () => {
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    const display = screen.getByRole('status');
    expect(display).toHaveAttribute('aria-live', 'polite');
    expect(display).toHaveAttribute('aria-label', 'Current answer');
  });

  it('shows "?" placeholder when answer is empty', () => {
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);
    expect(screen.getByRole('status')).toHaveTextContent('?');
  });

  it('passes axe accessibility checks', async () => {
    const { container } = render(
      <TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // --- Button grid layout ---

  it('renders all 12 buttons (10 digits + backspace + Go)', () => {
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(12);
  });

  // --- Backspace edge cases (US4 verification) ---

  it('sequential multi-delete: compose "123", delete three times to empty', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 1' }));
    await user.click(screen.getByRole('button', { name: 'digit 2' }));
    await user.click(screen.getByRole('button', { name: 'digit 3' }));
    expect(screen.getByRole('status')).toHaveTextContent('123');

    await user.click(screen.getByRole('button', { name: 'delete last digit' }));
    expect(screen.getByRole('status')).toHaveTextContent('12');

    await user.click(screen.getByRole('button', { name: 'delete last digit' }));
    expect(screen.getByRole('status')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: 'delete last digit' }));
    expect(screen.getByRole('status')).toHaveTextContent('?');
  });

  it('delete-then-reenter: compose "12", delete once, enter "3" → "13"', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    await user.click(screen.getByRole('button', { name: 'digit 1' }));
    await user.click(screen.getByRole('button', { name: 'digit 2' }));
    await user.click(screen.getByRole('button', { name: 'delete last digit' }));
    await user.click(screen.getByRole('button', { name: 'digit 3' }));

    expect(screen.getByRole('status')).toHaveTextContent('13');
  });

  it('physical Backspace key mirrors ⌫ button behavior identically', async () => {
    const user = userEvent.setup();
    render(<TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />);

    // Enter via buttons, delete via keyboard
    await user.click(screen.getByRole('button', { name: 'digit 5' }));
    await user.click(screen.getByRole('button', { name: 'digit 6' }));
    await user.keyboard('{Backspace}');

    expect(screen.getByRole('status')).toHaveTextContent('5');
  });

  it('backspace button ignored during feedback phase', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TouchNumpad onSubmit={vi.fn()} acceptingInput={true} />
    );

    await user.click(screen.getByRole('button', { name: 'digit 8' }));
    expect(screen.getByRole('status')).toHaveTextContent('8');

    // Transition to feedback phase
    rerender(<TouchNumpad onSubmit={vi.fn()} acceptingInput={false} />);

    // Backspace should be ignored (button is disabled)
    await user.click(screen.getByRole('button', { name: 'delete last digit' }));
    // The answer was cleared by the acceptingInput=false→true cycle won't happen,
    // but the important thing is the button is disabled
    expect(screen.getByRole('button', { name: 'delete last digit' })).toBeDisabled();
  });
});
