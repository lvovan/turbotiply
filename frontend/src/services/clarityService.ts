import Clarity from '@microsoft/clarity';

/**
 * Module-level initialization flag.
 * All exported functions are no-ops when this is false.
 */
let isInitialized = false;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Fire a Clarity custom event only if initialized. */
function safeEvent(name: string): void {
  if (!isInitialized) return;
  Clarity.event(name);
}

/** Set a Clarity session tag only if initialized. */
function safeSet(key: string, value: string): void {
  if (!isInitialized) return;
  Clarity.setTag(key, value);
}

/**
 * Map elapsed milliseconds to a response-time tier.
 *   fast    ≤ 2 000 ms
 *   medium  ≤ 3 000 ms
 *   slow    ≤ 4 000 ms
 *   timeout > 4 000 ms
 */
function getTimeTier(elapsedMs: number): 'fast' | 'medium' | 'slow' | 'timeout' {
  if (elapsedMs <= 2000) return 'fast';
  if (elapsedMs <= 3000) return 'medium';
  if (elapsedMs <= 4000) return 'slow';
  return 'timeout';
}

// ---------------------------------------------------------------------------
// Exported API
// ---------------------------------------------------------------------------

/**
 * Initialize Clarity tracking.
 * No-op when VITE_CLARITY_PROJECT_ID is absent/empty.
 * Must be called once at application startup (main.tsx).
 * Wraps Clarity.init() in try/catch for graceful degradation.
 */
export function initClarity(): void {
  const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

  if (!projectId) {
    console.warn('[Clarity] No project ID configured — telemetry disabled.');
    return;
  }

  try {
    Clarity.init(projectId);
    isInitialized = true;
  } catch (error) {
    console.warn('[Clarity] Initialization failed — telemetry disabled.', error);
  }
}

/**
 * Track a game start event.
 * Fires: game_started_play | game_started_improve
 * Also sets session tag: game_mode = play | improve
 */
export function trackGameStarted(mode: 'play' | 'improve'): void {
  safeEvent(`game_started_${mode}`);
  safeSet('game_mode', mode);
}

/**
 * Track an answer submission event.
 * Fires: answer_{correct|wrong}_{fast|medium|slow|timeout}
 */
export function trackAnswerSubmitted(isCorrect: boolean, elapsedMs: number): void {
  const correctness = isCorrect ? 'correct' : 'wrong';
  const tier = getTimeTier(elapsedMs);
  safeEvent(`answer_${correctness}_${tier}`);
}

/**
 * Track game completion.
 * Fires: game_completed_play | game_completed_improve
 * Sets tags: final_score, correct_count
 */
export function trackGameCompleted(mode: 'play' | 'improve', score: number, correctCount: number): void {
  safeEvent(`game_completed_${mode}`);
  safeSet('final_score', String(score));
  safeSet('correct_count', String(correctCount));
}

/**
 * Track replay phase start.
 * Fires: replay_started
 * Sets tag: replay_count
 */
export function trackReplayStarted(incorrectCount: number): void {
  safeEvent('replay_started');
  safeSet('replay_count', String(incorrectCount));
}

/**
 * Track replay phase completion.
 * Fires: replay_completed
 */
export function trackReplayCompleted(): void {
  safeEvent('replay_completed');
}

/**
 * Track a virtual page view in the SPA.
 * Sets session tag: page = <pageName>
 * Called on every internal route change.
 */
export function trackPageView(pageName: string): void {
  safeSet('page', pageName);
}

/**
 * Set the current language session tag.
 * Called on app init and when user switches language.
 */
export function setLanguageTag(language: string): void {
  safeSet('language', language);
}

/**
 * Set the player type session tag.
 * Called when a player selects a profile (returning) or creates one (new).
 */
export function setPlayerTypeTag(type: 'new' | 'returning'): void {
  safeSet('player_type', type);
}

// ---------------------------------------------------------------------------
// Testing helpers (not part of public API)
// ---------------------------------------------------------------------------

/** @internal Reset initialization state — tests only. */
export function _resetForTesting(): void {
  isInitialized = false;
}

/** @internal Expose getTimeTier for unit tests. */
export { getTimeTier as _getTimeTierForTesting };
