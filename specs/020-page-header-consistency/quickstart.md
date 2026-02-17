# Quickstart: Page Header Consistency

**Feature**: 020-page-header-consistency | **Date**: 2026-02-17

## What This Feature Does

Unifies the header across both pages of the app so they share a consistent horizontal bar layout:

- **WelcomePage** (unauthenticated): `[ Multis! ]  ···  [ language-switcher ]`
- **MainPage** (authenticated): `[ Multis!  🐱  Hi, Name! ]  ···  [ language-switcher  Switch player ]`

Both use the same `<Header />` component, same styling, same height, same structure.

## Key Files

| File | Change |
|------|--------|
| `frontend/src/components/Header/Header.tsx` | Extend to render content in unauthenticated state (app title + language switcher) |
| `frontend/src/components/Header/Header.module.css` | Add `.title` class, rename `.playerInfo` to `.leftSection` |
| `frontend/src/pages/WelcomePage.tsx` | Replace inline title/language-switcher with `<Header />`, keep subtitle in content area |
| `frontend/src/pages/WelcomePage.module.css` | Remove `.title`, `.languageArea`; remove `position: relative` from `.welcomePage` |
| `frontend/src/pages/MainPage.module.css` | Remove `.readyHeading` (absorbed into Header title) |

## How to Verify

1. Run the dev server: `npm run dev`
2. Open the app — the WelcomePage should show a horizontal header bar with "Multis!" on the left and the language switcher on the right
3. Create a player and start a session — the MainPage header should show "Multis!" + avatar + greeting on the left, language switcher + "Switch player" on the right
4. Navigate back and forth — both headers should have the same visual height
5. Resize to 320px — both headers should remain consistent with no overflow

## How to Test

```bash
cd frontend
npm test
```

Key test areas:
- `tests/components/Header.test.tsx` — unauthenticated rendering, app title presence
- `tests/pages/WelcomePage.test.tsx` — header structure, subtitle in content area
- `tests/pages/MainPage.test.tsx` — app title in header

## Design Decisions

See [research.md](research.md) for full rationale on:
1. Conditional rendering inside one component (vs. props/composition)
2. App title on both pages with inline arrangement
3. Title font size: 1.25rem, weight 800, color #1565C0
4. WelcomePage migration: remove inline title/language, add `<Header />`
