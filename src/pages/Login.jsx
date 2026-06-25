import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AuthLayout from '../components/AuthLayout';
import { Button, Input, Callout } from '../components/ui';

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

export default function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, mot_de_passe: motDePasse });
      login(data.user, data.token);
      if (data.user.role === 'gestionnaire') {
        navigate('/dashboard/gestionnaire');
      } else {
        try {
          const { data: me } = await api.get('/api/auth/me');
          localStorage.setItem('user', JSON.stringify(me));
          navigate(me.residence_id != null ? '/dashboard/resident' : '/join-residence');
        } catch {
          navigate(!data.user.residence_id ? '/join-residence' : '/dashboard/resident');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="rc-auth__card">
        <div className="rc-auth__head">
          <h2 className="rc-auth__title">Bon retour</h2>
          <p className="rc-auth__sub">Connectez-vous à votre espace ResiConnect</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 18 }}>
            <Input
              type="email"
              label="Adresse email"
              icon={<MailIcon />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ marginBottom: 20 }}>
              <Callout variant="error">{error}</Callout>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" block loading={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>

        <p className="rc-auth__alt">
          Pas encore de compte ? <a href="/register">S'inscrire</a>
        </p>
        <p className="rc-auth__alt rc-auth__alt--sub">
          Agent de sécurité ? <Link to="/scan">Accéder au scanner QR</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
