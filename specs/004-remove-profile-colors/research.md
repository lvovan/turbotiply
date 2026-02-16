# Research: Remove Profile Colors

**Feature**: 004-remove-profile-colors  
**Date**: 2026-02-16

## Research Tasks

### 1. localStorage migration strategy for removing a field

**Decision**: Bump `CURRENT_VERSION` from 2 to 3. In `readStore()`, add a v2→v3 migration step that iterates all players and deletes the `colorId` property using `delete player.colorId`. Re-persist immediately.

**Rationale**: The existing codebase already follows this pattern (v1→v2 migration adds `totalScore`/`gamesPlayed`). Deleting a field is simpler than adding one — just `delete` the property and save. The `COLOR_REMAP` logic is also removed since the field itself no longer exists.

**Alternatives considered**:
- *Lazy migration (ignore colorId, never delete)*: Rejected — leaves dead data in storage indefinitely, and TypeScript types would diverge from runtime state.
- *Clear all storage and start fresh*: Rejected — destructive, violates FR-006 (no data loss).

### 2. TypeScript interface changes when removing a field

**Decision**: Remove `colorId` from both `Player` and `Session` interfaces. All `Pick<Player, 'name' | 'avatarId' | 'colorId'>` type annotations become `Pick<Player, 'name' | 'avatarId'>`.

**Rationale**: Removing from the interface ensures compile-time enforcement — any code still referencing `colorId` will produce a type error, making it easy to find and fix all call sites.

**Alternatives considered**:
- *Mark as optional `colorId?: string`*: Rejected — keeps dead code paths alive and violates YAGNI.
- *Use a type alias/union*: Rejected — unnecessary indirection for a simple removal.

### 3. Component deletion approach

**Decision**: Delete the entire `ColorPicker/` directory (component + CSS module) and `ColorPicker.test.tsx`. Remove imports and usages from `NewPlayerForm.tsx`.

**Rationale**: The component has no other consumers. Clean deletion is preferred over leaving dead code.

**Alternatives considered**:
- *Keep component but hide it*: Rejected — YAGNI, complexity without benefit.

### 4. PlayerCard visual change after color dot removal

**Decision**: Remove the `<span className={styles.colorDot}>` element and the `.colorDot` CSS class. The avatar emoji is already rendered prominently and serves as the primary visual identifier.

**Rationale**: The avatar emoji already occupies a dedicated column in the card layout. Removing the color dot simplifies the card without reducing identifiability. The spec explicitly states avatar emoji is the sole visual identifier (FR-011).

**Alternatives considered**:
- *Replace color dot with a larger avatar*: Not required by spec — current avatar size is adequate.

### 5. Header component color-based styling removal

**Decision**: Remove `borderBottomColor` and text `color` styling that derives from `session.colorId`. Use the default header styling (already defined in CSS module).

**Rationale**: The header's border and greeting text color were the only places session color was visually applied. Default styles provide sufficient visual hierarchy.

**Alternatives considered**:
- *Use a fixed accent color*: Could be done later as a separate feature if desired. Not in scope.

### 6. Test update strategy

**Decision**: Systematically remove `colorId` from all test fixtures, mock data, and assertions. Delete the `ColorPicker.test.tsx` file entirely. Update the accessibility test to remove the ColorPicker a11y test case.

**Rationale**: Tests must mirror the updated types. Any test referencing `colorId` would fail to compile after the type change, making this a mechanical find-and-remove operation.

**Alternatives considered**:
- *Keep color tests as regression tests*: Rejected — tests would reference removed code and types.
