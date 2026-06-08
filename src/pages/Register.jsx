import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm]                 = useState({ nom: '', email: '', mot_de_passe: '' });
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [btnHover, setBtnHover]         = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/api/auth/register', { ...form, role: 'gestionnaire' });
      setSuccess('Compte créé ! Vous pouvez vous connecter.');
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '13px 16px',
    background: focusedField === field ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
    border: focusedField === field ? '1.5px solid #6366f1' : '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    fontSize: 14,
    color: '#e2e8f0',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
    fontFamily: 'inherit',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 50%, #0f1117 100%)',
      padding: 16,
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 20, padding: '40px 36px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxSizing: 'border-box', position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', marginBottom: 16,
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
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(148,163,184,0.8)', fontWeight: 400 }}>
            Créer un compte gestionnaire
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'rgba(203,213,225,0.9)', letterSpacing: '0.2px' }}>
              Nom complet
            </label>
            <input
              type="text"
              value={form.nom}
              onChange={e => setForm({ ...form, nom: e.target.value })}
              onFocus={() => setFocusedField('nom')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="Votre nom"
              style={inputStyle('nom')}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'rgba(203,213,225,0.9)', letterSpacing: '0.2px' }}>
              Adresse email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="votre@email.com"
              style={inputStyle('email')}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
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
              placeholder="••••••••"
              style={inputStyle('password')}
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

          {success && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/>
                <polyline points="9,12 11,14 15,10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ margin: 0, color: '#4ade80', fontSize: 13 }}>{success}</p>
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
            {loading ? 'Création...' : 'Créer le compte'}
          </button>
        </form>

        <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: 13, color: 'rgba(100,116,139,0.9)' }}>
          Déjà un compte ?{' '}
          <a href="/login" style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 500 }}>
            Se connecter
          </a>
        </p>

        <p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: 12, color: 'rgba(100,116,139,0.5)' }}>
          © {new Date().getFullYear()} ResiConnect — Tous droits réservés
        </p>
      </div>

      <style>{`input::placeholder { color: rgba(100,116,139,0.7); }`}</style>
    </div>
  );
}
