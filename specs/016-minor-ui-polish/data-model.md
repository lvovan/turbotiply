# Data Model: Minor UI Polish

**Feature**: 016-minor-ui-polish  
**Date**: 2026-02-16

## Summary

No data model changes are required for this feature. All four changes are purely presentational (CSS/JSX). The existing data types are used as-is.

## Existing Entities Referenced (no modifications)

### GameRecord

Used by: ProgressionGraph (sparkline), RecentHighScores (score list)

| Field | Type | Description |
|-------|------|-------------|
| score | number | Points earned in the game |
| completedAt | number | Unix timestamp of game completion |
| roundResults | RoundResult[] | Per-round breakdown |
| gameMode | GameMode | 'play' or 'improve' |

### Player

Used by: MainPage (looking up current player for scores/history)

| Field | Type | Description |
|-------|------|-------------|
| name | string | Player display name |
| avatarId | string | Selected avatar identifier |
| gamesPlayed | number | Total games completed |
| gameHistory | GameRecord[] | All game records |

## Changes to Data Flow

### ScoreSummary component — new optional prop

The `ScoreSummaryProps` interface gains one optional field:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| history | GameRecord[] | No | Game history array for sparkline rendering. When provided with ≥ 2 entries, a ProgressionGraph is rendered. |

This is a **prop addition**, not a data model change. No storage, serialization, or persistence logic is affected.

## State Transitions

No state transitions are added or modified.
