# Data Model: Hide Sparkline in Practice/Improve Mode

**Feature**: 025-hide-practice-sparkline  
**Date**: 2026-02-18

## Entities

No new entities, fields, or relationships are introduced by this feature.

## Changes to Existing Entities

None. The existing data model is unchanged:

- **GameMode** (`'play' | 'improve'`): Already exists in `types/player.ts`. Used as-is.
- **GameRecord**: Already has optional `gameMode` field. No changes.
- **ScoreSummaryProps**: Already receives `gameMode?: GameMode`. No changes.

## State Transitions

No new state transitions. The `gameMode` value is set at game start and remains constant through completion. The sparkline visibility is now derived from this existing state:

| Game Mode | Result Screen Sparkline |
|-----------|------------------------|
| `'play'`  | Visible (if ≥2 play-mode history records) |
| `'improve'` | Hidden |

## Validation Rules

No new validation rules. The existing `MIN_GAMES = 2` threshold in `ProgressionGraph` continues to apply for play-mode games.
