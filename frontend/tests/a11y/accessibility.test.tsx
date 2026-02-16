import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../src/hooks/useSession.tsx';
import WelcomePage from '../../src/pages/WelcomePage';
import * as playerStorage from '../../src/services/playerStorage';
import NewPlayerForm from '../../src/components/WelcomeScreen/NewPlayerForm';
import AvatarPicker from '../../src/components/AvatarPicker/AvatarPicker';
import PlayerList from '../../src/components/WelcomeScreen/PlayerList';
import ClearAllConfirmation from '../../src/components/ClearAllConfirmation/ClearAllConfirmation';
import FormulaDisplay from '../../src/components/GamePlay/FormulaDisplay/FormulaDisplay';
import AnswerInput from '../../src/components/GamePlay/AnswerInput/AnswerInput';
import RoundFeedback from '../../src/components/GamePlay/RoundFeedback/RoundFeedback';
import ScoreSummary from '../../src/components/GamePlay/ScoreSummary/ScoreSummary';
import type { Round } from '../../src/types/game';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <SessionProvider>{ui}</SessionProvider>
    </MemoryRouter>,
  );
}

describe('Accessibility (axe)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('WelcomePage (new player flow) has no a11y violations', async () => {
    const { container } = renderWithProviders(<WelcomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('WelcomePage (returning player flow) has no a11y violations', async () => {
    playerStorage.savePlayer({ name: 'Alice', avatarId: 'cat' });
    const { container } = renderWithProviders(<WelcomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('NewPlayerForm has no a11y violations', async () => {
    const { container } = render(
      <NewPlayerForm onSubmit={() => {}} playerExists={() => false} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AvatarPicker has no a11y violations', async () => {
    const { container } = render(
      <AvatarPicker selectedId="rocket" onSelect={() => {}} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('PlayerList has no a11y violations', async () => {
    const players = [
      { name: 'Alice', avatarId: 'cat', lastActive: 200, createdAt: 100, totalScore: 0, gamesPlayed: 0 },
      { name: 'Bob', avatarId: 'robot', lastActive: 100, createdAt: 50, totalScore: 0, gamesPlayed: 0 },
    ];
    const { container } = render(
      <PlayerList
        players={players}
        onSelectPlayer={() => {}}
        onDeletePlayer={() => {}}
        onNewPlayer={() => {}}
        onClearAll={() => {}}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ClearAllConfirmation has no a11y violations', async () => {
    const { container } = render(
      <ClearAllConfirmation onConfirm={() => {}} onCancel={() => {}} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility — Gameplay (axe)', () => {
  it('FormulaDisplay has no a11y violations', async () => {
    const formula = { factorA: 3, factorB: 7, product: 21, hiddenPosition: 'C' as const };
    const { container } = render(<FormulaDisplay formula={formula} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AnswerInput has no a11y violations', async () => {
    const { container } = render(<AnswerInput onSubmit={() => {}} disabled={false} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('RoundFeedback (correct) has no a11y violations', async () => {
    const { container } = render(
      <div aria-live="assertive" role="status">
        <RoundFeedback isCorrect={true} correctAnswer={21} />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('RoundFeedback (incorrect) has no a11y violations', async () => {
    const { container } = render(
      <div aria-live="assertive" role="status">
        <RoundFeedback isCorrect={false} correctAnswer={21} />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ScoreSummary has no a11y violations', async () => {
    const rounds: Round[] = [
      {
        formula: { factorA: 3, factorB: 7, product: 21, hiddenPosition: 'C' },
        playerAnswer: 21,
        isCorrect: true,
        elapsedMs: 1500,
        points: 5,
      },
      {
        formula: { factorA: 6, factorB: 8, product: 48, hiddenPosition: 'B' },
        playerAnswer: 10,
        isCorrect: false,
        elapsedMs: 3000,
        points: -2,
      },
    ];
    const { container } = render(
      <ScoreSummary rounds={rounds} score={3} onPlayAgain={() => {}} onBackToMenu={() => {}} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
