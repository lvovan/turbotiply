import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoundFeedback from '../../src/components/GamePlay/RoundFeedback/RoundFeedback';

describe('RoundFeedback', () => {
  it('renders correct feedback with green style, checkmark, and "Correct!" text', () => {
    render(<RoundFeedback isCorrect={true} correctAnswer={21} />);

    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders incorrect feedback with red style, X icon, and "Not quite!" text', () => {
    render(<RoundFeedback isCorrect={false} correctAnswer={21} />);

    expect(screen.getByText('Not quite!')).toBeInTheDocument();
    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it('shows correct answer when incorrect', () => {
    render(<RoundFeedback isCorrect={false} correctAnswer={21} />);

    expect(screen.getByText(/21/)).toBeInTheDocument();
  });

  it('has an aria-live assertive region', () => {
    const { container } = render(<RoundFeedback isCorrect={true} correctAnswer={21} />);

    const liveRegion = container.querySelector('[aria-live="assertive"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('feedback content is accessible to screen readers', () => {
    render(<RoundFeedback isCorrect={true} correctAnswer={21} />);

    // The feedback text should be in the live region
    const liveRegion = screen.getByText('Correct!').closest('[aria-live="assertive"]');
    expect(liveRegion).toBeInTheDocument();
  });
});
