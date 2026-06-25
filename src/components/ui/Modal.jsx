import { useEffect } from 'react';
import './ui.css';

/**
 * Fenêtre modale accessible.
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {string} title
 * @param {string} subtitle
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} closeOnOverlay - fermer en cliquant sur le fond (def. true)
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  closeOnOverlay = true,
  className = '',
  children,
}) {
  // Fermeture via Échap + verrouillage du scroll de la page
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = size === 'sm' ? 'rc-modal--sm' : size === 'lg' ? 'rc-modal--lg' : '';
  const classes = ['rc-modal', sizeClass, className].filter(Boolean).join(' ');
  const hasHeader = title || subtitle;

  return (
    <div
      className="rc-modal-overlay"
      onMouseDown={(e) => {
        if (closeOnOverlay && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={classes}
        role="dialog"
        aria-modal="true"
        aria-label={title || undefined}
      >
        {(hasHeader || onClose) && (
          <div className="rc-modal__header">
            <div>
              {title && <h2 className="rc-modal__title">{title}</h2>}
              {subtitle && <p className="rc-modal__subtitle">{subtitle}</p>}
            </div>
            {onClose && (
              <button
                type="button"
                className="rc-modal__close"
                onClick={onClose}
                aria-label="Fermer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="rc-modal__body">{children}</div>
      </div>
    </div>
  );
}
