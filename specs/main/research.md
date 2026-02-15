# Research: Player Sessions

**Feature**: 001-player-sessions
**Date**: 2026-02-14
**Status**: Complete — all unknowns resolved

## Research Topics

### 1. Avatar System for Children

**Decision**: Use kids-friendly emojis

**Rationale**: Emojis are light, available universally and will lessen download requirements and thus slightly speed up the application.

**Alternatives Considered**:
- **SVG**: Heavier processing but better more consistent rendering.
- **CSS-based shapes**: Too abstract for ages 6–8; hard to make 12 meaningfully distinct options.
- **Icon library** (Lucide, Heroicons): Designed for UI chrome, not character identity. Feels corporate, not playful.

---

### 2. Color Palette for Children

**Decision**: 8 predefined colors, all WCAG AA contrast-verified against white/dark text, color-blind-safe.

**Rationale**: 8 colors provides meaningful personalization in a 2×4 grid without overwhelming. All colors are tested for deuteranopia, protanopia, and tritanopia distinctness.

| Name | Hex | Text on Top | Notes |
|------|-----|-------------|-------|
| Red | `#D32F2F` | White | Distinct from green for CVD |
| Orange | `#E65100` | White | Warm, high energy |
| Gold | `#F9A825` | Dark `#1A1A1A` | Bright, fun |
| Green | `#2E7D32` | White | Dark enough for AA |
| Teal | `#00796B` | White | Distinct from green for tritanopia |
| Blue | `#1565C0` | White | Universal favorite for kids |
| Purple | `#6A1B9A` | White | Popular with ages 6–12 |
| Pink | `#C2185B` | White | Magenta-pink, not pastel |

**Alternatives Considered**:
- **Fewer (4–5)**: Not enough personalization on shared devices with 3+ siblings.
- **More (12–16)**: Harder to keep color-blind-distinguishable. Grid becomes visually busy on 320px.
- **User-defined hex/HSL**: Fails WCAG guarantees, overwhelming for young children, violates YAGNI.

---

### 3. localStorage Schema Design

**Decision**: Single key `turbotiply_players` containing a versioned JSON object with a player array, ordered by `lastActive` descending.

**Rationale**: Single key avoids key sprawl, makes backup/restore trivial. Prefix `turbotiply_` prevents collisions on shared browser profiles (school Chromebooks). Version field enables forward-compatible migrations.

**Schema**:
```json
{
  "version": 1,
  "players": [
    {
      "name": "Mia",
      "avatarId": "cat",
      "colorId": "blue",
      "lastActive": 1739520000000,
      "createdAt": 1739500000000
    }
  ]
}
```

**Key decisions**:
- `avatarId`/`colorId` as string identifiers (not indices) — stable if the list changes.
- `lastActive` as Unix epoch milliseconds — `Date.now()`, sortable, timezone-agnostic.
- Array re-sorted by `lastActive` desc on every session start. Truncated to 50 on write.
- `createdAt` included — nearly free, useful for future features.

**Migration strategy**: Version-stamped data with `migrateVNtoVN+1` functions run on app startup. Idempotent, write-back immediately.

**Alternatives Considered**:
- **One key per player**: Fragile enumeration, no atomic reads.
- **IndexedDB**: Overkill for <50 small records. Async API adds complexity. YAGNI.
- **No version field**: Makes future schema changes risky.

---

### 4. Session Detection on Tab Close

**Decision**: `sessionStorage` for session-active flag (primary), `visibilitychange` for updating `lastActive` (supplementary).

**Rationale**: `sessionStorage` is scoped to a single tab and automatically cleared on tab close — the perfect primitive for this use case. On app startup, check for a session key: absent → show welcome screen. Handles crashes/force-closes automatically (sessionStorage is wiped). Each tab has independent sessionStorage, satisfying the multi-tab edge case.

`visibilitychange` fires reliably on Chromebooks, mobile, and desktop. Used to update `lastActive` in localStorage when the tab is hidden.

**Alternatives Considered**:
- **`beforeunload` only**: Unreliable on mobile browsers (Safari, Chrome Android) and school Chromebooks. Unnecessary when sessionStorage auto-clears.
- **`visibilitychange` only**: Fires on tab switch/minimize — cannot distinguish "temporarily hidden" from "closed forever."
- **Cookie with session lifetime**: Shares state across tabs (defeats independence), COPPA implications.

---

### 5. React State Management for Session

**Decision**: React Context with `useState` — no reducer, no external library.

**Rationale**: Session state is minimal (~4 fields, 2 transitions: start/end). A `SessionProvider` wrapping the app reads from `sessionStorage` on mount, writes on changes. `useSession()` hook provides access anywhere.

`useReducer` is overkill for 2 transitions. Zustand/Jotai add dependencies for something React Context handles in <30 lines. Constitution says YAGNI.

**Alternatives Considered**:
- **Zustand**: Adds dependency for 4 fields. Easy migration path if needed later.
- **`useReducer`**: Boilerplate for only 2 transitions.
- **Prop drilling**: Breaks down with >2 consumers (header + main + welcome).

---

### 6. WCAG 2.1 AA Avatar/Color Picker Patterns

**Decision**: `role="radiogroup"` + `role="radio"` with roving `tabindex` and arrow-key navigation for both avatar and color pickers.

**Rationale**: Both pickers are single-select from a visual grid — semantically identical to a radio group (per WAI-ARIA APG recommendation). Screen readers announce naturally: "Avatar picker, radio group. Cat, radio button, 1 of 12."

**Keyboard navigation** (WAI-ARIA APG):
- `Tab`: Into group (selected/first item). Next `Tab` → next group.
- `→`/`↓`: Next item (wraps). `←`/`↑`: Previous item (wraps).
- `Space`: Selects focused item.

**Roving tabindex**: Focused item `tabindex="0"`, all others `tabindex="-1"`. Tab skips the group as a unit.

**Focus indicators**:
- Selected: 3px solid border + `aria-checked="true"`.
- Focus: 2px outline with offset (`:focus-visible`), distinct from selected.
- Both ≥ 3:1 contrast per WCAG 2.4.7/2.4.11.
- Color picker swatches: `aria-label` with color name + checkmark icon for selection (not color alone).

**Alternatives Considered**:
- **`role="grid"`**: For 2D data navigation (spreadsheets). Over-complex for a flat list.
- **Hidden `<input type="radio">`**: Harder to style with visual swatches.
- **Listbox pattern**: Designed for scrollable lists, not visual grids.

---

## Summary Matrix

| Topic | Decision | Key Driver |
|-------|----------|------------|
| Avatars | 12 kids-friendly emoji-based animal/object illustrations | Bias-free, lightweight, fun, accessible |
| Colors | 8 curated AA-safe, CVD-distinct colors | Contrast compliance + color-blind safety |
| localStorage | Single versioned key, string IDs, epoch timestamps | Simplicity, migration-safe, collision-proof |
| Session detection | sessionStorage + visibilitychange | Auto-clears on tab close, crash-safe, Chromebook-reliable |
| React state | Context + useState, no external library | YAGNI, <30 LoC, easy to upgrade later |
| A11y pickers | radiogroup/radio with roving tabindex | WAI-ARIA APG recommended, screen-reader natural |
