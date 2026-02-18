# Research: Switch Player Emoji Button

**Feature Branch**: `024-switch-player-emoji`
**Date**: 2026-02-18

## Research Tasks

### 1. Accessible emoji-only button pattern

**Decision**: Use `aria-label={t('header.switchPlayer')}` on the `<button>` and wrap the emoji in a `<span aria-hidden="true">` to prevent screen readers from announcing the raw emoji glyph.

**Rationale**: This is the standard WAI-ARIA pattern for icon-only / emoji-only buttons. The `aria-label` provides the accessible name; hiding the emoji from the accessibility tree avoids double-announcement or nonsensical glyph names. The existing `header.switchPlayer` translation key already provides localised text in all 6 supported languages (EN, FR, DE, ES, JA, PT).

**Alternatives considered**:
- `title` attribute: Not reliably announced by screen readers; not keyboard-accessible on mobile. Rejected.
- Visually-hidden `<span>` text alongside emoji: More DOM complexity for the same outcome. Rejected.
- `role="img"` + `aria-label` on the emoji span: Viable but adds unnecessary role when the `<button>` itself already carries the accessible name. Rejected.

### 2. Emoji rendering consistency across browsers

**Decision**: Use the 👥 (U+1F465 BUSTS IN SILHOUETTE) emoji directly as a text character. No image fallback needed.

**Rationale**: Unicode 6.0 (2010). Supported natively in all target browsers (latest 2 versions of Chrome, Firefox, Safari, Edge) and all modern operating systems (Windows 10+, macOS 10.11+, Android 5+, iOS 9.1+, ChromeOS). No polyfill or SVG fallback required.

**Alternatives considered**:
- SVG icon: Adds an asset file, increases bundle size, requires styling. Rejected — emoji is simpler.
- Emoji image via CDN (e.g., Twemoji): Adds external dependency, network request, and GDPR concern. Rejected.

### 3. Button sizing for emoji-only content

**Decision**: Reduce horizontal padding from `8px 16px` to `8px 12px` (or similar) since the emoji is narrower than text. Keep `min-height: 44px; min-width: 44px` unchanged. Set `font-size: 1.25rem` for the emoji to ensure visual prominence.

**Rationale**: The current button has generous horizontal padding designed for multi-word translated text. With a single emoji character, the padding can be tightened to reduce the button footprint without violating the 44×44 px touch-target requirement (WCAG 2.5.5).

**Alternatives considered**:
- Keep original padding: Button would look oversized relative to content. Rejected.
- Make it a circle: Departure from the existing rectangular button style used elsewhere in the app. Rejected for visual consistency.

### 4. Impact on existing tests

**Decision**: Existing tests in `Header.test.tsx` query the button via `getByRole('button', { name: /switch player/i })`. Since `aria-label` sets the accessible name, these queries continue to match. No test will break. An additional assertion should verify the emoji text content.

**Rationale**: React Testing Library's `getByRole` uses the accessible name, which comes from `aria-label` when present. The switch from visible text to `aria-label` preserves the same accessible name.

**Alternatives considered**: None — this is the only viable approach.

## Summary

All decisions are straightforward applications of well-established patterns. No external research sources needed. No unresolved questions remain.
