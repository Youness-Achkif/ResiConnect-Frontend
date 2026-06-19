import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import './LandingPage.css';

/* ── Icônes inline (style lucide, monochrome) ──────────────────────────────── */
const ic = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const Building2 = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...ic} aria-hidden="true">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
  </svg>
);
const Building = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...ic} aria-hidden="true">
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
  </svg>
);
const UserPlus = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...ic} aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </svg>
);
const QrCode = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...ic} aria-hidden="true">
    <rect width="5" height="5" x="3" y="3" rx="1" />
    <rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1" />
  </svg>
);
const MessageSquare = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...ic} aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const Wallet = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...ic} aria-hidden="true">
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </svg>
);

/* ── Image avec fallback : si le fichier est absent (404), on retire l'<img>
      et on laisse apparaître le fallback (gradient/rien). ──────────────────── */
function SmartImg({ src, alt, className, onMissing = null }) {
  const [failed, setFailed] = useState(false);
  if (failed) return onMissing;
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}

const FEATURES = [
  { icon: Building,       title: 'Gestion multi-résidences',       desc: "Pilotez plusieurs résidences depuis un seul espace : bâtiments, appartements et résidents centralisés." },
  { icon: UserPlus,       title: 'Inscription & demandes d’adhésion', desc: "Les résidents rejoignent leur résidence par code ou recherche ; le gestionnaire valide chaque demande." },
  { icon: QrCode,         title: 'Contrôle d’accès par QR Code',   desc: "Générez des QR codes d’accès pour vos visiteurs, vérifiés à l’entrée par l’agent de sécurité.", image: '/assets/landing/qr-feature.png' },
  { icon: MessageSquare,  title: 'Messagerie intégrée',            desc: "Une messagerie directe entre résidents et gestionnaire pour un suivi clair des échanges." },
  { icon: Wallet,         title: 'Paiements & problèmes',          desc: "Suivez les paiements et signalez les problèmes (avec photo), du signalement à la résolution." },
];

const STEPS = [
  { title: 'Le résident s’inscrit', desc: 'Il crée son compte et rejoint sa résidence par code ou par recherche du nom.' },
  { title: 'Le gestionnaire valide', desc: 'La demande d’adhésion est acceptée depuis le tableau de bord gestionnaire.' },
  { title: 'Tout se gère en ligne', desc: 'Visiteurs, paiements, problèmes et messages : le quotidien résidentiel au même endroit.' },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const visualRef = useRef(null);

  // 1. Apparition au scroll via IntersectionObserver natif
  useEffect(() => {
    const els = document.querySelectorAll('.lp .reveal');
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('visible'));
      return undefined;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // 4. Ombre douce de la navbar selon le scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 3. Tilt 3D léger de l'image hero (suit le curseur)
  const handleTilt = useCallback((e) => {
    const el = visualRef.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 → 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    const max = 7; // degrés max
    el.style.transform = `rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
  }, []);
  const resetTilt = useCallback(() => {
    const el = visualRef.current;
    if (el) el.style.transform = '';
  }, []);

  return (
    <div className="lp">
      {/* ── Navbar ── */}
      <header className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}`}>
        <div className="lp-nav__inner">
          <Link to="/" className="lp-brand">
            <span className="lp-brand__icon">
              <Building2 size={22} />
            </span>
            ResiConnect
          </Link>
          <nav className="lp-nav__links">
            <Link to="/login" className="lp-navlink">Connexion</Link>
            <Button size="sm" onClick={() => navigate('/register')}>S’inscrire</Button>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="lp-container lp-section lp-hero">
        <div className="lp-hero__text">
          <h1 className="lp-hero__title">La gestion de résidence, <em>simplifiée</em>.</h1>
          <p className="lp-hero__sub">
            ResiConnect réunit la gestion multi-résidences, le contrôle d’accès par
            QR code et la communication résident-gestionnaire dans une seule plateforme,
            claire et sécurisée.
          </p>
          <div className="lp-hero__cta">
            <Button size="lg" onClick={() => navigate('/register')}>Commencer</Button>
            <Button size="lg" variant="ghost" onClick={() => navigate('/login')}>Se connecter</Button>
          </div>
        </div>
        <div className="lp-hero__visual" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
          <div className="lp-visual" ref={visualRef}>
            <div className="lp-visual__fallback"><Building2 size={76} /></div>
            <SmartImg
              src="/assets/landing/hero.png"
              alt="Résidence gérée avec ResiConnect"
              className="lp-visual__img"
            />
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ── */}
      <section className="lp-container lp-section reveal" id="fonctionnalites">
        <div className="lp-sec-head">
          <span className="lp-eyebrow">Fonctionnalités</span>
          <h2 className="lp-h2">Tout ce qu’il faut pour gérer une résidence</h2>
          <p>Des outils pensés pour les gestionnaires comme pour les résidents.</p>
        </div>
        <div className="lp-features">
          {FEATURES.map(({ icon: Icon, title, desc, image }) => (
            <Card key={title} pad hover>
              <div className="lp-feat">
                <span className="lp-feat__icon"><Icon size={24} /></span>
                <h3 className="lp-feat__title">{title}</h3>
                <p className="lp-feat__desc">{desc}</p>
                {image && (
                  <SmartImg src={image} alt={title} className="lp-feat__img" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="lp-container lp-section reveal" id="comment">
        <div className="lp-sec-head">
          <span className="lp-eyebrow">Comment ça marche</span>
          <h2 className="lp-h2">Trois étapes, c’est tout</h2>
        </div>
        <div className="lp-steps-wrap">
          <SmartImg src="/assets/landing/lobby.png" alt="" className="lp-steps-bg" />
          <div className="lp-steps-overlay" />
          <div className="lp-steps">
            {STEPS.map((step, i) => (
              <div className="lp-step" key={step.title}>
                <div className="lp-step__num">{i + 1}</div>
                <h3 className="lp-step__title">{step.title}</h3>
                <p className="lp-step__desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA finale ── */}
      <section className="lp-container lp-section reveal" style={{ paddingTop: 8 }}>
        <div className="lp-cta">
          <h2 className="lp-cta__title">Prêt à simplifier votre résidence ?</h2>
          <p className="lp-cta__sub">Créez votre espace en quelques minutes, sans engagement.</p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
            Créer un compte gratuitement
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <span className="lp-copy">© {new Date().getFullYear()} ResiConnect — Tous droits réservés</span>
          <nav className="lp-footer__links">
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
            <Link to="/scan">Scanner QR</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
