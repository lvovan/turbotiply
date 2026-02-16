import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InlineFeedback from '../../src/components/GamePlay/InlineFeedback/InlineFeedback';

describe('InlineFeedback', () => {
  describe('correct answer', () => {
    it('renders green-toned background with checkmark and "Correct!"', () => {
      const { container } = render(
        <InlineFeedback isCorrect={true} correctAnswer={42} />,
      );

      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(screen.getByText('Correct!')).toBeInTheDocument();

      // Should have correct CSS class (green-toned)
      const feedback = container.firstElementChild as HTMLElement;
      expect(feedback.className).toMatch(/correct/i);
    });

    it('does not show the correct answer for correct responses', () => {
      render(<InlineFeedback isCorrect={true} correctAnswer={42} />);
      expect(screen.queryByText(/the answer was/i)).not.toBeInTheDocument();
    });
  });

  describe('incorrect answer', () => {
    it('renders red-toned background with cross and "Not quite!"', () => {
      const { container } = render(
        <InlineFeedback isCorrect={false} correctAnswer={42} />,
      );

      expect(screen.getByText('✗')).toBeInTheDocument();
      expect(screen.getByText('Not quite!')).toBeInTheDocument();

      const feedback = container.firstElementChild as HTMLElement;
      expect(feedback.className).toMatch(/incorrect/i);
    });

    it('shows the correct answer text', () => {
      render(<InlineFeedback isCorrect={false} correctAnswer={42} />);
      expect(screen.getByText(/the answer was 42/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has role="status"', () => {
      render(<InlineFeedback isCorrect={true} correctAnswer={1} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-live="assertive"', () => {
      render(<InlineFeedback isCorrect={true} correctAnswer={1} />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'assertive');
    });
  });
});
