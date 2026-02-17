import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock microsoft-clarity before importing clarityService
// ---------------------------------------------------------------------------
const mockInit = vi.fn();
const mockEvent = vi.fn();
const mockSetTag = vi.fn();

vi.mock('@microsoft/clarity', () => ({
  default: {
    init: (...args: unknown[]) => mockInit(...args),
    event: (...args: unknown[]) => mockEvent(...args),
    setTag: (...args: unknown[]) => mockSetTag(...args),
  },
}));

// Import after mock setup
import {
  initClarity,
  trackGameStarted,
  trackAnswerSubmitted,
  trackGameCompleted,
  trackReplayStarted,
  trackReplayCompleted,
  trackPageView,
  setLanguageTag,
  setPlayerTypeTag,
  _resetForTesting,
  _getTimeTierForTesting as getTimeTier,
} from '../../src/services/clarityService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Stub import.meta.env.VITE_CLARITY_PROJECT_ID */
function setProjectId(value: string) {
  vi.stubEnv('VITE_CLARITY_PROJECT_ID', value);
}

function clearProjectId() {
  vi.stubEnv('VITE_CLARITY_PROJECT_ID', '');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  _resetForTesting();
  mockInit.mockReset();
  mockEvent.mockReset();
  mockSetTag.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// ===================== initClarity =====================

describe('initClarity', () => {
  it('calls Clarity.init with project ID when env var is set', () => {
    setProjectId('abc123');
    initClarity();
    expect(mockInit).toHaveBeenCalledWith('abc123');
  });

  it('is a no-op and logs warning when env var is empty', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    clearProjectId();

    initClarity();

    expect(mockInit).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No project ID'),
    );
    warnSpy.mockRestore();
  });

  it('catches init errors and logs warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setProjectId('abc123');
    mockInit.mockImplementation(() => {
      throw new Error('CDN blocked');
    });

    initClarity();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Initialization failed'),
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  it('keeps functions as no-ops after init failure', () => {
    setProjectId('abc123');
    mockInit.mockImplementation(() => {
      throw new Error('CDN blocked');
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    initClarity();
    trackGameStarted('play');

    expect(mockEvent).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

// ===================== getTimeTier =====================

describe('getTimeTier', () => {
  it('returns fast for ≤2000ms', () => {
    expect(getTimeTier(0)).toBe('fast');
    expect(getTimeTier(1000)).toBe('fast');
    expect(getTimeTier(2000)).toBe('fast');
  });

  it('returns medium for 2001-3000ms', () => {
    expect(getTimeTier(2001)).toBe('medium');
    expect(getTimeTier(3000)).toBe('medium');
  });

  it('returns slow for 3001-4000ms', () => {
    expect(getTimeTier(3001)).toBe('slow');
    expect(getTimeTier(4000)).toBe('slow');
  });

  it('returns timeout for >4000ms', () => {
    expect(getTimeTier(4001)).toBe('timeout');
    expect(getTimeTier(10000)).toBe('timeout');
  });
});

// ===================== Safe wrapper no-ops =====================

describe('safe wrappers when not initialized', () => {
  it('trackGameStarted is a no-op', () => {
    trackGameStarted('play');
    expect(mockEvent).not.toHaveBeenCalled();
    expect(mockSetTag).not.toHaveBeenCalled();
  });

  it('trackAnswerSubmitted is a no-op', () => {
    trackAnswerSubmitted(true, 1500);
    expect(mockEvent).not.toHaveBeenCalled();
  });

  it('trackGameCompleted is a no-op', () => {
    trackGameCompleted('play', 100, 8);
    expect(mockEvent).not.toHaveBeenCalled();
    expect(mockSetTag).not.toHaveBeenCalled();
  });

  it('trackReplayStarted is a no-op', () => {
    trackReplayStarted(3);
    expect(mockEvent).not.toHaveBeenCalled();
    expect(mockSetTag).not.toHaveBeenCalled();
  });

  it('trackReplayCompleted is a no-op', () => {
    trackReplayCompleted();
    expect(mockEvent).not.toHaveBeenCalled();
  });

  it('setLanguageTag is a no-op', () => {
    setLanguageTag('en');
    expect(mockSetTag).not.toHaveBeenCalled();
  });

  it('setPlayerTypeTag is a no-op', () => {
    setPlayerTypeTag('new');
    expect(mockSetTag).not.toHaveBeenCalled();
  });

  it('trackPageView is a no-op', () => {
    trackPageView('welcome');
    expect(mockSetTag).not.toHaveBeenCalled();
  });
});

// ===================== trackPageView =====================

describe('trackPageView', () => {
  beforeEach(() => {
    setProjectId('abc123');
    initClarity();
  });

  it('sets page tag with given page name', () => {
    trackPageView('welcome');
    expect(mockSetTag).toHaveBeenCalledWith('page', 'welcome');
  });

  it('sets page tag for play page', () => {
    trackPageView('play');
    expect(mockSetTag).toHaveBeenCalledWith('page', 'play');
  });
});

// ===================== trackGameStarted =====================

describe('trackGameStarted', () => {
  beforeEach(() => {
    setProjectId('abc123');
    initClarity();
  });

  it('fires game_started_play and sets game_mode tag for play mode', () => {
    trackGameStarted('play');
    expect(mockEvent).toHaveBeenCalledWith('game_started_play');
    expect(mockSetTag).toHaveBeenCalledWith('game_mode', 'play');
  });

  it('fires game_started_improve and sets game_mode tag for improve mode', () => {
    trackGameStarted('improve');
    expect(mockEvent).toHaveBeenCalledWith('game_started_improve');
    expect(mockSetTag).toHaveBeenCalledWith('game_mode', 'improve');
  });
});

// ===================== trackAnswerSubmitted =====================

describe('trackAnswerSubmitted', () => {
  beforeEach(() => {
    setProjectId('abc123');
    initClarity();
  });

  it('fires answer_correct_fast for correct answer ≤2s', () => {
    trackAnswerSubmitted(true, 1500);
    expect(mockEvent).toHaveBeenCalledWith('answer_correct_fast');
  });

  it('fires answer_wrong_fast for wrong answer ≤2s', () => {
    trackAnswerSubmitted(false, 1500);
    expect(mockEvent).toHaveBeenCalledWith('answer_wrong_fast');
  });

  it('fires answer_correct_medium for correct answer 2-3s', () => {
    trackAnswerSubmitted(true, 2500);
    expect(mockEvent).toHaveBeenCalledWith('answer_correct_medium');
  });

  it('fires answer_wrong_medium for wrong answer 2-3s', () => {
    trackAnswerSubmitted(false, 2500);
    expect(mockEvent).toHaveBeenCalledWith('answer_wrong_medium');
  });

  it('fires answer_correct_slow for correct answer 3-4s', () => {
    trackAnswerSubmitted(true, 3500);
    expect(mockEvent).toHaveBeenCalledWith('answer_correct_slow');
  });

  it('fires answer_wrong_slow for wrong answer 3-4s', () => {
    trackAnswerSubmitted(false, 3500);
    expect(mockEvent).toHaveBeenCalledWith('answer_wrong_slow');
  });

  it('fires answer_correct_timeout for correct answer >4s', () => {
    trackAnswerSubmitted(true, 5000);
    expect(mockEvent).toHaveBeenCalledWith('answer_correct_timeout');
  });

  it('fires answer_wrong_timeout for wrong answer >4s', () => {
    trackAnswerSubmitted(false, 5000);
    expect(mockEvent).toHaveBeenCalledWith('answer_wrong_timeout');
  });
});

// ===================== trackGameCompleted =====================

describe('trackGameCompleted', () => {
  beforeEach(() => {
    setProjectId('abc123');
    initClarity();
  });

  it('fires game_completed_play and sets tags', () => {
    trackGameCompleted('play', 85, 9);
    expect(mockEvent).toHaveBeenCalledWith('game_completed_play');
    expect(mockSetTag).toHaveBeenCalledWith('final_score', '85');
    expect(mockSetTag).toHaveBeenCalledWith('correct_count', '9');
  });

  it('fires game_completed_improve and sets tags', () => {
    trackGameCompleted('improve', 50, 7);
    expect(mockEvent).toHaveBeenCalledWith('game_completed_improve');
    expect(mockSetTag).toHaveBeenCalledWith('final_score', '50');
    expect(mockSetTag).toHaveBeenCalledWith('correct_count', '7');
  });
});

// ===================== trackReplayStarted =====================

describe('trackReplayStarted', () => {
  beforeEach(() => {
    setProjectId('abc123');
    initClarity();
  });

  it('fires replay_started and sets replay_count tag', () => {
    trackReplayStarted(3);
    expect(mockEvent).toHaveBeenCalledWith('replay_started');
    expect(mockSetTag).toHaveBeenCalledWith('replay_count', '3');
  });
});

// ===================== trackReplayCompleted =====================

describe('trackReplayCompleted', () => {
  beforeEach(() => {
    setProjectId('abc123');
    initClarity();
  });

  it('fires replay_completed', () => {
    trackReplayCompleted();
    expect(mockEvent).toHaveBeenCalledWith('replay_completed');
  });
});

// ===================== setLanguageTag =====================

describe('setLanguageTag', () => {
  beforeEach(() => {
    setProjectId('abc123');
    initClarity();
  });

  it('sets language tag with correct language code', () => {
    setLanguageTag('en');
    expect(mockSetTag).toHaveBeenCalledWith('language', 'en');
  });

  it('sets language tag for non-English language', () => {
    setLanguageTag('fr');
    expect(mockSetTag).toHaveBeenCalledWith('language', 'fr');
  });
});

// ===================== setPlayerTypeTag =====================

describe('setPlayerTypeTag', () => {
  beforeEach(() => {
    setProjectId('abc123');
    initClarity();
  });

  it('sets player_type tag to new', () => {
    setPlayerTypeTag('new');
    expect(mockSetTag).toHaveBeenCalledWith('player_type', 'new');
  });

  it('sets player_type tag to returning', () => {
    setPlayerTypeTag('returning');
    expect(mockSetTag).toHaveBeenCalledWith('player_type', 'returning');
  });
});
