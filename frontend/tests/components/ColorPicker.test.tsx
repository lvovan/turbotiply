import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorPicker from '../../src/components/ColorPicker/ColorPicker';
import { COLORS } from '../../src/constants/colors';

describe('ColorPicker', () => {
  const defaultProps = {
    selectedId: COLORS[0].id,
    onSelect: vi.fn(),
  };

  it('renders all 6 colors', () => {
    render(<ColorPicker {...defaultProps} />);
    const options = screen.getAllByRole('radio');
    expect(options).toHaveLength(6);
  });

  it('has role="radiogroup" with accessible label', () => {
    render(<ColorPicker {...defaultProps} />);
    const group = screen.getByRole('radiogroup', { name: /choose your color/i });
    expect(group).toBeInTheDocument();
  });

  it('marks the selected color as checked', () => {
    render(<ColorPicker {...defaultProps} selectedId="blue" />);
    const blueOption = screen.getByRole('radio', { name: /blue/i });
    expect(blueOption).toBeChecked();
  });

  it('calls onSelect when a color is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} onSelect={onSelect} />);

    const tealOption = screen.getByRole('radio', { name: /teal/i });
    await user.click(tealOption);

    expect(onSelect).toHaveBeenCalledWith('teal');
  });

  it('supports arrow key navigation', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} selectedId="red" onSelect={onSelect} />);

    const redOption = screen.getByRole('radio', { name: /red/i });
    redOption.focus();

    await user.keyboard('{ArrowRight}');
    expect(onSelect).toHaveBeenCalledWith('gold');
  });

  it('wraps around from last to first on ArrowRight', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ColorPicker {...defaultProps} selectedId="pink" onSelect={onSelect} />);

    const pinkOption = screen.getByRole('radio', { name: /pink/i });
    pinkOption.focus();

    await user.keyboard('{ArrowRight}');
    expect(onSelect).toHaveBeenCalledWith('red');
  });

  it('each color has an aria-label with its name', () => {
    render(<ColorPicker {...defaultProps} />);
    for (const color of COLORS) {
      expect(screen.getByRole('radio', { name: color.label })).toBeInTheDocument();
    }
  });
});
