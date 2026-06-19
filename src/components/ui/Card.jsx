import './ui.css';

/**
 * Conteneur de surface.
 * @param {string} title       - titre d'entête optionnel
 * @param {string} subtitle    - sous-titre d'entête optionnel
 * @param {React.ReactNode} actions - éléments alignés à droite de l'entête
 * @param {boolean} hover       - effet de survol (cartes cliquables)
 * @param {boolean} pad         - applique un padding interne (sans header/body)
 */
export default function Card({
  title,
  subtitle,
  actions = null,
  hover = false,
  pad = false,
  className = '',
  children,
  ...rest
}) {
  const hasHeader = title || subtitle || actions;
  const classes = [
    'rc-card',
    hover ? 'rc-card--hover' : '',
    !hasHeader && pad ? 'rc-card--pad' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {hasHeader && (
        <div className="rc-card__header">
          <div>
            {title && <h3 className="rc-card__title">{title}</h3>}
            {subtitle && <p className="rc-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="rc-card__actions">{actions}</div>}
        </div>
      )}
      {hasHeader ? <div className="rc-card__body">{children}</div> : children}
    </div>
  );
}
