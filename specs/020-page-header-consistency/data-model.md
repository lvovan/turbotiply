# Data Model: Page Header Consistency

**Feature**: 020-page-header-consistency | **Date**: 2026-02-17

## Entities

No new entities. No data model changes. This feature is a pure visual/layout refactoring.

## Existing Entities (referenced, not modified)

### Session

- Already exists in `useSession()` hook
- Used by the `Header` component to determine authenticated vs. unauthenticated rendering
- Fields referenced: `playerName` (string), `avatarId` (string), `startedAt` (number)
- No changes to the Session type or storage

### Player

- Already exists in `types/player.ts`
- Not directly used by the Header component
- No changes to the Player type or storage

## State Transitions

No state transitions are affected. The Header component branches on the existing `isActive` boolean from `useSession()`:

- `isActive === false` → Render unauthenticated header (title + language switcher)
- `isActive === true` → Render authenticated header (title + avatar + greeting + language switcher + switch button)

This branching already exists (currently returns `null` for the inactive case). The change replaces the `null` return with actual rendered content.
