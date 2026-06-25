import './ui.css';

/**
 * Étiquette de statut.
 * @param {'neutral'|'primary'|'success'|'warning'|'danger'|'info'} variant
 * @param {boolean} dot - affiche une pastille colorée à gauche
 */
export default function Badge({
  variant = 'neutral',
  dot = false,
  className = '',
  children,
  ...rest
}) {
  const classes = ['rc-badge', `rc-badge--${variant}`, className]
    .filter(Boolean).join(' ');

  return (
    <span className={classes} {...rest}>
      {dot && <span className="rc-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
