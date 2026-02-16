import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n';
import type { Language } from '../../types/i18n';
import styles from './LanguageSwitcher.module.css';

/**
 * Language switcher with WAI-ARIA Menu Button pattern.
 *
 * Renders a flag button that toggles a dropdown listing all supported languages.
 * Fully keyboard-navigable (ArrowUp/Down, Home, End, Escape, Enter/Space).
 * Click-outside and focus-leave close the menu.
 */
export default function LanguageSwitcher() {
  const { language, t, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);
  const currentFlag = currentLang?.flag ?? '🇬🇧';

  // Focus the targeted menu item when focusedIndex changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [isOpen, focusedIndex]);

  // Click-outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus-leave handler — close menu when focus moves outside
  useEffect(() => {
    if (!isOpen) return;

    const handleFocusOut = (e: FocusEvent) => {
      const relatedTarget = e.relatedTarget as Node | null;
      if (
        relatedTarget &&
        !buttonRef.current?.contains(relatedTarget) &&
        !menuRef.current?.contains(relatedTarget)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    const wrapper = buttonRef.current?.parentElement;
    wrapper?.addEventListener('focusout', handleFocusOut);
    return () => wrapper?.removeEventListener('focusout', handleFocusOut);
  }, [isOpen]);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    setFocusedIndex(0);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  }, []);

  const selectLanguage = useCallback(
    (code: Language) => {
      setLanguage(code);
      closeMenu();
    },
    [setLanguage, closeMenu],
  );

  const handleButtonClick = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handleButtonKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        openMenu();
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(SUPPORTED_LANGUAGES.length - 1);
        break;
    }
  };

  const handleMenuKeyDown = (e: KeyboardEvent) => {
    const lastIndex = SUPPORTED_LANGUAGES.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev >= lastIndex ? 0 : prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev <= 0 ? lastIndex : prev - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(lastIndex);
        break;
      case 'Escape':
        e.preventDefault();
        closeMenu();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          selectLanguage(SUPPORTED_LANGUAGES[focusedIndex].code);
        }
        break;
      case 'Tab':
        // Let Tab close the menu naturally via focusout
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        ref={buttonRef}
        className={styles.flagButton}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('header.changeLanguage')}
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyDown}
      >
        {currentFlag}
      </button>

      {isOpen && (
        <ul
          ref={menuRef}
          role="menu"
          className={styles.menu}
          onKeyDown={handleMenuKeyDown}
        >
          {SUPPORTED_LANGUAGES.map((lang, index) => (
            <li
              key={lang.code}
              ref={(el) => { itemRefs.current[index] = el; }}
              role="menuitem"
              tabIndex={-1}
              aria-current={lang.code === language ? 'true' : undefined}
              className={`${styles.menuItem} ${lang.code === language ? styles.menuItemActive : ''} ${index === focusedIndex ? styles.menuItemFocused : ''}`}
              onClick={() => selectLanguage(lang.code)}
            >
              <span aria-hidden="true">{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
