# Research: Player Name Limit

**Feature**: 022-player-name-limit  
**Date**: 2025-07-15  

## Research Tasks

### 1. Current Name Length Enforcement

- **Decision**: Reduce `MAX_NAME_LENGTH` from 20 to 10 in `NewPlayerForm.tsx`.
- **Rationale**: The existing enforcement is already triple-layered (HTML `maxLength`, JS `.slice()` in `onChange`, submit-time validation). Changing the single constant propagates to all three guards automatically.
- **Alternatives considered**: Adding a separate validation service layer — rejected because YAGNI; the component already handles this correctly.

### 2. Character Counter Accessibility Pattern

- **Decision**: Use `aria-live="polite"` on a `<span>` element below the input.
- **Rationale**: Matches the existing `TouchNumpad.tsx` pattern (`aria-live="polite"` with `role="status"` for non-urgent announcements). `"polite"` is correct because the counter update is informational, not critical.
- **Alternatives considered**: `aria-live="assertive"` — rejected because character count changes are not urgent feedback (unlike correct/incorrect game answers which use `"assertive"` in `GameStatus.tsx`).

### 3. i18n Interpolation Syntax

- **Decision**: Add `player.charCount` key using `{current}/{max}` format with curly-brace interpolation.
- **Rationale**: Consistent with existing keys like `game.roundOf: 'Round {current} of {total}'` and `player.overwriteConfirm: '...{playerName}...'`. Values passed as `String()` matching the `PlayerCard` pattern.
- **Alternatives considered**: Hardcoded English string — rejected because the app supports 5 locales (en, fr, de, ja, pt).

### 4. CSS Styling for Counter

- **Decision**: Add `.charCounter` class in `NewPlayerForm.module.css` using `font-size: 0.875rem`, `color: #666`, `text-align: right`. Add `.charCounterWarning` with `color: #E65100` when at max.
- **Rationale**: `0.875rem` is one step below the form label size (`1.125rem`) — visually subordinate helper text. `#E65100` reuses the existing `.replaceButton` orange for visual consistency.
- **Alternatives considered**: Using a red warning color — rejected because red implies error; reaching the max is not an error state.

### 5. Backward Compatibility

- **Decision**: No migration. Existing names > 10 chars remain in storage and display in full everywhere.
- **Rationale**: The storage layer (`playerStorage.ts`) has no length validation — it simply persists what it receives. Display components render the full `name` string without truncation. Changing `MAX_NAME_LENGTH` only affects the input form, not stored data.
- **Alternatives considered**: Truncating existing names on load — rejected because it would silently modify user data and violate FR-007.

### 6. Unicode / Grapheme Clusters

- **Decision**: Use JavaScript's native `String.length` (UTF-16 code unit count) rather than grapheme segmentation.
- **Rationale**: The existing 20-char limit already uses `.length` and `.slice()`. Introducing `Intl.Segmenter` for grapheme-accurate counting would be a scope change and complexity increase with minimal practical benefit — player names are typically ASCII/Latin characters. The `maxLength` HTML attribute also uses code units.
- **Alternatives considered**: `Intl.Segmenter` for true grapheme counting — rejected because it adds complexity and diverges from the existing pattern; simple `.length` is sufficient for the target audience.
