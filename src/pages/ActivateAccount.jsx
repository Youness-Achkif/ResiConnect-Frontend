import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import { Button, Input, Callout } from '../components/ui';

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* Bloc de statut centré (icône + titre + texte) */
function StatusBlock({ tone, icon, title, text }) {
  const palette = {
    success: { bg: 'var(--rc-success-bg)', fg: 'var(--rc-success-text)', ring: '#bbf7d0' },
    error: { bg: 'var(--rc-error-bg)', fg: 'var(--rc-error-text)', ring: '#fecaca' },
    neutral: { bg: 'var(--rc-surface-2)', fg: 'var(--rc-text-muted)', ring: 'var(--rc-border)' },
  }[tone];
  return (
    <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
        background: palette.bg, color: palette.fg, border: `1px solid ${palette.ring}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <h2 className="rc-auth__title" style={{ fontSize: 20 }}>{title}</h2>
      {text && <p className="rc-auth__sub">{text}</p>}
    </div>
  );
}

export default function ActivateAccount() {
  const { token }                       = useParams();
  const navigate                        = useNavigate();
  const [status, setStatus]             = useState('loading');
  const [form, setForm]                 = useState({ mot_de_passe: '', confirmer_mot_de_passe: '' });
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    api.get(`/api/auth/activate/${token}`)
      .then(({ data }) => setStatus(data.valid ? 'valid' : 'invalid'))
      .catch(() => setStatus('invalid'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.mot_de_passe !== form.confirmer_mot_de_passe) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/set-password', { token, mot_de_passe: form.mot_de_passe });
      setStatus('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'activation.');
    } finally {
      setLoading(false);
    }
  };

  let content;

  if (status === 'loading') {
    content = (
      <StatusBlock
        tone="neutral"
        title="Vérification du lien…"
        text="Merci de patienter un instant."
        icon={
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ animation: 'rc-spin 0.8s linear infinite' }} aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
            <path d="M12 3a9 9 0 019 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        }
      />
    );
  } else if (status === 'invalid') {
    content = (
      <>
        <StatusBlock
          tone="error"
          title="Lien invalide ou expiré"
          text="Ce lien d'activation n'est plus valide."
          icon={
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17" r="1.1" fill="currentColor" />
            </svg>
          }
        />
        <Button variant="primary" size="lg" block as="a" href="/login">
          Retour à la connexion
        </Button>
      </>
    );
  } else if (status === 'done') {
    content = (
      <>
        <StatusBlock
          tone="success"
          title="Compte activé !"
          text="Votre compte est maintenant actif."
          icon={
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <polyline points="8,12 11,15 16,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <Button variant="primary" size="lg" block onClick={() => navigate('/login')}>
          Se connecter
        </Button>
      </>
    );
  } else {
    /* status === 'valid' — formulaire mot de passe */
    content = (
      <>
        <div className="rc-auth__head">
          <h2 className="rc-auth__title">Définir votre mot de passe</h2>
          <p className="rc-auth__sub">Choisissez un mot de passe pour activer votre compte</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 16 }}>
            <Input
              type="password"
              label="Mot de passe"
              icon={<LockIcon />}
              value={form.mot_de_passe}
              onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              hint="8 caractères minimum."
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <Input
              type="password"
              label="Confirmer le mot de passe"
              icon={<LockIcon />}
              value={form.confirmer_mot_de_passe}
              onChange={(e) => setForm({ ...form, confirmer_mot_de_passe: e.target.value })}
              required
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ marginBottom: 20 }}>
              <Callout variant="error">{error}</Callout>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" block loading={loading}>
            {loading ? 'Activation…' : 'Activer mon compte'}
          </Button>
        </form>
      </>
    );
  }

  return (
    <AuthLayout
      tagline="Activez votre compte en toute sérénité."
      points={[
        'Un lien sécurisé et personnel',
        'Définissez votre mot de passe',
        'Accédez à votre espace immédiatement',
      ]}
    >
      <div className="rc-auth__card">{content}</div>
    </AuthLayout>
  );
}
