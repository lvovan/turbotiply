import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressionGraph from '../../src/components/GamePlay/ProgressionGraph/ProgressionGraph';
import type { GameRecord } from '../../src/types/player';

describe('ProgressionGraph', () => {
  it('returns null when history has fewer than 2 data points', () => {
    const { container } = render(
      <ProgressionGraph history={[{ score: 10, completedAt: 100 }]} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('returns null when history is empty', () => {
    const { container } = render(<ProgressionGraph history={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders an SVG with role="img" for 2+ data points', () => {
    const history: GameRecord[] = [
      { score: 10, completedAt: 100 },
      { score: 20, completedAt: 200 },
      { score: 30, completedAt: 300 },
    ];
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('has aria-label with summary text including game count and score range', () => {
    const history: GameRecord[] = [
      { score: 10, completedAt: 100 },
      { score: 30, completedAt: 200 },
      { score: 20, completedAt: 300 },
    ];
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('aria-label')).toBe(
      'Score progression: 3 games, from 10 to 20',
    );
  });

  it('contains a <title> element matching the aria-label', () => {
    const history: GameRecord[] = [
      { score: 5, completedAt: 100 },
      { score: 45, completedAt: 200 },
    ];
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const title = svg.querySelector('title');
    expect(title).toBeInTheDocument();
    expect(title!.textContent).toBe('Score progression: 2 games, from 5 to 45');
  });

  it('renders a polyline element inside the SVG', () => {
    const history: GameRecord[] = [
      { score: 10, completedAt: 100 },
      { score: 20, completedAt: 200 },
      { score: 15, completedAt: 300 },
    ];
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const polyline = svg.querySelector('polyline');
    expect(polyline).toBeInTheDocument();
    expect(polyline!.getAttribute('fill')).toBe('none');
    expect(polyline!.getAttribute('stroke')).toBe('currentColor');
  });

  it('sets viewBox to "0 0 300 100"', () => {
    const history: GameRecord[] = [
      { score: 10, completedAt: 100 },
      { score: 30, completedAt: 200 },
    ];
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('viewBox')).toBe('0 0 300 100');
  });
});
