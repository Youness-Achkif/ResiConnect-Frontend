import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Logo = () => (
  <div style={{ textAlign: 'center', marginBottom: 28 }}>
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 56, height: 56, borderRadius: 16,
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', marginBottom: 14,
      boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9,22 9,12 15,12 15,22" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
      ResiConnect
    </h1>
  </div>
);

const pageWrap = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 50%, #0f1117 100%)',
  padding: 16, boxSizing: 'border-box',
  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  position: 'relative', overflow: 'hidden',
};

const card = {
  width: '100%', maxWidth: 420,
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  borderRadius: 20, padding: '40px 36px',
  boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxSizing: 'border-box', position: 'relative', zIndex: 1, textAlign: 'center',
};

export default function ActivateAccount() {
  const { token }                       = useParams();
  const navigate                        = useNavigate();
  const [status, setStatus]             = useState('loading');
  const [form, setForm]                 = useState({ mot_de_passe: '', confirmer_mot_de_passe: '' });
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [btnHover, setBtnHover]         = useState(false);

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

  const inputStyle = (field) => ({
    width: '100%', padding: '13px 16px',
    background: focusedField === field ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
    border: focusedField === field ? '1.5px solid #6366f1' : '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10, fontSize: 14, color: '#e2e8f0', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s, background 0.2s', fontFamily: 'inherit',
  });

  const blobs = (
    <>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
    </>
  );

  if (status === 'loading') {
    return (
      <div style={pageWrap}>
        {blobs}
        <div style={card}>
          <Logo />
          <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>Vérification du lien…</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div style={pageWrap}>
        {blobs}
        <div style={card}>
          <Logo />
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '20px 16px', marginBottom: 24,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ display: 'block', margin: '0 auto 10px' }}>
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p style={{ margin: 0, color: '#fca5a5', fontSize: 15, fontWeight: 500 }}>Lien invalide ou expiré</p>
            <p style={{ margin: '8px 0 0', color: 'rgba(252,165,165,0.7)', fontSize: 13 }}>
              Ce lien d'activation n'est plus valide.
            </p>
          </div>
          <a href="/login" style={{
            display: 'inline-block', padding: '12px 28px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
            borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600,
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
          }}>
            Retour à la connexion
          </a>
        </div>
        <style>{`input::placeholder { color: rgba(100,116,139,0.7); }`}</style>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div style={pageWrap}>
        {blobs}
        <div style={card}>
          <Logo />
          <div style={{
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 12, padding: '20px 16px', marginBottom: 24,
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ display: 'block', margin: '0 auto 10px' }}>
              <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/>
              <polyline points="9,12 11,14 15,10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p style={{ margin: 0, color: '#4ade80', fontSize: 15, fontWeight: 500 }}>Compte activé !</p>
            <p style={{ margin: '8px 0 0', color: 'rgba(74,222,128,0.7)', fontSize: 13 }}>
              Votre compte est maintenant actif.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  /* status === 'valid' — formulaire mot de passe */
  return (
    <div style={pageWrap}>
      {blobs}
      <div style={{ ...card, textAlign: 'left' }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Logo />
          <p style={{ margin: '-16px 0 24px', fontSize: 13, color: 'rgba(148,163,184,0.8)' }}>
            Définir votre mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'rgba(203,213,225,0.9)', letterSpacing: '0.2px' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={form.mot_de_passe}
              onChange={e => setForm({ ...form, mot_de_passe: e.target.value })}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
              minLength={8}
              placeholder="••••••••"
              style={inputStyle('password')}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'rgba(203,213,225,0.9)', letterSpacing: '0.2px' }}>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={form.confirmer_mot_de_passe}
              onChange={e => setForm({ ...form, confirmer_mot_de_passe: e.target.value })}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="••••••••"
              style={inputStyle('confirm')}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ margin: 0, color: '#fca5a5', fontSize: 13 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              width: '100%', padding: '14px', minHeight: 48,
              background: loading
                ? 'rgba(99,102,241,0.5)'
                : btnHover
                  ? 'linear-gradient(135deg, #5254cc, #7c3aed)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: '0.3px',
              boxShadow: loading || btnHover ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
              transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
              transform: btnHover && !loading ? 'translateY(-1px)' : 'none',
            }}
          >
            {loading ? 'Activation...' : 'Activer mon compte'}
          </button>
        </form>
      </div>
      <style>{`input::placeholder { color: rgba(100,116,139,0.7); }`}</style>
    </div>
  );
}
