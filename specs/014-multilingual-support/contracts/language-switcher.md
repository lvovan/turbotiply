# Component Contract: LanguageSwitcher

**Feature**: 014-multilingual-support  
**Date**: 2026-02-16  
**Type**: React Component (new)

## Interface

```typescript
// No props — reads language state from LanguageContext via useTranslation()
interface LanguageSwitcherProps {
  // Empty — all state comes from context
}
```

**Return**: `JSX.Element` — always renders (flag button + conditional dropdown)

## Behavior Contract

### Rendering

The component renders a flag button that, when activated, shows a dropdown menu of all five supported languages.

```
<div>                                          ← positioning wrapper
  <button                                      ← flag button
    aria-expanded="{isOpen}"
    aria-haspopup="true"
    aria-label="{t('header.changeLanguage')}"  ← translated label
  >
    {currentFlag}                              ← flag emoji for active language
  </button>

  {isOpen &&
    <ul role="menu">                           ← dropdown menu
      {for each language in SUPPORTED_LANGUAGES}
        <li role="menuitem"
            tabIndex="-1"
            aria-current="{lang === currentLang ? 'true' : undefined}"
        >
          {flag} {nativeName}                  ← e.g., "🇫🇷 Français"
        </li>
    </ul>
  }
</div>
```

### State Management

| State | Type | Initial | Description |
|-------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Whether the dropdown menu is visible |
| `focusedIndex` | `number` | `-1` | Index of the currently focused menu item |

### Interaction Contract

| Input | Precondition | Action | Outcome |
|-------|-------------|--------|---------|
| Click on flag button | Menu closed | Toggle open | Menu opens, focus moves to first item |
| Click on flag button | Menu open | Toggle closed | Menu closes, focus returns to button |
| Enter/Space on flag button | Menu closed | Open menu | Menu opens, focus moves to first item |
| Enter/Space on flag button | Menu open | Close menu | Menu closes, focus returns to button |
| Click on menu item | Menu open | Select language | Language changes, menu closes, focus returns to button |
| Enter/Space on menu item | Menu open, item focused | Select language | Language changes, menu closes, focus returns to button |
| ArrowDown | Menu open | Move focus down | Focus next item (wrap to first from last) |
| ArrowUp | Menu open | Move focus up | Focus previous item (wrap to last from first) |
| Home | Menu open | Focus first item | Focus moves to first menu item |
| End | Menu open | Focus last item | Focus moves to last menu item |
| Escape | Menu open | Close menu | Menu closes, focus returns to button |
| Click outside | Menu open | Close menu | Menu closes |
| Tab / focus leaves | Menu open | Close menu | Menu closes |

### Side Effects

On language selection:
1. `setLanguage(selectedLanguageCode)` — updates React context
2. Context internals: stores to `localStorage` (`turbotiply_lang`) and updates `document.documentElement.lang`

### Accessibility

- Button: `aria-expanded`, `aria-haspopup="true"`, `aria-label` (translated)
- Menu: `role="menu"` with `role="menuitem"` items
- Active language marked with `aria-current="true"`
- Focus management: trapped within menu when open, returned to button on close
- Touch targets: button and menu items ≥ 44×44 CSS pixels (Constitution III, WCAG 2.5.5)

## CSS Module Contract

### Classes

| Class | Purpose |
|-------|---------|
| `.wrapper` | Positioning container (`position: relative`) |
| `.flagButton` | Flag button styling (44×44 min, no border, cursor pointer) |
| `.menu` | Dropdown menu (positioned absolute, below button, z-index above content) |
| `.menuItem` | Menu item (44px min height, flex row, gap for flag + text) |
| `.menuItemActive` | Highlight for currently selected language |
| `.menuItemFocused` | Keyboard focus indicator |

### Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| ≤ 320px | Menu positioned to avoid right-edge clipping; may shift left |
| 321–540px | Menu positioned directly below button, right-aligned |
| > 540px | Same as 321px (app max-width is 540px) |

## Usage

```tsx
// In Header.tsx (logged-in state):
<header>
  <div className={styles.playerInfo}>
    <span className={styles.avatar}>{emoji}</span>
    <span className={styles.greeting}>{t('header.greeting', { playerName })}</span>
  </div>
  <div className={styles.actions}>
    <LanguageSwitcher />
    <button className={styles.switchButton} onClick={handleSwitch}>
      {t('header.switchPlayer')}
    </button>
  </div>
</header>

// On WelcomePage.tsx (not logged in):
<div className={styles.languageArea}>
  <LanguageSwitcher />
</div>
```
