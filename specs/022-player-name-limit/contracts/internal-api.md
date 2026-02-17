# Internal API Contract: Player Name Limit

**Feature**: 022-player-name-limit  
**Date**: 2025-07-15  

## Overview

This feature has no external API — the application is a static SPA with no backend. All contracts are internal component interfaces.

## Component Contracts

### NewPlayerForm Props (unchanged)

```typescript
interface NewPlayerFormProps {
  onSubmit: (data: Pick<Player, 'name' | 'avatarId'>) => void;
  playerExists: (name: string) => boolean;
}
```

No changes to the prop interface. The component internally enforces the new 10-character limit.

### Constants

```typescript
// Before
const MAX_NAME_LENGTH = 20;

// After
const MAX_NAME_LENGTH = 10;
```

### New i18n Keys

| Key | en | fr | de | ja | pt |
|-----|----|----|----|----|-----|
| `player.charCount` | `{current}/{max}` | `{current}/{max}` | `{current}/{max}` | `{current}/{max}` | `{current}/{max}` |

The `{current}/{max}` format is locale-neutral (numeric with separator). All 5 locales use the same value.

### New CSS Classes

| Class | Purpose |
|-------|---------|
| `.charCounter` | Base style for character counter text (0.875rem, #666, right-aligned) |
| `.charCounterWarning` | Applied when `name.length >= MAX_NAME_LENGTH` (orange #E65100) |

### Accessibility Contract

| Attribute | Value | Element |
|-----------|-------|---------|
| `aria-live` | `"polite"` | Character counter `<span>` |

Screen readers will announce character count changes non-intrusively, consistent with the existing `TouchNumpad` pattern.
