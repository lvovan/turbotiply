# Research: Numeric Keypad Input on Touch Devices

**Feature**: `007-numeric-keypad-input`  
**Date**: 2026-02-16

## Decision 1: HTML Input Attribute Combination

**Decision**: Use `type="text"` + `inputMode="numeric"` + `pattern="[0-9]*"` + `enterKeyHint="go"`

**Rationale**:
- **iOS Safari 14+**: The `pattern="[0-9]*"` attribute is a long-standing iOS-specific trigger that causes Safari to show a pure 0–9 digit keypad (no phone dialler symbols). `inputMode="numeric"` reinforces this. This is the same keypad shown for credit card fields.
- **Android Chrome 10+**: `inputMode="numeric"` is the primary driver. Android Chrome respects this attribute directly and shows a pure 0–9 digit keypad. The `pattern` attribute is ignored for keyboard selection on Android but provides HTML constraint validation.
- **Desktop**: No on-screen keyboard impact. Input behaves as a standard text field. No spinner controls appear (unlike `type="number"`).
- **`enterKeyHint="go"`**: Controls the return key label on the soft keyboard. "Go" indicates a submit action, which matches the form submission behaviour. Well-supported (Chrome 77+, Safari 13.1+, Firefox 94+). Without it, iOS shows "return" and Android shows a generic enter arrow — less clear for children.

**Alternatives considered**:

| Approach | iOS Safari | Android Chrome | Why rejected |
|----------|-----------|----------------|--------------|
| `type="number"` + `inputMode="numeric"` (current) | May show phone dialler or numeric with extra symbols | Varies by device | Unreliable on iOS; shows spinner controls on desktop |
| `type="tel"` | Phone dialler with `+`, `*`, `#` | Phone dialler with `+`, `*`, `#` | Shows phone symbols — explicitly prohibited by FR-002 |
| `type="text"` + `inputMode="decimal"` | 0–9 keypad with decimal separator | 0–9 keypad with decimal separator | Decimal separator is unnecessary noise for integer answers |

## Decision 2: `pattern` Value Syntax

**Decision**: Use `pattern="[0-9]*"` (literal character class), not `pattern="\d*"`

**Rationale**:
- iOS Safari specifically checks for the literal pattern `[0-9]*` to trigger its numeric keypad. Using `\d*` does **not** trigger the iOS numeric keypad.
- Per current HTML spec, `pattern` is compiled with the `v` flag, where `\d` matches any Unicode digit (not just ASCII 0–9). Using `[0-9]` is more precise for this use case.

**Alternatives considered**: `\d*` — rejected because it does not trigger iOS numeric keypad and matches Unicode digits beyond 0–9.

## Decision 3: ARIA Role Change

**Decision**: Accept the role change from `spinbutton` (implicit role of `type="number"`) to `textbox` (implicit role of `type="text"`)

**Rationale**:
- A multiplication answer field is not a "spin button" — it's simple digit entry. The `textbox` role is semantically more accurate.
- The existing `aria-label="Your answer"` provides sufficient context for screen readers.
- Tests must be updated: `getByRole('spinbutton')` → `getByRole('textbox')`.

**Alternatives considered**: Adding explicit `role="spinbutton"` to preserve the old role — rejected because it would be semantically incorrect and force unnecessary ARIA maintenance.

## Decision 4: Attributes to Remove

**Decision**: Remove `min={0}` from the input element

**Rationale**:
- The `min` attribute is only valid on `type="number"`, `date`, `range`, etc. — not on `type="text"`.
- Input validation is already handled by the `handleChange` function which strips non-digit characters via `inputValue.replace(/[^0-9]/g, '')`.

**Alternatives considered**: None — this is a direct consequence of switching to `type="text"`.

## Decision 5: CSS Spinner Hiding Rules

**Decision**: Keep the existing CSS rules that hide spinner controls (`.input::-webkit-outer-spin-button`, `.input::-webkit-inner-spin-button`, `-moz-appearance: textfield`) — they become no-ops with `type="text"` but are harmless

**Rationale**:
- With `type="text"`, browsers do not render spinner controls, so the CSS rules have no effect.
- Removing them is safe but unnecessary. Keeping them is a defensive measure in case the input type is ever changed back.
- No performance or correctness impact either way.

**Alternatives considered**: Removing the CSS rules — acceptable but provides no benefit. Either approach is valid; keeping them is slightly more defensive.
