# Implementation Plan: Responsive Layout & Persistent Keyboard

**Branch**: `009-responsive-layout-focus` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-responsive-layout-focus/spec.md`

## Summary

Fix two usability issues: (1) Replace Vite default CSS that constrains the layout to `max-width: 1280px` left-aligned with a responsive layout that fills the viewport on mobile (≤480px, ≤16px padding) and centers content at `max-width: 540px` on desktop (≥768px). Add global `box-sizing: border-box` reset. Remove all unused Vite scaffold styles and redundant per-page `max-width` declarations. (2) Replace the `disabled` attribute on AnswerInput with a submit-guard approach: the input stays fully interactive at the DOM level (keyboard never dismissed), and the submit handler ignores submissions during the feedback phase. Auto-clear the input value when a new round begins.

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React, React Router DOM 7.13, Vite 7.3.1  
**Storage**: Browser localStorage (no changes needed for this feature)  
**Testing**: Vitest 4.0.18, React Testing Library 16.3.2, vitest-axe 0.1.0  
**Target Platform**: Static SPA — latest 2 versions of Chrome, Firefox, Safari, Edge; school Chromebooks  
**Project Type**: Single frontend SPA (no backend)  
**Performance Goals**: Lighthouse Performance ≥ 90; round-to-round transition under 0.5s  
**Constraints**: WCAG 2.1 AA; no horizontal scrolling on ≥320px viewports; submit-guard approach must keep virtual keyboard visible on iOS Safari, Chrome Android, Firefox Android  
**Scale/Scope**: 2 CSS files modified (App.css, index.css), 1 component modified (AnswerInput), 1 page modified (MainPage), 1 CSS module modified, downstream cleanup of WelcomePage.module.css. No new components.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | ✅ PASS | Submit-guard preserves focus and keyboard accessibility. No color-only indicators affected. ARIA labels on input unchanged. `aria-label="Your answer"` retained. Input is never disabled/readOnly at DOM level. |
| II. Simplicity & Clarity | ✅ PASS | No new abstractions. Removing Vite scaffold CSS simplifies the codebase. `disabled` → submit guard is a minor logic change. YAGNI respected. |
| III. Responsive Design | ✅ PASS | This feature directly implements the Responsive Design principle — full-width mobile, centered desktop, no horizontal scrolling, touch targets maintained. |
| IV. Static SPA | ✅ PASS | No server-side code. All changes within `frontend/src/`. Pure CSS and component prop changes. |
| V. Test-First | ✅ PASS | Tests updated for submit-guard instead of `disabled`. Existing a11y tests for AnswerInput cover the changed behavior. |

**Gate result**: All principles satisfied. No violations.

### Post-Design Re-check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | ✅ PASS | Submit-guard keeps input fully interactive — no `disabled` or `readOnly` at DOM level. Keyboard and focus preserved across round transitions. ARIA `aria-label="Your answer"` unchanged. No color-only indicators affected. Font sizes and contrast unchanged. |
| II. Simplicity & Clarity | ✅ PASS | No new abstractions. Removes dead CSS (Vite scaffold). Submit guard is 2 lines of logic in existing handler. Redundant `max-width` declarations cleaned up. Global `box-sizing` reset is industry standard. |
| III. Responsive Design | ✅ PASS | Directly implements this principle. `#root { max-width: 540px; margin: 0 auto }` provides full-width mobile + centered desktop. No horizontal scrolling on ≥320px. Touch targets unaffected. Mobile-first approach: full width by default, constrained on larger viewports. |
| IV. Static SPA | ✅ PASS | All changes within `frontend/src/`. No server code. No new top-level directories. Pure CSS and component changes. |
| V. Test-First | ✅ PASS | AnswerInput tests updated for submit-guard (no `disabled` in DOM). Existing a11y tests cover input accessibility. No new components = no new a11y tests needed, only updates to existing ones. |

**Post-design gate result**: All principles satisfied. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/009-responsive-layout-focus/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── App.css                       # MODIFIED: remove Vite defaults, responsive #root
│   ├── index.css                     # MODIFIED: fix body layout, add box-sizing reset
│   ├── components/
│   │   └── GamePlay/
│   │       └── AnswerInput/
│   │           ├── AnswerInput.tsx    # MODIFIED: disabled → submit guard, auto-clear
│   │           └── AnswerInput.module.css  # MODIFIED: remove :disabled styles
│   └── pages/
│       ├── MainPage.tsx              # MODIFIED: pass acceptingInput prop
│       └── WelcomePage.module.css    # MODIFIED: remove redundant max-width, min-height
└── tests/
    ├── a11y/
│   │   └── accessibility.test.tsx    # MODIFIED: update disabled → submit-guard assertions
│   └── components/
│       └── AnswerInput.test.tsx      # MODIFIED: test submit-guard behavior, auto-clear, focus
```

**Structure Decision**: Single `frontend/` directory per constitution (Principle IV: Static SPA). No new top-level directories. No new components — changes are limited to existing CSS files and the AnswerInput component.

## Complexity Tracking

> No constitution violations found. No justifications needed.
