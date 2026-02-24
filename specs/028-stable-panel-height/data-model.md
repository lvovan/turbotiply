# Data Model: Stable Status Panel Height

**Feature**: 028-stable-panel-height  
**Date**: 2026-02-24

## Overview

This feature makes **no changes** to any data model, game state, component props, or persisted data. It is a pure CSS sizing change.

## Existing Entities (unchanged)

### GameStatusProps (component interface)

No changes. The existing props interface remains exactly as-is:

| Prop | Type | Description |
|------|------|-------------|
| `roundNumber` | `number` | 1-based round number for display |
| `totalRounds` | `number` | Total rounds in current mode |
| `score` | `number` | Current running score |
| `timerRef` | `RefObject<HTMLElement \| null>` | Ref for timer DOM element |
| `barRef` | `RefObject<HTMLDivElement \| null>` | Ref for countdown bar fill DOM element |
| `isReplay` | `boolean` | Whether currently in replay mode |
| `currentPhase` | `'input' \| 'feedback'` | Current round sub-phase |
| `isCorrect` | `boolean \| null` | Whether current answer is correct |
| `correctAnswer` | `number \| null` | Correct answer value |
| `completedRound` | `number` | Number of rounds completed |
| `gameMode` | `GameMode` | Current game mode (play/improve) |

### GameState (reducer state)

No changes. No new fields, no modified fields.

### Browser Storage

No changes. No new keys, no schema modifications.

## New Entities

None.

## State Transitions

None. This feature does not affect any application state or data flow — only CSS rendering behavior.
