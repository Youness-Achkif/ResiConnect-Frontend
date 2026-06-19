import { useId } from 'react';
import './ui.css';

/**
 * Champ de saisie avec label, icône, erreur et indice optionnels.
 * Transmet toutes les props natives <input> (value, onChange, type, required...).
 * @param {string} label
 * @param {string} error    - message d'erreur (active le style erreur)
 * @param {string} hint     - texte d'aide sous le champ
 * @param {React.ReactNode} icon - icône à gauche
 */
export default function Input({
  label,
  error,
  hint,
  icon = null,
  id,
  className = '',
  required,
  ...rest
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const inputClasses = [
    'rc-input',
    error ? 'rc-input--error' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="rc-field">
      {label && (
        <label className="rc-field__label" htmlFor={inputId}>
          {label}
          {required && <span className="rc-field__req" aria-hidden="true">*</span>}
        </label>
      )}
      <div className={`rc-input-wrap${icon ? ' rc-input-wrap--icon' : ''}`}>
        {icon && <span className="rc-input-wrap__icon" aria-hidden="true">{icon}</span>}
        <input
          id={inputId}
          className={inputClasses}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...rest}
        />
      </div>
      {error && (
        <p className="rc-field__error" id={errorId}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1" fill="currentColor" />
          </svg>
          {error}
        </p>
      )}
      {!error && hint && <p className="rc-field__hint" id={hintId}>{hint}</p>}
    </div>
  );
}
