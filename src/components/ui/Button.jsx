import './ui.css';

/**
 * Bouton réutilisable.
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} block      - pleine largeur
 * @param {boolean} loading    - affiche un spinner et désactive
 * @param {React.ReactNode} leftIcon / rightIcon
 * @param {'button'|'a'} as    - rendre comme <a> (ex: liens)
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  as = 'button',
  className = '',
  children,
  disabled,
  ...rest
}) {
  const classes = [
    'rc-btn',
    `rc-btn--${variant}`,
    `rc-btn--${size}`,
    block ? 'rc-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');

  const Tag = as;
  const isDisabled = disabled || loading;

  return (
    <Tag
      className={classes}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-disabled={Tag !== 'button' ? isDisabled : undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="rc-btn__spinner" aria-hidden="true" />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </Tag>
  );
}
