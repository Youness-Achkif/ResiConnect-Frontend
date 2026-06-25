import React, { useState, useEffect, useRef } from 'react';
import ScanCamera from '../components/ScanCamera';
import AuthLayout from '../components/AuthLayout';
import { Button, Input, Callout } from '../components/ui';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const KeyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="8" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
    <path d="M11 11l8-8M16 3l3 3-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ScanLogin() {
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const codeContainerRef = useRef(null);

  useEffect(() => {
    const rid = sessionStorage.getItem('scan_residence_id');
    const rnom = sessionStorage.getItem('scan_residence_nom');
    if (rid && rnom) {
      setSession({ residenceId: parseInt(rid, 10), residenceNom: rnom });
    }
  }, []);

  // Debounced autocomplete search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (code.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const base = process.env.REACT_APP_API_URL || '';
        const res = await fetch(`${base}/api/residences/search?q=${encodeURIComponent(code)}`);
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      } catch {
        // silently fail — user can still type code directly
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [code]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (codeContainerRef.current && !codeContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelectSuggestion(r) {
    setCode(r.code);
    setSuggestions([]);
    setShowDropdown(false);
  }

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

  return (
    <AuthLayout
      tagline="Contrôle d'accès sécurisé."
      points={[
        'Vérification instantanée des QR codes',
        'Accès réservé aux agents autorisés',
        'Connexion par code résidence + PIN',
      ]}
    >
      <div className="rc-auth__card">
        <div className="rc-auth__head">
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, var(--rc-primary-500), var(--rc-primary-600))',
            boxShadow: 'var(--rc-shadow-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="#fff" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="#fff" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="#fff" strokeWidth="2" />
              <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h3v3h-3zM19 19h2v2h-2z" fill="#fff" />
            </svg>
          </div>
          <h2 className="rc-auth__title">Contrôle d'accès</h2>
          <p className="rc-auth__sub">Accès réservé aux agents de sécurité</p>
        </div>

        <form onSubmit={handleLogin} noValidate>
          {/* Code résidence + autocomplétion */}
          <div className="rc-field" style={{ marginBottom: 18 }}>
            <label className="rc-field__label" htmlFor="scan-code">Nom ou code résidence</label>
            <div ref={codeContainerRef} style={{ position: 'relative' }}>
              <div className="rc-input-wrap rc-input-wrap--icon">
                <span className="rc-input-wrap__icon" aria-hidden="true"><SearchIcon /></span>
                <input
                  id="scan-code"
                  className="rc-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                  required
                  placeholder="ex : RC-4829 ou Les Pins"
                  autoComplete="off"
                />
              </div>
              {showDropdown && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 'var(--rc-z-dropdown)',
                  background: 'var(--rc-surface)',
                  border: '1px solid var(--rc-border)',
                  borderRadius: 'var(--rc-radius-md)', marginTop: 6,
                  boxShadow: 'var(--rc-shadow-lg)',
                  maxHeight: 220, overflowY: 'auto',
                }}>
                  {suggestions.map((r, i) => (
                    <div
                      key={r.id}
                      onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(r); }}
                      style={{
                        padding: '11px 14px', cursor: 'pointer',
                        borderBottom: i < suggestions.length - 1 ? '1px solid var(--rc-border)' : 'none',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--rc-primary-50)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ fontSize: 14.5, color: 'var(--rc-text)', fontWeight: 500 }}>{r.nom}</span>
                      {r.code && (
                        <span style={{
                          fontSize: 12, color: 'var(--rc-text-muted)', fontFamily: 'monospace',
                          background: 'var(--rc-surface-2)', border: '1px solid var(--rc-border)',
                          borderRadius: 6, padding: '2px 7px', flexShrink: 0,
                        }}>
                          {r.code}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PIN */}
          <div style={{ marginBottom: 22 }}>
            <Input
              label="PIN"
              icon={<KeyIcon />}
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4,6}"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              placeholder="4 à 6 chiffres"
            />
          </div>

          {error && (
            <div style={{ marginBottom: 20 }}>
              <Callout variant="error">{error}</Callout>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" block loading={loading}>
            {loading ? 'Connexion…' : 'Accéder au scanner'}
          </Button>
        </form>

        <p className="rc-auth__foot">
          © {new Date().getFullYear()} ResiConnect — Tous droits réservés
        </p>
      </div>
    </AuthLayout>
  );
}
