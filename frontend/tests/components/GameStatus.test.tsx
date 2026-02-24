import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { axe } from 'vitest-axe';
import { createRef } from 'react';
import GameStatus from '../../src/components/GamePlay/GameStatus/GameStatus';

/** Helper to create default props with both refs */
function defaultProps(overrides?: Partial<Parameters<typeof GameStatus>[0]>) {
  return {
    roundNumber: 1,
    totalRounds: 10,
    score: 0,
    timerRef: createRef<HTMLSpanElement>(),
    barRef: createRef<HTMLDivElement>(),
    isReplay: false,
    currentPhase: 'input' as const,
    isCorrect: null,
    correctAnswer: null,
    completedRound: 1,
    ...overrides,
  };
}

describe('GameStatus', () => {
  it('renders "Round N of 10" during normal play', () => {
    render(<GameStatus {...defaultProps({ roundNumber: 3, score: 15 })} />);
    expect(screen.getByText(/Round 3 of 10/)).toBeInTheDocument();
  });

  it('renders running score', () => {
    render(<GameStatus {...defaultProps({ roundNumber: 5, score: 22 })} />);
    expect(screen.getByText(/22/)).toBeInTheDocument();
  });

  it('renders timer display element', () => {
    const timerRef = createRef<HTMLSpanElement>();
    const { container } = render(<GameStatus {...defaultProps({ timerRef })} />);

    const timerElement = container.querySelector('[data-testid="timer"]') ||
      container.querySelector('.timer');
    expect(timerElement).toBeInTheDocument();
  });

  it('shows replay indicator when isReplay is true', () => {
    render(<GameStatus {...defaultProps({ roundNumber: 1, totalRounds: 2, score: 10, isReplay: true })} />);
    expect(screen.getByText(/Replay/i)).toBeInTheDocument();
  });

  it('does not show replay indicator when isReplay is false', () => {
    render(<GameStatus {...defaultProps({ roundNumber: 3, score: 15 })} />);
    expect(screen.queryByText(/Replay/i)).not.toBeInTheDocument();
  });

  it('timer element has data-testid for external access', () => {
    render(<GameStatus {...defaultProps()} />);
    const timer = screen.getByTestId('timer');
    expect(timer).toBeInTheDocument();
  });

  it('timer shows elapsed seconds format', () => {
    const timerRef = createRef<HTMLSpanElement>();
    render(<GameStatus {...defaultProps({ timerRef })} />);

    if (timerRef.current) {
      timerRef.current.textContent = '3.5s';
    }
    const timer = screen.getByTestId('timer');
    expect(timer.textContent).toBe('3.5s');
  });

  // --- New tests for countdown bar ---

  it('timer initial text is "5.0s"', () => {
    render(<GameStatus {...defaultProps()} />);
    const timer = screen.getByTestId('timer');
    expect(timer.textContent).toBe('5.0s');
  });

  it('renders CountdownBar component', () => {
    const { container } = render(<GameStatus {...defaultProps()} />);
    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toBeInTheDocument();
  });

  it('passes barRef to CountdownBar', () => {
    const barRef = createRef<HTMLDivElement>();
    render(<GameStatus {...defaultProps({ barRef })} />);
    expect(barRef.current).toBeInstanceOf(HTMLDivElement);
  });

  // --- T003: Feedback mode rendering tests ---

  describe('feedback mode rendering', () => {
    it('renders "✓" icon and "Correct!" text when correct', () => {
      render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 3,
          })}
        />,
      );

      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(screen.getByText('Correct!')).toBeInTheDocument();
    });

    it('renders "✗" icon, "Not quite!", and correct answer when incorrect', () => {
      render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: false,
            correctAnswer: 42,
            completedRound: 5,
          })}
        />,
      );

      expect(screen.getByText('✗')).toBeInTheDocument();
      expect(screen.getByText('Not quite!')).toBeInTheDocument();
      expect(screen.getByText(/the answer was 42/i)).toBeInTheDocument();
    });

    it('renders completion count "Round X of Y completed"', () => {
      render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 3,
            totalRounds: 10,
          })}
        />,
      );

      expect(screen.getByText(/Round 3 of 10 completed/)).toBeInTheDocument();
    });

    it('renders normal round/score/timer content when currentPhase is input', () => {
      render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'input',
            roundNumber: 4,
            score: 15,
          })}
        />,
      );

      expect(screen.getByText(/Round 4 of 10/)).toBeInTheDocument();
      expect(screen.getByText(/15/)).toBeInTheDocument();
      expect(screen.queryByText('✓')).not.toBeInTheDocument();
      expect(screen.queryByText('✗')).not.toBeInTheDocument();
    });

    it('hides round/score/timer content during feedback phase', () => {
      render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 3,
            roundNumber: 3,
            score: 15,
          })}
        />,
      );

      // Round/score text should not be visible
      expect(screen.queryByText('Score:')).not.toBeInTheDocument();
      expect(screen.queryByTestId('timer')).not.toBeInTheDocument();
    });

    it('hides countdown bar during feedback phase', () => {
      const { container } = render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 1,
          })}
        />,
      );

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).not.toBeInTheDocument();
    });

    it('does not show "The answer was" for correct responses', () => {
      render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 1,
          })}
        />,
      );

      expect(screen.queryByText(/the answer was/i)).not.toBeInTheDocument();
    });

    it('maintains same outer dimensions (no layout shift) via consistent container', () => {
      const { container: inputContainer } = render(
        <GameStatus {...defaultProps({ currentPhase: 'input' })} />,
      );
      const inputRoot = inputContainer.firstElementChild as HTMLElement;

      const { container: feedbackContainer } = render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 1,
          })}
        />,
      );
      const feedbackRoot = feedbackContainer.firstElementChild as HTMLElement;

      // Both should have the same root element tag and similar structure (same container)
      expect(inputRoot.tagName).toBe(feedbackRoot.tagName);
      // Both should have the status class applied (same outer container)
      expect(inputRoot.className).toContain('status');
      expect(feedbackRoot.className).toContain('status');
    });
  });

  // --- T004: Feedback mode accessibility tests ---

  describe('feedback mode accessibility', () => {
    it('feedback content has role="status" and aria-live="assertive"', () => {
      render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 1,
          })}
        />,
      );

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveAttribute('aria-live', 'assertive');
    });

    it('icon span has aria-hidden="true"', () => {
      render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 1,
          })}
        />,
      );

      const icon = screen.getByText('✓');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('passes axe accessibility check for correct feedback', async () => {
      const { container } = render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 3,
          })}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe accessibility check for incorrect feedback', async () => {
      const { container } = render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: false,
            correctAnswer: 42,
            completedRound: 5,
          })}
        />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // --- T008: Replay feedback tests ---

  describe('replay feedback mode', () => {
    it('shows "Replay X of Y completed" when isReplay is true during feedback', () => {
      render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 2,
            totalRounds: 4,
            isReplay: true,
          })}
        />,
      );

      expect(screen.getByText(/Replay 2 of 4 completed/)).toBeInTheDocument();
      expect(screen.queryByText(/Round/)).not.toBeInTheDocument();
    });

    it('uses same feedback colors and icons in replay mode (correct)', () => {
      const { container } = render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 1,
            totalRounds: 3,
            isReplay: true,
          })}
        />,
      );

      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(screen.getByText('Correct!')).toBeInTheDocument();
      const root = container.firstElementChild as HTMLElement;
      expect(root.className).toMatch(/feedbackCorrect/);
    });

    it('uses same feedback colors and icons in replay mode (incorrect)', () => {
      const { container } = render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: false,
            correctAnswer: 48,
            completedRound: 1,
            totalRounds: 3,
            isReplay: true,
          })}
        />,
      );

      expect(screen.getByText('✗')).toBeInTheDocument();
      expect(screen.getByText('Not quite!')).toBeInTheDocument();
      expect(screen.getByText(/the answer was 48/i)).toBeInTheDocument();
      const root = container.firstElementChild as HTMLElement;
      expect(root.className).toMatch(/feedbackIncorrect/);
    });
  });

  describe('Practice indicator (Improve mode)', () => {
    it('shows "Practice" text instead of score when gameMode is improve', () => {
      render(
        <GameStatus
          {...defaultProps({
            roundNumber: 3,
            score: 15,
            gameMode: 'improve',
          })}
        />,
      );
      expect(screen.getByText('Practice')).toBeInTheDocument();
      expect(screen.queryByText('Score:')).not.toBeInTheDocument();
    });

    it('shows score when gameMode is play', () => {
      render(
        <GameStatus
          {...defaultProps({
            roundNumber: 3,
            score: 15,
            gameMode: 'play',
          })}
        />,
      );
      expect(screen.getByText('Score:')).toBeInTheDocument();
      expect(screen.queryByText('Practice')).not.toBeInTheDocument();
    });

    it('defaults to showing score when gameMode is not provided', () => {
      render(<GameStatus {...defaultProps({ score: 10 })} />);
      expect(screen.getByText('Score:')).toBeInTheDocument();
    });

    it('still shows round counter in improve mode', () => {
      render(
        <GameStatus
          {...defaultProps({
            roundNumber: 5,
            totalRounds: 10,
            gameMode: 'improve',
          })}
        />,
      );
      expect(screen.getByText(/Round 5 of 10/)).toBeInTheDocument();
    });

    it('hides timer in improve mode', () => {
      render(
        <GameStatus
          {...defaultProps({
            gameMode: 'improve',
          })}
        />,
      );
      expect(screen.queryByTestId('timer')).not.toBeInTheDocument();
    });

    it('hides countdown bar in improve mode', () => {
      const { container } = render(
        <GameStatus
          {...defaultProps({
            gameMode: 'improve',
          })}
        />,
      );
      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).not.toBeInTheDocument();
    });

    it('shows timer in play mode', () => {
      render(
        <GameStatus
          {...defaultProps({
            gameMode: 'play',
          })}
        />,
      );
      expect(screen.getByTestId('timer')).toBeInTheDocument();
    });

    it('shows countdown bar in play mode', () => {
      const { container } = render(
        <GameStatus
          {...defaultProps({
            gameMode: 'play',
          })}
        />,
      );
      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toBeInTheDocument();
    });

    it('feedback phase works normally in improve mode', () => {
      render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 42,
            completedRound: 3,
            gameMode: 'improve',
          })}
        />,
      );
      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(screen.getByText('Correct!')).toBeInTheDocument();
    });
  });

  // --- T001/T004: Panel height stability tests (028-stable-panel-height) ---

  describe('panel height stability', () => {
    it('root element uses the same status container class in input and correct-feedback phases', () => {
      const { container: inputContainer } = render(
        <GameStatus {...defaultProps({ currentPhase: 'input' })} />,
      );
      const inputRoot = inputContainer.firstElementChild as HTMLElement;

      const { container: feedbackContainer } = render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 21,
            completedRound: 1,
          })}
        />,
      );
      const feedbackRoot = feedbackContainer.firstElementChild as HTMLElement;

      expect(inputRoot.className).toContain('status');
      expect(feedbackRoot.className).toContain('status');
    });

    it('root element uses the same status container class in input and incorrect-feedback phases', () => {
      const { container: inputContainer } = render(
        <GameStatus {...defaultProps({ currentPhase: 'input' })} />,
      );
      const inputRoot = inputContainer.firstElementChild as HTMLElement;

      const { container: feedbackContainer } = render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: false,
            correctAnswer: 144,
            completedRound: 5,
          })}
        />,
      );
      const feedbackRoot = feedbackContainer.firstElementChild as HTMLElement;

      expect(inputRoot.className).toContain('status');
      expect(feedbackRoot.className).toContain('status');
    });

    it('all feedback content renders without errors for incorrect answers (FR-007 regression guard)', () => {
      render(
        <GameStatus
          {...defaultProps({
            currentPhase: 'feedback',
            isCorrect: false,
            correctAnswer: 144,
            completedRound: 7,
            totalRounds: 10,
          })}
        />,
      );

      expect(screen.getByText('✗')).toBeInTheDocument();
      expect(screen.getByText('Not quite!')).toBeInTheDocument();
      expect(screen.getByText(/the answer was 144/i)).toBeInTheDocument();
      expect(screen.getByText(/Round 7 of 10 completed/)).toBeInTheDocument();
    });

    it('panel uses same root container class in play mode and improve mode', () => {
      const { container: playContainer } = render(
        <GameStatus {...defaultProps({ gameMode: 'play' })} />,
      );
      const playRoot = playContainer.firstElementChild as HTMLElement;

      const { container: improveContainer } = render(
        <GameStatus {...defaultProps({ gameMode: 'improve' })} />,
      );
      const improveRoot = improveContainer.firstElementChild as HTMLElement;

      expect(playRoot.className).toContain('status');
      expect(improveRoot.className).toContain('status');
    });

    it('panel uses same root container class in normal and replay modes', () => {
      const { container: normalContainer } = render(
        <GameStatus {...defaultProps({ isReplay: false })} />,
      );
      const normalRoot = normalContainer.firstElementChild as HTMLElement;

      const { container: replayContainer } = render(
        <GameStatus {...defaultProps({ isReplay: true })} />,
      );
      const replayRoot = replayContainer.firstElementChild as HTMLElement;

      expect(normalRoot.className).toContain('status');
      expect(replayRoot.className).toContain('status');
    });

    it('panel uses same root container class in improve mode feedback phase', () => {
      const { container: inputContainer } = render(
        <GameStatus {...defaultProps({ gameMode: 'improve', currentPhase: 'input' })} />,
      );
      const inputRoot = inputContainer.firstElementChild as HTMLElement;

      const { container: feedbackContainer } = render(
        <GameStatus
          {...defaultProps({
            gameMode: 'improve',
            currentPhase: 'feedback',
            isCorrect: true,
            correctAnswer: 42,
            completedRound: 3,
          })}
        />,
      );
      const feedbackRoot = feedbackContainer.firstElementChild as HTMLElement;

      expect(inputRoot.className).toContain('status');
      expect(feedbackRoot.className).toContain('status');
    });
  });
});
