import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '../test-utils';

// ---------------------------------------------------------------------------
// Mock @microsoft/clarity to simulate module unavailability
// ---------------------------------------------------------------------------
vi.mock('@microsoft/clarity', () => ({
  default: {
    init: () => {
      throw new Error('Clarity CDN blocked');
    },
    event: vi.fn(),
    setTag: vi.fn(),
  },
}));

// Import App AFTER the mock so it picks up the mocked module
import App from '../../src/App';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Telemetry graceful degradation', () => {
  it('renders the app without errors when Clarity init throws', () => {
    // Suppress the expected console.warn from initClarity
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // The app should render normally even when Clarity fails
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('app is fully functional when Clarity is unavailable', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<App />);

    // The WelcomePage should render with the title
    expect(screen.getByText('Multis!')).toBeInTheDocument();
  });
});
