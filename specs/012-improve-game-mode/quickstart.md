# Quickstart: Improve Game Mode

**Feature**: 012-improve-game-mode  
**Date**: 2026-02-16

## Prerequisites

- Node.js 18+ and npm
- Git (on branch `012-improve-game-mode`)

## Setup

```bash
cd frontend
npm install
```

No new dependencies are required for this feature.

## Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173/`.

## Testing

```bash
# Run full test suite
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest run tests/services/challengeAnalyzer.test.ts
```

## Key Files to Modify/Create

| File | Action | Purpose |
|------|--------|---------|
| `src/types/player.ts` | Modify | Add `RoundResult` type, extend `GameRecord` with `rounds?` and `gameMode?` |
| `src/types/game.ts` | Modify | Add `GameMode` type, extend `GameState` with `gameMode` |
| `src/services/challengeAnalyzer.ts` | **Create** | Challenge analysis algorithm — `identifyChallengingPairs()`, `extractTrickyNumbers()` |
| `src/services/formulaGenerator.ts` | Modify | Add `generateImproveFormulas()` function |
| `src/services/playerStorage.ts` | Modify | v4→v5 migration, `saveGameRecord()`, filter Improve from score functions |
| `src/services/gameEngine.ts` | Modify | Accept `mode` in `START_GAME`, add `gameMode` to state |
| `src/hooks/useGame.ts` | Modify | Pass `GameMode` to reducer, expose `gameMode` |
| `src/pages/MainPage.tsx` | Modify | Dual-mode buttons, Improve completion screen, conditional score persistence |
| `src/components/GamePlay/ModeSelector/` | **Create** | Play/Improve button component with descriptors |
| `src/components/GamePlay/GameStatus/` | Modify | Show "Practice" instead of score during Improve |
| `src/components/GamePlay/ScoreSummary/` | Modify | Improve variant: "X/10 right" + incorrect pairs list |
| `tests/services/challengeAnalyzer.test.ts` | **Create** | Unit tests for analysis algorithm |
| `tests/components/ModeSelector.test.tsx` | **Create** | Component tests for mode selector |
| `tests/integration/improveMode.test.tsx` | **Create** | Integration tests for full Improve flow |

## Implementation Order

1. **Types** — `RoundResult`, `GameMode`, extend `GameRecord` and `GameState`
2. **Storage migration** — v4→v5, `saveGameRecord()`, filter Improve from aggregations
3. **Challenge analyzer** — Pure function with comprehensive test coverage
4. **Formula generator** — `generateImproveFormulas()` with tests
5. **Game engine** — Accept `mode` in START_GAME, propagate through state
6. **useGame hook** — Pass mode, expose `gameMode`
7. **ModeSelector component** — Play/Improve buttons with descriptors
8. **MainPage** — Wire up dual mode, conditional persistence
9. **GameStatus** — "Practice" indicator for Improve
10. **ScoreSummary** — Improve completion variant
11. **Integration tests + accessibility audit**

## Validation Checklist

- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] `npm test` — all tests pass
- [ ] Play a standard game → score persists, round data saved
- [ ] Play an Improve game → score NOT persisted, round data saved with `gameMode: 'improve'`
- [ ] Verify Improve button hidden for new player
- [ ] Verify Improve button shown when challenging pairs exist
- [ ] Verify "Practice" indicator during Improve gameplay
- [ ] Verify "X/10 right" completion screen for Improve
- [ ] Keyboard navigation works for both mode buttons
- [ ] Screen reader announces mode buttons and descriptors correctly
