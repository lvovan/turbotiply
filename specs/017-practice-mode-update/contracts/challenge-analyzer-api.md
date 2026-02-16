# API Contract: Challenge Analyzer

**Feature**: 017-practice-mode-update
**Date**: 2026-02-16
**Module**: `frontend/src/services/challengeAnalyzer.ts`

This is a client-side TypeScript module (no HTTP API). The contract defines the public function signatures that other modules depend on.

---

## Function: `getChallengingPairsForPlayer`

**Signature** (unchanged):
```typescript
function getChallengingPairsForPlayer(playerName: string): ChallengingPair[]
```

**Behavior change**:

| Aspect | Before (current) | After (updated) |
|--------|------------------|-----------------|
| Analysis window | Most recent single game with rounds | Up to 10 most recent games with rounds |
| Ranking signal | `difficultyRatio` (elapsedMs / gameAvgMs) for incorrect rounds only | `mistakeCount` (total incorrect across games), tiebroken by `avgMs` |
| Fallback (no mistakes) | Returns `[]` (no incorrect rounds → no challenging pairs) | Returns pairs ranked by `avgMs` descending (slowest = most tricky) |
| Game mode filter | None (uses most recent game regardless of mode) | None (analyzes both `play` and `improve` records) |
| Return type fields | `{ factorA, factorB, difficultyRatio }` | `{ factorA, factorB, mistakeCount, avgMs }` |

**Input**:
- `playerName: string` — case-insensitive lookup

**Output**:
- `ChallengingPair[]` sorted by:
  1. `mistakeCount` descending (most mistakes first)
  2. `avgMs` descending (slowest first, as tiebreaker)
  3. When ALL pairs have `mistakeCount === 0`: sorted by `avgMs` descending only

**Preconditions**:
- Player must exist in localStorage
- Player must have at least one `GameRecord` with `rounds` data

**Postconditions**:
- All returned pairs have `factorA ≤ factorB`
- When mistakes exist: only pairs with `mistakeCount > 0` are returned
- When no mistakes exist: all encountered pairs are returned, ranked by response time

---

## Function: `identifyChallengingPairs`

**Signature change**:

```typescript
// Before
function identifyChallengingPairs(rounds: RoundResult[]): ChallengingPair[]

// After
function identifyChallengingPairs(allRounds: RoundResult[]): ChallengingPair[]
```

**Behavior change**: 

| Aspect | Before | After |
|--------|--------|-------|
| Input semantics | Rounds from a single game | Flattened rounds from multiple games |
| Aggregation | Per-round difficulty ratio | Per-pair mistake count + avg response time |
| Output when no mistakes | `[]` (empty) | All pairs ranked by `avgMs` descending |

**Algorithm**:
1. Group rounds by unordered pair `(min(a,b), max(a,b))`
2. For each pair: count incorrect (`mistakeCount`), sum `elapsedMs` (`totalMs`), count total occurrences
3. Compute `avgMs = totalMs / occurrences`
4. If any pair has `mistakeCount > 0`:
   - Filter to pairs with `mistakeCount > 0`
   - Sort by `mistakeCount` desc, then `avgMs` desc
5. Else (all correct):
   - Sort all pairs by `avgMs` desc
6. Return `ChallengingPair[]`

---

## Function: `extractTrickyNumbers`

**Signature** (unchanged):
```typescript
function extractTrickyNumbers(pairs: ChallengingPair[]): number[]
```

**Behavior** (unchanged): Extracts unique factors from pairs, sorts ascending, caps at 8.

**Note**: This function is unaware of the ranking change. It consumes only `factorA`/`factorB` from the pre-sorted input.

---

## Consumers

| Consumer | What it reads | Impact |
|----------|--------------|--------|
| `useGame.ts` → `startGame('improve', name)` | Calls `getChallengingPairsForPlayer` | No code change — already passes result to `generateImproveFormulas` |
| `MainPage.tsx` | Calls `getChallengingPairsForPlayer` + `extractTrickyNumbers` | No code change — uses result for button visibility + display |
| `formulaGenerator.ts` → `generateImproveFormulas` | Reads `factorA`, `factorB` from `ChallengingPair[]` | No code change — doesn't read `difficultyRatio`/`mistakeCount`/`avgMs` |
| Tests (`challengeAnalyzer.test.ts`) | Asserts on `difficultyRatio` field | **Must update** — replace `difficultyRatio` assertions with `mistakeCount`/`avgMs` |

---

## Component Contract: `GameStatus`

**File**: `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx`

**Behavior change**:

| Aspect | Before | After |
|--------|--------|-------|
| Timer text (`<span ref={timerRef}>`) | Always rendered during input phase | Rendered only when `gameMode !== 'improve'` |
| `<CountdownBar>` component | Always rendered during input phase | Rendered only when `gameMode !== 'improve'` |
| All other rendering | — | Unchanged |

**Props** (unchanged):
```typescript
interface GameStatusProps {
  roundNumber: number;
  totalRounds: number;
  score: number;
  timerRef: RefObject<HTMLElement | null>;
  barRef: RefObject<HTMLDivElement | null>;
  isReplay: boolean;
  currentPhase: 'input' | 'feedback';
  isCorrect: boolean | null;
  correctAnswer: number | null;
  completedRound: number;
  gameMode?: GameMode;   // Already exists — drives conditional rendering
}
```

No new props needed. `gameMode` already controls the score/practice badge toggle; it now additionally controls timer/bar visibility.
