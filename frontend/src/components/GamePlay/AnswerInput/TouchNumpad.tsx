import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './TouchNumpad.module.css';

interface TouchNumpadProps {
  onSubmit: (answer: number) => void;
  acceptingInput: boolean;
}

const DIGIT_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

const MAX_DIGITS = 3;

/**
 * Custom in-page numpad for touch devices.
 *
 * Renders a 4×3 calculator-style grid (1-2-3 / 4-5-6 / 7-8-9 / 0-⌫-Go)
 * plus a read-only answer display. Digits are composed by tapping buttons,
 * "Go" submits, "⌫" deletes the last digit.
 *
 * Physical keyboard input (0–9, Enter, Backspace) is captured via a
 * document-level keydown listener and mirrors button behavior identically.
 *
 * The answer display is a non-focusable <div> — impossible to trigger the
 * OS keyboard.
 */
export default function TouchNumpad({ onSubmit, acceptingInput }: TouchNumpadProps) {
  const [answer, setAnswer] = useState('');
  const submittedRef = useRef(false);

  // Reset state when a new round begins (acceptingInput transitions to true)
  useEffect(() => {
    if (acceptingInput) {
      setAnswer('');
      submittedRef.current = false;
    }
  }, [acceptingInput]);

  const appendDigit = useCallback(
    (digit: string) => {
      if (!acceptingInput) return;
      setAnswer((prev) => {
        if (prev.length >= MAX_DIGITS) return prev;
        if (prev === '' && digit === '0') return prev; // no leading zeros
        return prev + digit;
      });
    },
    [acceptingInput]
  );

  const deleteLastDigit = useCallback(() => {
    if (!acceptingInput) return;
    setAnswer((prev) => prev.slice(0, -1));
  }, [acceptingInput]);

  const submitAnswer = useCallback(() => {
    if (!acceptingInput) return;
    if (submittedRef.current) return;

    setAnswer((prev) => {
      if (prev.length === 0) return prev;
      submittedRef.current = true;
      onSubmit(parseInt(prev, 10));
      return '';
    });
  }, [acceptingInput, onSubmit]);

  // Document-level keydown listener for physical keyboard support
  useEffect(() => {
    if (!acceptingInput) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        appendDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLastDigit();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submitAnswer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [acceptingInput, appendDigit, deleteLastDigit, submitAnswer]);

  const isEmpty = answer === '';

  return (
    <div className={styles.container}>
      {/* Answer display — non-focusable div, styled like existing input */}
      <div
        className={styles.display}
        role="status"
        aria-live="polite"
        aria-label="Current answer"
      >
        {isEmpty ? <span className={styles.placeholder}>?</span> : answer}
      </div>

      {/* Numpad grid */}
      <div className={styles.grid}>
        {/* Rows 1-3: digits 1-9 */}
        {DIGIT_ROWS.map((row) =>
          row.map((digit) => (
            <button
              key={digit}
              type="button"
              className={styles.button}
              aria-label={`digit ${digit}`}
              disabled={!acceptingInput}
              onClick={() => appendDigit(digit)}
            >
              {digit}
            </button>
          ))
        )}

        {/* Row 4: 0, ⌫, Go */}
        <button
          type="button"
          className={styles.button}
          aria-label="digit 0"
          disabled={!acceptingInput}
          onClick={() => appendDigit('0')}
        >
          0
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.backspace}`}
          aria-label="delete last digit"
          disabled={!acceptingInput}
          onClick={deleteLastDigit}
        >
          ⌫
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.go}`}
          aria-label="submit answer"
          disabled={!acceptingInput || isEmpty}
          onClick={submitAnswer}
        >
          Go
        </button>
      </div>
    </div>
  );
}
