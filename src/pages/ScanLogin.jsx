import React, { useState, useEffect } from 'react';
import ScanCamera from '../components/ScanCamera';

export default function ScanLogin() {
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [btnHover, setBtnHover] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const rid = sessionStorage.getItem('scan_residence_id');
    const rnom = sessionStorage.getItem('scan_residence_nom');
    if (rid && rnom) {
      setSession({ residenceId: parseInt(rid, 10), residenceNom: rnom });
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const base = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${base}/api/scan/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_residence: code, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || 'Code résidence ou PIN incorrect');
        return;
      }
      sessionStorage.setItem('scan_residence_id', data.residence_id);
      sessionStorage.setItem('scan_residence_nom', data.residence_nom);
      sessionStorage.setItem('scan_pin', pin);
      setSession({ residenceId: data.residence_id, residenceNom: data.residence_nom });
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('scan_residence_id');
    sessionStorage.removeItem('scan_residence_nom');
    sessionStorage.removeItem('scan_pin');
    setSession(null);
  }

  if (session) {
    return (
      <ScanCamera
        residenceId={session.residenceId}
        residenceNom={session.residenceNom}
        onLogout={handleLogout}
      />
    );
  }

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
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f1117 0%, #1a1d27 50%, #0f1117 100%)',
      padding: 16, boxSizing: 'border-box',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 20,
        padding: '40px 36px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxSizing: 'border-box',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            marginBottom: 16,
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="#fff" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="#fff" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="#fff" strokeWidth="2"/>
              <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h3v3h-3zM19 19h2v2h-2z" fill="#fff"/>
            </svg>
          </div>
          <h1 style={{
            margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px',
          }}>
            Contrôle d'accès
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(148,163,184,0.8)', fontWeight: 400 }}>
            Accès réservé aux agents de sécurité
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Code résidence */}
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500,
              color: 'rgba(203,213,225,0.9)', letterSpacing: '0.2px',
            }}>
              Code résidence
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onFocus={() => setFocusedField('code')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="ex : RC-4829"
              autoComplete="off"
              style={inputStyle('code')}
            />
          </div>

          {/* PIN */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500,
              color: 'rgba(203,213,225,0.9)', letterSpacing: '0.2px',
            }}>
              PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4,6}"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onFocus={() => setFocusedField('pin')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="4 à 6 chiffres"
              style={inputStyle('pin')}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
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

          {/* Submit */}
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
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', letterSpacing: '0.3px',
              boxShadow: loading || btnHover ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
              transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
              transform: btnHover && !loading ? 'translateY(-1px)' : 'none',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'scan-spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Connexion…
              </span>
            ) : 'Accéder au scanner'}
          </button>
        </form>

        <p style={{
          margin: '20px 0 0', textAlign: 'center', fontSize: 12,
          color: 'rgba(100,116,139,0.5)',
        }}>
          © {new Date().getFullYear()} ResiConnect — Tous droits réservés
        </p>
      </div>

      <style>{`
        @keyframes scan-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(100,116,139,0.7); }
      `}</style>
    </div>
  );
}
