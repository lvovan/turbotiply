# Implementation Plan: Page Header Consistency

**Branch**: `020-page-header-consistency` | **Date**: 2026-02-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/020-page-header-consistency/spec.md`

## Summary

Unify the header layout across both app pages (WelcomePage and MainPage) so they share a consistent horizontal bar structure. The WelcomePage currently uses a centered/stacked layout with a large title and absolutely-positioned language switcher, while the MainPage uses the `Header` component with a compact horizontal bar. The plan is to refactor the existing `Header` component to support both authenticated (MainPage) and unauthenticated (WelcomePage) states, producing the same visual bar in both cases: app title on the left, utility actions on the right. The WelcomePage subtitles move below the header bar into the content area.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19.2
**Primary Dependencies**: React Router DOM 7.13, Vite 7.3, CSS Modules
**Storage**: N/A (no data model changes)
**Testing**: Vitest 4, React Testing Library, axe-core a11y tests
**Target Platform**: Browser SPA (static hosting via Azure Static Web Apps)
**Project Type**: Web (single `frontend/` directory)
**Performance Goals**: Lighthouse Performance >= 90 (no performance regression from layout changes)
**Constraints**: WCAG 2.1 AA, touch targets >= 44x44px, responsive from 320px to 1920px, mobile-first
**Scale/Scope**: 2 pages, 1 shared component, 3 CSS module files modified, 3 test files updated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Assessment |
|-----------|--------|------------|
| I. Accessibility First | PASS | Header restructuring preserves all interactive elements (buttons, language switcher). Semantic `<header>` element will now be used on both pages. ARIA labels maintained. Touch targets unaffected (all already >= 44x44px). Font sizes will be standardized -- need to ensure they remain >= 16px base per constitution. |
| II. Simplicity & Clarity | PASS | Unifying into a single shared header component reduces duplication. No new abstractions introduced -- existing `Header` component is extended rather than creating new layers. |
| III. Responsive Design | PASS | Existing Header already has responsive breakpoints at 320px. The unified header will maintain these breakpoints and be tested at 320px and 1280px per constitution. Mobile-first approach preserved. |
| IV. Static SPA | PASS | No architectural changes. CSS and component restructuring only. Remains a pure client-side SPA. |
| V. Test-First | PASS | Existing tests for Header, WelcomePage, and MainPage will be updated. axe-core a11y tests will confirm the new header structure passes accessibility checks on both pages. |
| Child Safety | PASS | No data collection changes. No PII impact. |
| Performance | PASS | Removing the WelcomePage's absolutely-positioned language area and large title may slightly reduce layout complexity. No additional assets or dependencies. |

**Gate result**: ALL PASS -- no violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```
specs/020-page-header-consistency/
  plan.md              # This file
  research.md          # Phase 0 output
  data-model.md        # Phase 1 output
  quickstart.md        # Phase 1 output
  contracts/           # Phase 1 output
  tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```
frontend/
  src/
    components/
      Header/
        Header.tsx              # MODIFIED: support unauthenticated mode (show title + language switcher only)
        Header.module.css       # MODIFIED: add app title styling, ensure consistent height
    pages/
      WelcomePage.tsx           # MODIFIED: use Header component, move subtitle below, remove inline title/language area
      WelcomePage.module.css    # MODIFIED: remove .title, .languageArea; keep subtitle as content-area style
      MainPage.tsx              # MODIFIED: minor -- verify app title appears in header
      MainPage.module.css       # MODIFIED: remove .readyHeading if unnecessary
  tests/
    components/
      Header.test.tsx           # MODIFIED: add tests for unauthenticated header rendering
    pages/
      WelcomePage.test.tsx      # MODIFIED: update assertions for new header structure
      MainPage.test.tsx         # MODIFIED: verify app title appears in header
```

**Structure Decision**: Single `frontend/` directory (existing). No new files created -- the existing `Header` component is extended to handle both page contexts. Pure refactoring of existing component and page layouts.

## Complexity Tracking

No constitution violations. No complexity justifications needed.

## Post-Design Constitution Re-check

*Re-evaluated after Phase 1 design completion.*

| Principle | Status | Post-Design Assessment |
|-----------|--------|------------------------|
| I. Accessibility First | PASS | Semantic `<header>` element now rendered on both pages (WelcomePage gains it, MainPage retains it). App title at 1.25rem (20px) exceeds 16px minimum. All interactive elements preserved. Touch targets unchanged (>= 44x44px). Language switcher remains keyboard-accessible. The `<h1>` heading semantics move from the WelcomePage header into the content area (subtitle) or remain in MainPage content headings -- no loss of heading structure. |
| II. Simplicity & Clarity | PASS | One component (`Header`) serves both pages via conditional rendering on existing `isActive` state. No new abstractions, hooks, context providers, or wrapper components. CSS changes are subtractive (removing WelcomePage-specific styles) plus one new `.title` class. Net reduction in CSS and JSX code. |
| III. Responsive Design | PASS | Title at `1.25rem` with `flex-shrink: 0` works at 320px. Greeting text already has `text-overflow: ellipsis` for truncation on narrow screens. Existing 320px media query in Header.module.css handles button/text sizing. No new breakpoints needed. Tested mental model: at 320px, `[Multis! cat Hi,Al...]  [lang switch]` fits. |
| IV. Static SPA | PASS | No architectural changes. Pure CSS Module and component refactoring. No new dependencies. Remains deployable to any static host. |
| V. Test-First | PASS | Test updates planned for Header.test.tsx (unauthenticated rendering), WelcomePage.test.tsx (new header structure), MainPage.test.tsx (title in header). axe-core a11y tests will validate the new header on both pages. |
| Child Safety | PASS | No data collection. No PII. No new user interactions. |
| Performance | PASS | Net reduction in rendered DOM (removes absolutely-positioned language area div, removes large centered h1). No new assets. |

**Post-design gate result**: ALL PASS -- design is constitution-compliant.
