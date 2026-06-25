import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import { Button, Input, Callout } from '../components/ui';

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
    <path d="M5 20a7 7 0 0114 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function Register() {
  const [role, setRole]       = useState('gestionnaire');
  const [form, setForm]       = useState({ nom: '', email: '', mot_de_passe: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function switchRole(r) {
    setRole(r);
    setError('');
    setSuccess('');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (role === 'gestionnaire') {
        await api.post('/api/auth/register', { ...form, role: 'gestionnaire' });
        setSuccess('Compte créé ! Vous pouvez vous connecter.');
        setTimeout(() => navigate('/login'), 2200);
      } else {
        await api.post('/api/auth/register-resident', form);
        const loginRes = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email, mot_de_passe: form.mot_de_passe }),
          }
        );
        const loginData = await loginRes.json();
        if (loginData.token) {
          localStorage.setItem('token', loginData.token);
          localStorage.setItem('user', JSON.stringify(loginData.user));
        }
        navigate('/join-residence');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      tagline="Rejoignez ResiConnect en quelques secondes."
      points={[
        'Créez votre espace gestionnaire ou résident',
        'Invitez et gérez vos visiteurs',
        'Tout votre quotidien résidentiel au même endroit',
      ]}
    >
      <div className="rc-auth__card">
        <div className="rc-auth__head">
          <h2 className="rc-auth__title">Créer un compte</h2>
          <p className="rc-auth__sub">
            {role === 'gestionnaire' ? 'Espace gestionnaire de résidence' : 'Espace résident'}
          </p>
        </div>

        {/* Sélecteur de rôle */}
        <div className="rc-segment" role="tablist" style={{ marginBottom: 22 }}>
          {['gestionnaire', 'resident'].map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              onClick={() => switchRole(r)}
              className={`rc-segment__btn${role === r ? ' rc-segment__btn--active' : ''}`}
            >
              {r === 'gestionnaire' ? 'Gestionnaire' : 'Résident'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 16 }}>
            <Input
              type="text"
              label="Nom complet"
              icon={<UserIcon />}
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
              autoComplete="name"
              placeholder="Votre nom"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Input
              type="email"
              label="Adresse email"
              icon={<MailIcon />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              placeholder="votre@email.com"
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <Input
              type="password"
              label="Mot de passe"
              icon={<LockIcon />}
              value={form.mot_de_passe}
              onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
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
          {success && (
            <div style={{ marginBottom: 20 }}>
              <Callout variant="success">{success}</Callout>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" block loading={loading}>
            {loading
              ? 'Création…'
              : role === 'gestionnaire'
                ? 'Créer le compte gestionnaire'
                : 'Créer le compte résident'}
          </Button>
        </form>

        <p className="rc-auth__alt">
          Déjà un compte ? <a href="/login">Se connecter</a>
        </p>
      </div>
    </AuthLayout>
  );
}
