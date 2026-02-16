import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressionGraph from '../../src/components/GamePlay/ProgressionGraph/ProgressionGraph';
import type { GameRecord } from '../../src/types/player';

/** Helper to create N game records with given scores */
function makeHistory(scores: number[]): GameRecord[] {
  return scores.map((score, i) => ({ score, completedAt: (i + 1) * 100 }));
}

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
    const history = makeHistory([10, 20, 30]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg.tagName.toLowerCase()).toBe('svg');
  });

  it('renders a polyline element inside the SVG', () => {
    const history = makeHistory([10, 20, 15]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const polyline = svg.querySelector('polyline');
    expect(polyline).toBeInTheDocument();
  });

  // T005: SVG has dynamic viewBox width based on data count
  it('sets viewBox width to Y_LABEL_GUTTER + count * UNIT_WIDTH', () => {
    const history = makeHistory([10, 30, 20]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    // 3 games → 24 + 3*30 = 114, height fixed at 100
    expect(svg.getAttribute('viewBox')).toBe('0 0 114 100');
  });

  // T006: SVG uses preserveAspectRatio="xMinYMid meet"
  it('uses preserveAspectRatio="xMinYMid meet"', () => {
    const history = makeHistory([10, 20]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('preserveAspectRatio')).toBe('xMinYMid meet');
  });

  // T007: X-axis line rendered with .axis CSS class
  it('renders an X-axis line with the axis CSS class', () => {
    const history = makeHistory([10, 20, 30]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const axisLines = svg.querySelectorAll('line[class*="axis"]');
    // Should have at least the X-axis and Y-axis (2 axis lines)
    expect(axisLines.length).toBeGreaterThanOrEqual(2);
    // Find the horizontal axis line (X-axis): y1 === y2 and spans the chart width
    const xAxis = Array.from(axisLines).find(
      (l) =>
        l.getAttribute('y1') === l.getAttribute('y2') &&
        l.classList.length > 0 &&
        !l.className.baseVal.includes('guideLine'),
    );
    expect(xAxis).toBeTruthy();
  });

  // T008: Y-axis line rendered with .axis CSS class
  it('renders a Y-axis line with the axis CSS class', () => {
    const history = makeHistory([10, 20, 30]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const axisLines = svg.querySelectorAll('line[class*="axis"]');
    // Find the vertical axis line (Y-axis): x1 === x2
    const yAxis = Array.from(axisLines).find(
      (l) =>
        l.getAttribute('x1') === l.getAttribute('x2') &&
        !l.className.baseVal.includes('guideLine'),
    );
    expect(yAxis).toBeTruthy();
  });

  // T009: X-axis tick marks — one per data point
  it('renders one tick mark per data point with the tickMark CSS class', () => {
    const history = makeHistory([10, 20, 30, 40, 50]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const ticks = svg.querySelectorAll('line[class*="tickMark"]');
    expect(ticks.length).toBe(5);
  });

  // T010: polyline uses .dataLine CSS class
  it('polyline uses the dataLine CSS class', () => {
    const history = makeHistory([10, 20, 15]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const polyline = svg.querySelector('polyline');
    expect(polyline).toBeInTheDocument();
    expect(polyline!.className.baseVal).toContain('dataLine');
  });

  // T011: only last 10 records when history > 10
  it('plots only the last 10 records when history has more than 10', () => {
    const scores = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 48, 46];
    const history = makeHistory(scores);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    // viewBox width should be for 10 games: 24 + 10*30 = 324
    expect(svg.getAttribute('viewBox')).toBe('0 0 324 100');
    // Should have 10 tick marks
    const ticks = svg.querySelectorAll('line[class*="tickMark"]');
    expect(ticks.length).toBe(10);
  });

  // T012: chart renders with 2 data points (minimum) — proportionally narrow
  it('renders with 2 data points and a narrow viewBox', () => {
    const history = makeHistory([10, 20]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    // 2 games → 24 + 2*30 = 84
    expect(svg.getAttribute('viewBox')).toBe('0 0 84 100');
    const ticks = svg.querySelectorAll('line[class*="tickMark"]');
    expect(ticks.length).toBe(2);
  });

  // T013: chart with 5 data points has correct viewBox width
  it('renders 5 data points with viewBox width = Y_LABEL_GUTTER + 5 * UNIT_WIDTH', () => {
    const history = makeHistory([10, 20, 30, 25, 15]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    // 5 games → 24 + 5*30 = 174
    expect(svg.getAttribute('viewBox')).toBe('0 0 174 100');
  });

  // T014: aria-label includes game count, score range, and "scale 0 to 50"
  it('has aria-label with game count, score range, and scale 0 to 50', () => {
    const history = makeHistory([10, 30, 20]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('aria-label')).toBe(
      'Score progression: 3 games, from 10 to 20, scale 0 to 50',
    );
  });

  // T015: (update of old test) title element matches new aria-label format
  it('contains a <title> element matching the aria-label', () => {
    const history = makeHistory([5, 45]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const title = svg.querySelector('title');
    expect(title).toBeInTheDocument();
    expect(title!.textContent).toBe(
      'Score progression: 2 games, from 5 to 45, scale 0 to 50',
    );
  });

  // T021: 6 horizontal guide lines with .guideLine CSS class
  it('renders 6 horizontal guide lines with the guideLine CSS class', () => {
    const history = makeHistory([10, 20, 30]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const guideLines = svg.querySelectorAll('line[class*="guideLine"]');
    expect(guideLines.length).toBe(6);
  });

  // T022: 6 Y-axis labels with .axisLabel CSS class showing 0,10,20,30,40,50
  it('renders 6 Y-axis labels showing 0, 10, 20, 30, 40, 50', () => {
    const history = makeHistory([10, 20, 30]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const labels = svg.querySelectorAll('text[class*="axisLabel"]');
    expect(labels.length).toBe(6);
    const values = Array.from(labels).map((l) => l.textContent);
    expect(values).toEqual(['0', '10', '20', '30', '40', '50']);
  });

  // T023: guide lines and labels are inside an aria-hidden="true" group
  it('guide lines and labels are inside an aria-hidden group', () => {
    const history = makeHistory([10, 20]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const hiddenGroup = svg.querySelector('g[aria-hidden="true"]');
    expect(hiddenGroup).toBeTruthy();
    // Guide lines and labels should be children of the hidden group
    const guideLines = hiddenGroup!.querySelectorAll('line[class*="guideLine"]');
    const labels = hiddenGroup!.querySelectorAll('text[class*="axisLabel"]');
    expect(guideLines.length).toBe(6);
    expect(labels.length).toBe(6);
  });

  // T028: scores below 0 are clamped to Y-axis floor
  it('clamps negative scores to the Y-axis floor (0)', () => {
    const history = makeHistory([-5, 10]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const polyline = svg.querySelector('polyline');
    expect(polyline).toBeInTheDocument();
    // -5 clamped to 0 → same Y as score 0
    // scoreToY(0) = PAD + (1 - 0/50) * (100 - 2*4) = 4 + 92 = 96
    const points = polyline!.getAttribute('points')!;
    const firstY = parseFloat(points.split(' ')[0].split(',')[1]);
    expect(firstY).toBe(96); // Y for score 0 (clamped)
  });

  // T029: identical scores render a flat line with guide lines
  it('renders a flat horizontal line when all scores are identical', () => {
    const history = makeHistory([25, 25, 25]);
    render(<ProgressionGraph history={history} />);
    const svg = screen.getByRole('img');
    const polyline = svg.querySelector('polyline');
    expect(polyline).toBeInTheDocument();
    const points = polyline!.getAttribute('points')!;
    const yValues = points.split(' ').map((p) => parseFloat(p.split(',')[1]));
    // All Y values should be the same
    expect(new Set(yValues).size).toBe(1);
    // Guide lines still present
    const guideLines = svg.querySelectorAll('line[class*="guideLine"]');
    expect(guideLines.length).toBe(6);
  });
});
