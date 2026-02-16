import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnswerInput from '../../src/components/GamePlay/AnswerInput/AnswerInput';

describe('AnswerInput', () => {
  it('renders numeric input and submit button', () => {
    render(<AnswerInput onSubmit={vi.fn()} disabled={false} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('submit button is disabled when input is empty', () => {
    render(<AnswerInput onSubmit={vi.fn()} disabled={false} />);

    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('submit button is enabled when input has a value', async () => {
    const user = userEvent.setup();
    render(<AnswerInput onSubmit={vi.fn()} disabled={false} />);

    await user.type(screen.getByRole('textbox'), '5');
    expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
  });

  it('calls onSubmit with parsed number', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AnswerInput onSubmit={onSubmit} disabled={false} />);

    await user.type(screen.getByRole('textbox'), '42');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith(42);
  });

  it('strips leading zeros', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AnswerInput onSubmit={onSubmit} disabled={false} />);

    await user.type(screen.getByRole('textbox'), '07');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith(7);
  });

  it('input is disabled when disabled prop is true', () => {
    render(<AnswerInput onSubmit={vi.fn()} disabled={true} />);

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('clears input after submission', async () => {
    const user = userEvent.setup();
    render(<AnswerInput onSubmit={vi.fn()} disabled={false} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '5');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(input).toHaveValue('');
  });

  it('submits on Enter key press', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AnswerInput onSubmit={onSubmit} disabled={false} />);

    await user.type(screen.getByRole('textbox'), '12{Enter}');

    expect(onSubmit).toHaveBeenCalledWith(12);
  });
});
