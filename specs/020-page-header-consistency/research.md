# Research: Page Header Consistency

**Feature**: 020-page-header-consistency | **Date**: 2026-02-17

## Decision 1: Component Pattern for Dual-State Header

**Decision**: Use conditional rendering inside the existing `Header` component, branching on `isActive` from `useSession()`.

**Rationale**: The Header already imports `useSession` and branches on `isActive` (currently returning `null` when inactive). Replacing the `null` return with the unauthenticated variant is the smallest possible change. Both states share the same CSS flex bar layout and differ only in their left-side content. A composition or props-based pattern would add indirection with no benefit for two known, stable states.

**Alternatives considered**:
- Props-based (`<Header variant="welcome" />`): Rejected — adds unnecessary indirection since the component already has direct access to session state via its hook.
- Composition/slots (`<Header left={...} right={...}>`): Rejected — over-engineered for 2 known states; pushes layout knowledge to callers and makes consistent styling harder to enforce.

## Decision 2: App Title Placement

**Decision**: Show "Multis!" on both pages, inline in the left section of the header bar.

- WelcomePage (unauthenticated): `[ Multis! ]  ...  [ lang-switcher ]`
- MainPage (authenticated): `[ Multis!  avatar  Hi, Name! ]  ...  [ lang-switcher  Switch player ]`

**Rationale**: The spec explicitly requires the title on both pages (FR-002, FR-002a). The title is short (7 chars) and fits alongside the avatar and greeting without crowding. The greeting already has `text-overflow: ellipsis` for long names, so truncation is handled. The font-weight difference (title: 800 vs greeting: 600) creates visual hierarchy without needing a divider element.

**Alternatives considered**:
- Title only on WelcomePage: Rejected — violates FR-002 and creates asymmetry that undermines the consistency goal.

## Decision 3: Title Font Size in the Header Bar

**Decision**: Use `1.25rem` (20px), `font-weight: 800`, `color: #1565C0`, no responsive breakpoint needed.

**Rationale**:
- Fits the bar height: The bar has `min-height: 44px` and `padding: 12px 16px`. At 1.25rem with line-height: 1, the title occupies ~20px with comfortable breathing room.
- Clear hierarchy: At 1.25rem/800, the title is visually distinct from the 1rem/600 greeting without dominating the bar.
- No responsive scaling needed: Unlike the current WelcomePage title (2rem to 2.5rem), 1.25rem works at all widths including 320px.
- Consistent with existing type scale: `.readyHeading` in MainPage already uses 1.25rem.

**Alternatives considered**:
- `1.5rem` (24px): Viable but competes with avatar height; tight at 320px with long names.
- `1rem` (16px): Too small; indistinguishable from greeting text.
- `1.75rem`+: Too large for a compact utility bar.

## Decision 4: WelcomePage Migration Impact

**Decision**: The WelcomePage will:
1. Add `<Header />` component at the top (replaces inline title and language switcher)
2. Remove the `<h1>` title element and the absolutely-positioned language switcher `<div>`
3. Keep the subtitle in the content area below the header (per spec FR-004a)
4. Remove `position: relative` from `.welcomePage` container (was only needed for absolute language switcher)

**CSS removals from WelcomePage.module.css**: `.title`, `.languageArea`, their media queries.

**CSS additions to Header.module.css**: `.title` class for the app title, `.leftSection` rename of `.playerInfo`.
