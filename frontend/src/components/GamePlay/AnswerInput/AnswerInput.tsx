import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import styles from './AnswerInput.module.css';
import { useTouchDetection } from '../../../hooks/useTouchDetection';
import { useTranslation } from '../../../i18n';
import TouchNumpad from './TouchNumpad';

interface AnswerInputProps {
  onSubmit: (answer: number) => void;
  acceptingInput: boolean;
}

/**
 * Numeric input field + submit button for answering a round.
 * Accepts digits only (FR-017), strips leading zeros, disables submit when empty.
 *
 * The input is never disabled/readOnly at the DOM level so that the virtual
 * keyboard stays visible on touch devices between rounds. A submit-guard
 * prevents submissions during the feedback phase.
 *
 * We deliberately avoid wrapping this in a <form> element. On iOS Safari,
 * pressing the "Go" key on the virtual keyboard fires the form's submit event
 * and iOS dismisses the keyboard — even when e.preventDefault() is called.
 * Since the next round starts from a setTimeout (not a user gesture),
 * programmatic focus() cannot re-summon the keyboard. By using a plain <div>
 * and handling Enter via onKeyDown, no form-level submission occurs and iOS
 * has no reason to dismiss the keyboard.
 *
 * The submit button uses onPointerDown preventDefault to keep focus on the
 * input when tapped, and its onClick explicitly re-focuses the input as a
 * safety net — this call IS within a user gesture so mobile browsers honour it.
 *
 * Auto-clears the input value when acceptingInput transitions to true
 * (new round begins).
 */
export default function AnswerInput({ onSubmit, acceptingInput }: AnswerInputProps) {
  const isTouchDevice = useTouchDetection();

  if (isTouchDevice) {
    return <TouchNumpad onSubmit={onSubmit} acceptingInput={acceptingInput} />;
  }

  return <AnswerInputDesktop onSubmit={onSubmit} acceptingInput={acceptingInput} />;
}

/** Standard text input + Submit button for non-touch (desktop) devices. */
function AnswerInputDesktop({ onSubmit, acceptingInput }: AnswerInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  // Re-focus input when it becomes accepting (e.g. after feedback phase)
  useEffect(() => {
    if (acceptingInput) {
      inputRef.current?.focus();
    }
  }, [acceptingInput]);

  // Auto-clear input when a new round begins
  useEffect(() => {
    if (acceptingInput) {
      setValue('');
    }
  }, [acceptingInput]);

  const submitValue = () => {
    if (!acceptingInput) return;
    if (value.trim() === '') return;

    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      onSubmit(parsed);
      setValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitValue();
    }
  };

  const handleButtonClick = () => {
    submitValue();
    // Re-focus input to keep virtual keyboard visible on touch devices.
    // This focus() call is within a click event handler (user gesture),
    // so mobile browsers will honour it and show/keep the keyboard.
    inputRef.current?.focus();
  };

  const handleChange = (inputValue: string) => {
    // Accept only digits
    const digitsOnly = inputValue.replace(/[^0-9]/g, '');
    setValue(digitsOnly);
  };

  const isEmpty = value.trim() === '';

  return (
    <div className={styles.form}>
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('game.answerPlaceholder')}
        aria-label={t('a11y.yourAnswer')}
        autoFocus
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="go"
      />
      <button
        type="button"
        className={styles.submitButton}
        disabled={!acceptingInput || isEmpty}
        aria-label={t('a11y.submitAnswer')}
        onPointerDown={(e) => e.preventDefault()}
        onClick={handleButtonClick}
      >
        {t('game.submit')}
      </button>
    </div>
  );
}
