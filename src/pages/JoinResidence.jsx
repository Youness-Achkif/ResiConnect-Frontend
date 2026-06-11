import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const inputStyle = (focused) => ({
  width: '100%',
  padding: '13px 16px',
  background: focused ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
  border: focused ? '1.5px solid #6366f1' : '1.5px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  fontSize: 14,
  color: '#e2e8f0',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, background 0.2s',
  fontFamily: 'inherit',
});

function formatDateFr(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Stepper({ step }) {
  const steps = ['Recherche', 'Demande', 'Confirmation'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const active = step === num;
        const done = step > num;
        return (
          <React.Fragment key={num}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, transition: 'all 0.3s',
                background: done ? 'rgba(34,197,94,0.2)' : active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                color: done ? '#4ade80' : active ? '#fff' : '#475569',
                border: done ? '1px solid rgba(34,197,94,0.4)' : active ? 'none' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: active ? '0 2px 12px rgba(99,102,241,0.4)' : 'none',
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize: 11, color: active ? '#a5b4fc' : done ? '#4ade80' : '#475569', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, margin: '0 8px', marginBottom: 18, background: step > num ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function JoinResidence() {
  const navigate = useNavigate();
  const [step, setStep]                   = useState(1);
  const [query, setQuery]                 = useState('');
  const [results, setResults]             = useState([]);
  const [searching, setSearching]         = useState(false);
  const [selected, setSelected]           = useState(null);
  const [appartements, setAppartements]   = useState([]);
  const [aptId, setAptId]                 = useState('');
  const [message, setMessage]             = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');
  const [focusedField, setFocusedField]   = useState(null);
  const [existingRequest, setExistingRequest] = useState(null);
  const [checkingRequest, setCheckingRequest] = useState(true);
  const [cancelling, setCancelling]       = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { replace: true });
      return;
    }
    api.get('/api/join-requests/mine')
      .then(({ data }) => setExistingRequest(data))
      .catch(() => setExistingRequest(null))
      .finally(() => setCheckingRequest(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCancelRequest() {
    setCancelling(true);
    setError('');
    try {
      await api.delete(`/api/join-requests/${existingRequest.id}`);
      setExistingRequest(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'annulation.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    setResults([]);
    try {
      const { data } = await api.get(`/api/residences/search?q=${encodeURIComponent(query.trim())}`);
      setResults(data);
      if (data.length === 0) setError('Aucune résidence trouvée pour cette recherche.');
    } catch {
      setError('Erreur lors de la recherche. Vérifiez votre connexion.');
    } finally {
      setSearching(false);
    }
  }

  async function handleSelectResidence(res) {
    setSelected(res);
    setAptId('');
    setMessage('');
    setError('');
    setStep(2);
    try {
      const { data } = await api.get(`/api/residences/${res.id}/appartements`);
      const free = data.filter(a => !a.resident_nom && !a.user_id && !(a.user?.id));
      setAppartements(free);
    } catch {
      setAppartements([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/join-requests', {
        residence_id: selected.id,
        ...(aptId && { appartement_id: parseInt(aptId, 10) }),
        ...(message.trim() && { message: message.trim() }),
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi de la demande.");
    } finally {
      setSubmitting(false);
    }
  }

  const infoRow = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );

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
        width: '100%', maxWidth: 480,
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 20, padding: '40px 36px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxSizing: 'border-box', position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', marginBottom: 12,
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
            Rejoindre une résidence
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(148,163,184,0.8)' }}>
            Trouvez et rejoignez votre résidence
          </p>
        </div>

        {/* ── Chargement initial ── */}
        {checkingRequest && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite', marginBottom: 16 }}>
              <circle cx="12" cy="12" r="10" stroke="rgba(99,102,241,0.3)" strokeWidth="3"/>
              <path d="M12 2a10 10 0 0110 10" stroke="#6366f1" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>Chargement...</p>
          </div>
        )}

        {/* ── Demande en attente ── */}
        {!checkingRequest && existingRequest && existingRequest.statut === 'en attente' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 60, height: 60, borderRadius: '50%', marginBottom: 16,
                background: 'rgba(234,179,8,0.1)', border: '2px solid rgba(234,179,8,0.3)',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#eab308" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
                Demande en cours d'examen
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                Votre gestionnaire va examiner votre demande prochainement.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '4px 16px', marginBottom: 24 }}>
              {infoRow('Résidence', existingRequest.residence_nom || '—')}
              {infoRow('Adresse', existingRequest.residence_adresse || '—')}
              {infoRow('Appartement', existingRequest.appartement_numero || 'Non spécifié')}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0' }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Envoyée le</span>
                <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>{formatDateFr(existingRequest.created_at)}</span>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ margin: 0, color: '#fca5a5', fontSize: 13 }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleCancelRequest}
              disabled={cancelling}
              style={{
                width: '100%', padding: '13px', minHeight: 46, marginBottom: 10,
                background: cancelling ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: cancelling ? '#fca5a5' : '#f87171', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: cancelling ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!cancelling) { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; } }}
              onMouseLeave={e => { if (!cancelling) { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; } }}
            >
              {cancelling ? 'Annulation...' : 'Annuler ma demande'}
            </button>

            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%', padding: '11px', minHeight: 42,
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', borderRadius: 10, fontSize: 14, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#cbd5e1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              Retour à l'accueil
            </button>
          </div>
        )}

        {/* ── Demande refusée ── */}
        {!checkingRequest && existingRequest && existingRequest.statut === 'refusé' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 60, height: 60, borderRadius: '50%', marginBottom: 16,
                background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
                Demande refusée
              </h2>
            </div>

            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 24, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 14, color: '#fca5a5', lineHeight: 1.6 }}>
                Votre demande a été refusée. Vous pouvez faire une nouvelle demande.
              </p>
            </div>

            <button
              onClick={() => setExistingRequest(null)}
              style={{
                width: '100%', padding: '13px', minHeight: 46, marginBottom: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
              }}
            >
              Faire une nouvelle demande
            </button>

            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%', padding: '11px', minHeight: 42,
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', borderRadius: 10, fontSize: 14, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#cbd5e1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              Retour à l'accueil
            </button>
          </div>
        )}

        {/* ── Stepper (aucune demande ou acceptée) ── */}
        {!checkingRequest && (!existingRequest || existingRequest.statut === 'accepté') && (
          <>
            <Stepper step={step} />

            {/* ── Étape 1 : Recherche ── */}
            {step === 1 && (
              <div>
                <form onSubmit={handleSearch}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'rgba(203,213,225,0.9)' }}>
                      Code résidence ou nom
                    </label>
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onFocus={() => setFocusedField('query')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="ex: RC-4829 ou Les Pins"
                      style={inputStyle(focusedField === 'query')}
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !query.trim()}
                    style={{
                      width: '100%', padding: '13px', minHeight: 46,
                      background: searching || !query.trim() ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                      cursor: searching || !query.trim() ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                    }}
                  >
                    {searching ? 'Recherche...' : 'Rechercher'}
                  </button>
                </form>

                {error && (
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ margin: 0, color: '#fca5a5', fontSize: 13 }}>{error}</p>
                  </div>
                )}

                {results.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ margin: '0 0 12px', fontSize: 12, color: '#475569', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {results.length} résidence{results.length > 1 ? 's' : ''} trouvée{results.length > 1 ? 's' : ''}
                    </p>
                    {results.map(r => (
                      <div
                        key={r.id}
                        onClick={() => handleSelectResidence(r)}
                        style={{
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)',
                          borderRadius: 12, padding: '14px 16px', marginBottom: 10, cursor: 'pointer',
                          transition: 'border-color 0.2s, background 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9', marginBottom: 4 }}>{r.nom}</div>
                        {r.adresse && <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{r.adresse}</div>}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {r.nb_appartements != null && (
                            <span style={{ fontSize: 12, color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '2px 8px' }}>
                              {r.nb_appartements} appt{r.nb_appartements > 1 ? 's' : ''}
                            </span>
                          )}
                          {r.code && (
                            <span style={{ fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '2px 8px' }}>
                              {r.code}
                            </span>
                          )}
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: '#6366f1', fontWeight: 500 }}>
                          Choisir cette résidence →
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Étape 2 : Demande ── */}
            {step === 2 && selected && (
              <div>
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9', marginBottom: 3 }}>{selected.nom}</div>
                      {selected.adresse && <div style={{ fontSize: 13, color: '#94a3b8' }}>{selected.adresse}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(''); }}
                      style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: '2px 0', fontWeight: 500 }}
                    >
                      Changer
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'rgba(203,213,225,0.9)' }}>
                      Appartement <span style={{ color: '#475569', fontWeight: 400 }}>(optionnel)</span>
                    </label>
                    <select
                      value={aptId}
                      onChange={e => setAptId(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px',
                        background: '#1a1d27', border: '1.5px solid rgba(255,255,255,0.1)',
                        borderRadius: 10, fontSize: 14, color: aptId ? '#e2e8f0' : '#475569',
                        fontFamily: 'inherit', cursor: 'pointer', outline: 'none', boxSizing: 'border-box',
                      }}
                    >
                      <option value="">— Sélectionnez un appartement —</option>
                      {appartements.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.numero}{a.batiment_nom ? ` — ${a.batiment_nom}` : ''}
                        </option>
                      ))}
                    </select>
                    {appartements.length === 0 && (
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#475569' }}>
                        Aucun appartement libre disponible.
                      </p>
                    )}
                  </div>

                  <div style={{ marginBottom: 22 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: 'rgba(203,213,225,0.9)' }}>
                      Message <span style={{ color: '#475569', fontWeight: 400 }}>(optionnel)</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Ex: Je viens d'emménager au A101..."
                      rows={3}
                      style={{ ...inputStyle(focusedField === 'message'), resize: 'vertical', minHeight: 80 }}
                    />
                  </div>

                  {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                      <p style={{ margin: 0, color: '#fca5a5', fontSize: 13 }}>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '13px', minHeight: 46,
                      background: submitting ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                    }}
                  >
                    {submitting ? 'Envoi...' : 'Envoyer ma demande'}
                  </button>
                </form>
              </div>
            )}

            {/* ── Étape 3 : Confirmation ── */}
            {step === 3 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 64, height: 64, borderRadius: '50%', marginBottom: 20,
                  background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/>
                    <polyline points="8,12 11,15 16,9" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
                  Demande envoyée !
                </h2>
                <p style={{ margin: '0 0 24px', fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
                  Votre gestionnaire va examiner votre demande et vous contacter.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%', padding: '13px', minHeight: 46,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                  }}
                >
                  Retour à l'accueil
                </button>
              </div>
            )}
          </>
        )}

        <p style={{ margin: '24px 0 0', textAlign: 'center', fontSize: 12, color: 'rgba(100,116,139,0.5)' }}>
          © {new Date().getFullYear()} ResiConnect — Tous droits réservés
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: rgba(100,116,139,0.7); }
        select option { background: #1a1d27; color: #e2e8f0; }
      `}</style>
    </div>
  );
}
