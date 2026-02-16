import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerCard from '../../src/components/PlayerCard/PlayerCard';
import type { Player } from '../../src/types/player';

const mockPlayer: Player = {
  name: 'Mia',
  avatarId: 'cat',
  colorId: 'blue',
  lastActive: Date.now(),
  createdAt: Date.now(),
  totalScore: 0,
  gamesPlayed: 0,
};

describe('PlayerCard', () => {
  it('displays the player name', () => {
    render(<PlayerCard player={mockPlayer} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Mia')).toBeInTheDocument();
  });

  it('displays the player avatar emoji', () => {
    render(<PlayerCard player={mockPlayer} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('🐱')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<PlayerCard player={mockPlayer} onSelect={onSelect} onDelete={vi.fn()} />);

    const button = screen.getByRole('button', { name: /play as mia/i });
    await user.click(button);

    expect(onSelect).toHaveBeenCalledWith(mockPlayer);
  });

  it('has accessible button role with aria-label', () => {
    render(<PlayerCard player={mockPlayer} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('button', { name: /play as mia/i })).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<PlayerCard player={mockPlayer} onSelect={vi.fn()} onDelete={onDelete} />);

    const deleteBtn = screen.getByRole('button', { name: /remove mia/i });
    await user.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith(mockPlayer);
  });

  it('shows "—" when no games played', () => {
    render(<PlayerCard player={mockPlayer} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows average score when games have been played', () => {
    const playerWithScore: Player = {
      ...mockPlayer,
      totalScore: 150,
      gamesPlayed: 3,
    };
    render(<PlayerCard player={playerWithScore} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Avg: 50')).toBeInTheDocument();
  });

  it('rounds average score to nearest integer', () => {
    const playerWithScore: Player = {
      ...mockPlayer,
      totalScore: 100,
      gamesPlayed: 3,
    };
    render(<PlayerCard player={playerWithScore} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Avg: 33')).toBeInTheDocument();
  });

  it('renders a color dot', () => {
    const { container } = render(
      <PlayerCard player={mockPlayer} onSelect={vi.fn()} onDelete={vi.fn()} />,
    );
    const dot = container.querySelector('[class*="colorDot"]');
    expect(dot).toBeInTheDocument();
  });
});
