# Data Model: Practice Score Separation

**Date**: 2026-02-17 | **Branch**: `021-practice-score-separation`

## Overview

This feature does **not** introduce any new entities, modify existing entity schemas, or change data persistence. All changes are in derived/computed values at the display layer.

## Existing Entities (Unchanged)

### GameRecord

| Field | Type | Description |
|-------|------|-------------|
| `score` | `number` | Total points earned (0–50) |
| `completedAt` | `number` | Epoch ms timestamp |
| `rounds?` | `RoundResult[]` | Per-round data (absent for pre-v5 records) |
| `gameMode?` | `GameMode` | `'play'` or `'improve'` (absent → `'play'` for pre-v5) |

**Source**: `frontend/src/types/player.ts` L17–L27

### RoundResult

| Field | Type | Description |
|-------|------|-------------|
| `factorA` | `number` | First multiplication factor (2–12) |
| `factorB` | `number` | Second multiplication factor (2–12) |
| `isCorrect` | `boolean` | Correct on initial attempt |
| `elapsedMs` | `number` | Response time in ms |

**Source**: `frontend/src/types/player.ts` L5–L14

### ChallengingPair (Derived, not persisted)

| Field | Type | Description |
|-------|------|-------------|
| `factorA` | `number` | Smaller factor (normalized: a ≤ b) |
| `factorB` | `number` | Larger factor (normalized: a ≤ b) |
| `mistakeCount` | `number` | Total incorrect answers across analyzed games |
| `avgMs` | `number` | Mean response time across all occurrences |

**Source**: `frontend/src/types/game.ts` L33–L43

## New Derived Concept (Not Persisted, No Type Change)

### Factor Difficulty Ranking

A per-factor aggregate computed from `ChallengingPair[]` inside `extractTrickyNumbers()`:

| Property | Type | Description |
|----------|------|-------------|
| factor | `number` | Individual number (2–12) |
| aggregateMistakes | `number` | Sum of `mistakeCount` across all pairs containing this factor |
| weightedAvgMs | `number` | Weighted average response time across all pairs containing this factor |

This is an intermediate computation within `extractTrickyNumbers()` — not exposed as a type. Used only to rank factors and select the top 3.

## Filtering Rules Summary

| Display | Filter | Source |
|---------|--------|--------|
| Recent High Scores | Play-mode only (last 5 Play games) | `getRecentHighScores()` |
| Sparkline | Play-mode only (last 10 Play games) | `getGameHistory()` |
| Profile Average | Play-mode only (last 10 Play games) | `getRecentAverage()` |
| Tricky Number Analysis | Both modes (last 10 games with rounds) | `getChallengingPairsForPlayer()` |
| Improve Button Descriptor | Top 3 factors by aggregate mistakes | `extractTrickyNumbers()` |

## State Transitions

No state transitions affected. Game mode is set at game start and persisted at game end — no changes to this flow.

## Validation Rules

No new validation rules. Existing constraints preserved:
- Game history capped at 100 records per player
- Tricky number display capped at 3 (changed from 8)
- Factors range 2–12
