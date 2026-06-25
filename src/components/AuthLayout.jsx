import './AuthLayout.css';

/* Icône de marque (immeuble) */
const HomeIcon = ({ size = 24, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="9,22 9,12 15,12 15,22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <polyline points="5,13 10,18 19,7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Logo + nom de marque. tone: 'light' (sur fond teal) | 'dark' (sur fond clair) */
export function BrandMark({ tone = 'light', name = 'ResiConnect' }) {
  return (
    <span className={`rc-brandmark rc-brandmark--${tone}`}>
      <span className="rc-brandmark__icon">
        <HomeIcon size={24} color="#fff" />
      </span>
      <span className="rc-brandmark__name">{name}</span>
    </span>
  );
}

const DEFAULT_TAGLINE = 'La gestion de résidence, simple et sereine.';
const DEFAULT_POINTS = [
  'Visiteurs et accès maîtrisés',
  'QR codes sécurisés en un geste',
  'Demandes traitées en temps réel',
];

/**
 * Gabarit des pages d'auth : panneau de marque (desktop) + zone formulaire.
 * @param {string} tagline       - accroche du panneau de marque
 * @param {string[]} points      - arguments de réassurance
 * @param {React.ReactNode} children - contenu de la carte (formulaire)
 */
export default function AuthLayout({
  tagline = DEFAULT_TAGLINE,
  points = DEFAULT_POINTS,
  children,
}) {
  return (
    <div className="rc-auth">
      <aside className="rc-auth__brand">
        <BrandMark tone="light" />
        <div>
          <h1 className="rc-auth__tagline">{tagline}</h1>
          <ul className="rc-auth__points">
            {points.map((p) => (
              <li className="rc-auth__point" key={p}>
                <span className="rc-auth__point-ic"><CheckIcon /></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="rc-auth__copy">
          © {new Date().getFullYear()} ResiConnect — Tous droits réservés
        </p>
      </aside>

      <main className="rc-auth__main">
        <div className="rc-auth__inner">
          <div className="rc-auth__mobilelogo">
            <BrandMark tone="dark" />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
