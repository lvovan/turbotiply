# API Contracts: Page Header Consistency

**Feature**: 020-page-header-consistency | **Date**: 2026-02-17

## Overview

No API contracts. This feature involves no API endpoints, no data transmission, and no service interfaces. It is a pure client-side visual refactoring of existing React components and CSS modules.

## Component Interface Changes

### Header Component

**Current interface**: No props (reads session from `useSession()` hook internally).

**New interface**: No props (unchanged). The component continues to read session state internally and now renders content in both authenticated and unauthenticated states instead of returning `null` when unauthenticated.

**Behavioral change**:
- Before: Returns `null` when `isActive === false`
- After: Returns a full `<header>` element with app title and language switcher when `isActive === false`

No breaking changes to any consumer. Both `WelcomePage` and `MainPage` will render `<Header />` with no props.
