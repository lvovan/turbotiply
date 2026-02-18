# Data Model: Switch Player Emoji Button

**Feature Branch**: `024-switch-player-emoji`
**Date**: 2026-02-18

## Entities

No data model changes. This feature is a pure presentation change:

- No new entities introduced
- No existing entities modified
- No state transitions affected
- No validation rules changed
- No storage impact (localStorage/sessionStorage unchanged)

## Existing Entities Referenced (read-only)

| Entity | Relevance | Impact |
|--------|-----------|--------|
| `Session` (type: `{ playerName, avatarId, startedAt }`) | The switch-player button appears only when a session is active | None — read-only reference |
| i18n translation key `header.switchPlayer` | Currently used as visible button text; will be repurposed as `aria-label` value | Usage changes from visible text to accessible label; key and all translations remain unchanged |
