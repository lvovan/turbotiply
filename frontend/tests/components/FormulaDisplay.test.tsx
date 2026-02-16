import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import FormulaDisplay from '../../src/components/GamePlay/FormulaDisplay/FormulaDisplay';
import type { Formula } from '../../src/types/game';

describe('FormulaDisplay', () => {
  const baseFormula: Formula = {
    factorA: 3,
    factorB: 7,
    product: 21,
    hiddenPosition: 'C',
  };

  it('renders formula with product hidden (hiddenPosition C)', () => {
    render(<FormulaDisplay formula={baseFormula} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
    // Product (21) should not be visible
    expect(screen.queryByText('21')).not.toBeInTheDocument();
  });

  it('renders formula with factorA hidden (hiddenPosition A)', () => {
    const formula: Formula = { ...baseFormula, hiddenPosition: 'A' };
    render(<FormulaDisplay formula={formula} />);

    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    // factorA (3) should not be visible
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('renders formula with factorB hidden (hiddenPosition B)', () => {
    const formula: Formula = { ...baseFormula, hiddenPosition: 'B' };
    render(<FormulaDisplay formula={formula} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    // factorB (7) should not be visible
    expect(screen.queryByText('7')).not.toBeInTheDocument();
  });

  it('renders multiplication sign and equals sign', () => {
    render(<FormulaDisplay formula={baseFormula} />);

    expect(screen.getByText('×')).toBeInTheDocument();
    expect(screen.getByText('=')).toBeInTheDocument();
  });

  it('has accessible labeling', () => {
    render(<FormulaDisplay formula={baseFormula} />);

    // Should have an aria-label describing the formula
    const container = screen.getByRole('math') || screen.getByLabelText(/multiplication/i);
    expect(container).toBeInTheDocument();
  });

  describe('playerAnswer prop', () => {
    it('shows player answer instead of "?" when playerAnswer is provided (hiddenPosition C)', () => {
      render(<FormulaDisplay formula={baseFormula} playerAnswer={38} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('38')).toBeInTheDocument();
      // '?' should not be rendered
      expect(screen.queryByText('?')).not.toBeInTheDocument();
    });

    it('shows player answer instead of "?" when playerAnswer is provided (hiddenPosition A)', () => {
      const formula: Formula = { ...baseFormula, hiddenPosition: 'A' };
      render(<FormulaDisplay formula={formula} playerAnswer={5} />);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('21')).toBeInTheDocument();
      expect(screen.queryByText('?')).not.toBeInTheDocument();
    });

    it('shows player answer instead of "?" when playerAnswer is provided (hiddenPosition B)', () => {
      const formula: Formula = { ...baseFormula, hiddenPosition: 'B' };
      render(<FormulaDisplay formula={formula} playerAnswer={9} />);

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText('21')).toBeInTheDocument();
      expect(screen.queryByText('?')).not.toBeInTheDocument();
    });

    it('still shows "?" when playerAnswer is undefined', () => {
      render(<FormulaDisplay formula={baseFormula} />);

      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('aria-label includes player answer value when playerAnswer is provided', () => {
      render(<FormulaDisplay formula={baseFormula} playerAnswer={38} />);

      const math = screen.getByRole('math');
      expect(math).toHaveAttribute(
        'aria-label',
        expect.stringContaining('38'),
      );
    });
  });
});
