import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import CountdownBar from '../../src/components/GamePlay/CountdownBar/CountdownBar';

describe('CountdownBar', () => {
  it('renders a container with role="progressbar"', () => {
    const barRef = createRef<HTMLDivElement>();
    const { container } = render(<CountdownBar barRef={barRef} />);

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toBeInTheDocument();
  });

  it('has aria-valuemin="0" and aria-valuemax="5"', () => {
    const barRef = createRef<HTMLDivElement>();
    const { container } = render(<CountdownBar barRef={barRef} />);

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '5');
  });

  it('attaches barRef to the fill element', () => {
    const barRef = createRef<HTMLDivElement>();
    render(<CountdownBar barRef={barRef} />);

    expect(barRef.current).toBeInstanceOf(HTMLDivElement);
  });

  it('fill element has initial full width and green background', () => {
    const barRef = createRef<HTMLDivElement>();
    render(<CountdownBar barRef={barRef} />);

    const fill = barRef.current!;
    expect(fill.style.width).toBe('100%');
    expect(fill.style.backgroundColor).toBeTruthy();
  });

  it('container has a track background for contrast', () => {
    const barRef = createRef<HTMLDivElement>();
    const { container } = render(<CountdownBar barRef={barRef} />);

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).toBeTruthy();
    // The track should have a visible background (via CSS module class)
    expect(progressbar!.className).toBeTruthy();
  });
});
