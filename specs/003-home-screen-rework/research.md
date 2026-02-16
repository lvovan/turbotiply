# Research: Home Screen Rework

**Feature**: 003-home-screen-rework  
**Date**: 2026-02-15  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## R1: Avatar Selection (12 → 8)

**Decision**: Keep rocket, star, cat, turtle, robot, dinosaur, unicorn, lightning  
**Remove**: dog, planet, flower, crown

**Rationale**: Each kept avatar occupies a unique silhouette category (round face, square face, profile head, vertical elongated, horizontal body, angular zigzag, radiating points, shelled body), ensuring instant visual recognition at small sizes on mobile. The four removals target the most visually redundant pairs: dog ≈ cat (round pet faces), planet ≈ rocket (space objects), flower/crown ≈ star (radiating/symbolic shapes).

**Remapping table** (removed → kept):

| Removed | Remap to | Rationale |
|---------|----------|-----------|
| dog     | cat      | Both round domestic-pet face emojis |
| planet  | rocket   | Both space-themed |
| flower  | star     | Both radial/radiating shape, warm tones |
| crown   | star     | Both gold/yellow achievement-themed symbols |

**Alternatives considered**:
- Keeping dog + removing cat: Dog and cat are equally popular; cat was kept because its pointed-ear silhouette is slightly more distinctive at small sizes.
- Keeping crown + removing lightning: Crown is less "character-like" — children identify less with inanimate objects. Lightning's angular zigzag provides maximum shape contrast.

---

## R2: Color Selection (8 → 6)

**Decision**: Keep red, gold, teal, blue, purple, pink  
**Remove**: orange, green

**Rationale**: Eliminating the red-green CVD confusion pair is the single highest-impact accessibility improvement. Orange is near-indistinguishable from red under protanopia/deuteranopia (both → dark olive at similar luminance). The 6-color palette maintains 3:3 warm/cool balance and ensures all pairings are distinguishable across protanopia, deuteranopia, and tritanopia.

**CVD analysis**:
- Protanopia/deuteranopia (~8% of males): red→dark olive, gold→yellow (bright), teal→desaturated blue, blue→blue, purple→deep blue, pink→gray-blue. Six distinguishable tones.
- Tritanopia (<0.01%): Gold remains brightest; blue/teal differ in luminance; red/pink/purple retain luminance differences.

**Remapping table** (removed → kept):

| Removed | Remap to | Rationale |
|---------|----------|-----------|
| orange  | red      | Same warm family; red is the canonical primary |
| green   | teal     | Teal is nearest color with green undertones (hue 164°) |

**Alternatives considered**:
- Removing pink + keeping green: Rejected because red-green confusion is the most impactful CVD issue to eliminate.
- Removing gold + keeping orange: Rejected because gold has the highest luminance in the set, providing critical contrast for CVD users.

---

## R3: Average Score Storage

**Decision**: Add `totalScore` and `gamesPlayed` fields to the `Player` interface. Compute average score at display time as `Math.round(totalScore / gamesPlayed)`.

**Rationale**: The current `Player` type only stores `name`, `avatarId`, `colorId`, `lastActive`, `createdAt`. No score data is persisted. To display average score on player cards (FR-018), we need to persist score data per player.

**Design**:
- Add two fields to `Player`: `totalScore: number` (sum of all game scores) and `gamesPlayed: number` (count of completed games).
- Compute `averageScore = totalScore / gamesPlayed` (or 0 if gamesPlayed is 0) at display time — no need to store the computed value.
- Update `totalScore` and `gamesPlayed` in `playerStorage.ts` when a game completes.
- Increment `PlayerStore.version` from 1 to 2. Add migration logic: when loading version 1 data, set `totalScore = 0` and `gamesPlayed = 0` for all players.
- Display as whole number (rounded) on the player card.

**Alternatives considered**:
- Storing an array of all game scores: Rejected — unnecessary complexity, grows unbounded, and violates YAGNI (constitution principle II).
- Single `averageScore` float field: Rejected — impossible to correctly update a running average without also storing the count.

---

## R4: Viewport Space Budget (360 × 640)

**Decision**: Both views (new player form and returning player list) fit within 640px height with the layouts described below.

### New Player Form View Layout

| Element | Height (px) | Notes |
|---------|-------------|-------|
| Top padding | 16 | Reduced from 24 |
| Title "Turbotiply!" | 32 | 2rem at 16px base |
| Gap | 4 | Reduced from 8 |
| Subtitle | 20 | 1.125rem |
| Gap | 16 | Reduced from 32 |
| "Your name" label | 20 | |
| Gap | 6 | |
| Name input | 44 | Min tap target |
| Gap | 12 | |
| "Choose your avatar" label | 20 | |
| Gap | 6 | |
| Avatar grid (4×2) | 112 | 2 rows × 48px + 16px gap |
| Gap | 12 | |
| "Choose your color" label | 20 | |
| Gap | 6 | |
| Color grid (6×1 row) | 44 | Single row, 44px circles |
| Gap | 12 | |
| Submit button | 48 | |
| Bottom padding | 16 | |
| **Total** | **~466** | **174px margin remaining** |

### Returning Player List View Layout

| Element | Height (px) | Notes |
|---------|-------------|-------|
| Top padding | 16 | |
| Title "Turbotiply!" | 32 | |
| Gap | 4 | |
| Subtitle | 20 | |
| Gap | 16 | |
| 5 player cards (single-line) | 260 | 5 × 44px + 4 × 8px gaps |
| Gap | 12 | |
| "New player" button | 44 | |
| Gap | 8 | |
| "Clear all profiles" button | 32 | De-emphasized, smaller text |
| Bottom padding | 16 | |
| **Total** | **~460** | **180px margin remaining** |

**Conclusion**: Both views fit comfortably within 640px height with ample margin for browser chrome and system UI. The margin buffer accommodates devices with navigation bars or notches.

---

## R5: Best Practices for localStorage.clear()

**Decision**: Use `localStorage.clear()` for the full reset, followed by `window.location.reload()`.

**Rationale**: 
- `localStorage.clear()` is synchronous and removes all keys for the origin — exactly what FR-005 requires.
- `sessionStorage.clear()` should also be called to ensure the active session is removed.
- `window.location.reload()` forces a full page reload, which re-initializes React and all hooks from scratch.
- Wrap in try/catch: if either clear operation throws (rare — SecurityError in some sandbox modes), display an error message and do NOT reload.

**Alternatives considered**:
- Selectively deleting known keys: Rejected — more fragile (must enumerate all keys), and the spec explicitly says "remove everything from local browser storage."
- Using `location.href = location.href`: Behaves identically to `reload()` but is less semantically clear.
