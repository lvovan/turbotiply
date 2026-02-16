import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecentHighScores from '../../src/components/GamePlay/RecentHighScores/RecentHighScores';
import type { GameRecord } from '../../src/types/player';

const sampleScores: GameRecord[] = [
  { score: 45, completedAt: 500 },
  { score: 38, completedAt: 400 },
  { score: 30, completedAt: 300 },
  { score: 22, completedAt: 200 },
  { score: 15, completedAt: 100 },
];

describe('RecentHighScores', () => {
  it('renders a ranked ordered list when scores are provided', () => {
    render(<RecentHighScores scores={sampleScores} isEmpty={false} />);
    const list = screen.getByRole('list', { name: /recent high scores/i });
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe('OL');
  });

  it('renders medal emojis for ranks 1–3 with aria-hidden', () => {
    render(<RecentHighScores scores={sampleScores} isEmpty={false} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);

    // Medals should be in the DOM but aria-hidden
    expect(screen.getByText('🥇')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('🥈')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('🥉')).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows ordinal text for ranks 4–5', () => {
    render(<RecentHighScores scores={sampleScores} isEmpty={false} />);
    expect(screen.getByText('4th')).toBeInTheDocument();
    expect(screen.getByText('5th')).toBeInTheDocument();
  });

  it('renders "N points" for each score', () => {
    render(<RecentHighScores scores={sampleScores} isEmpty={false} />);
    expect(screen.getByText('45 points')).toBeInTheDocument();
    expect(screen.getByText('38 points')).toBeInTheDocument();
    expect(screen.getByText('30 points')).toBeInTheDocument();
    expect(screen.getByText('22 points')).toBeInTheDocument();
    expect(screen.getByText('15 points')).toBeInTheDocument();
  });

  it('includes .sr-only spans with "Nth place: N points" for screen readers', () => {
    render(<RecentHighScores scores={sampleScores} isEmpty={false} />);
    expect(screen.getByText('1st place: 45 points')).toBeInTheDocument();
    expect(screen.getByText('2nd place: 38 points')).toBeInTheDocument();
    expect(screen.getByText('3rd place: 30 points')).toBeInTheDocument();
    expect(screen.getByText('4th place: 22 points')).toBeInTheDocument();
    expect(screen.getByText('5th place: 15 points')).toBeInTheDocument();
  });

  it('renders encouraging empty-state message when isEmpty is true', () => {
    render(<RecentHighScores scores={[]} isEmpty={true} />);
    expect(screen.getByText(/play your first game/i)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('has a section with heading', () => {
    render(<RecentHighScores scores={sampleScores} isEmpty={false} />);
    const heading = screen.getByRole('heading', { level: 2, name: /recent high scores/i });
    expect(heading).toBeInTheDocument();
    const section = heading.closest('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-labelledby');
  });

  it('renders fewer items when fewer than 5 scores', () => {
    const twoScores: GameRecord[] = [
      { score: 40, completedAt: 200 },
      { score: 25, completedAt: 100 },
    ];
    render(<RecentHighScores scores={twoScores} isEmpty={false} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });
});
