import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const s = {
  card:         { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' },
  cardHead:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  h2:           { margin: 0, fontSize: 17, fontWeight: '600', color: '#f1f5f9', letterSpacing: '-0.2px' },
  formPanel:    { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, marginBottom: 20 },
  formRow:      { marginBottom: 14 },
  label:        { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: '500', color: '#94a3b8' },
  input:        { padding: '10px 14px', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontFamily: 'inherit', outline: 'none' },
  select:       { padding: '9px 12px', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13, background: '#1a1d27', color: '#e2e8f0', fontFamily: 'inherit', cursor: 'pointer', outline: 'none', width: '100%', boxSizing: 'border-box' },
  btn:          { padding: '8px 14px', minHeight: 36, cursor: 'pointer', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: '500', fontFamily: 'inherit', marginRight: 4 },
  btnPrimary:   { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 2px 12px rgba(99,102,241,0.3)' },
  btnDanger:    { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.22)' },
  btnNeutral:   { background: 'rgba(255,255,255,0.07)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' },
  tableWrapper: { overflowX: 'auto' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 520 },
  th:           { textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px' },
  td:           { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle', color: '#cbd5e1' },
  badge:        { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: '600', display: 'inline-block' },
  error:        { color: '#fca5a5', fontSize: 13, margin: '8px 0' },
  loading:      { color: '#475569', fontSize: 13, margin: '8px 0' },
  empty:        { color: '#475569', fontSize: 14, padding: '20px 0', textAlign: 'center' },
};

const BADGE_STATUT = {
  actif:   { background: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)'   },
  expiré:  { background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.25)' },
  annulé:  { background: 'rgba(239,68,68,0.15)',   color: '#f87171', border: '1px solid rgba(239,68,68,0.3)'   },
};

const TYPES = ['Famille', 'Ami', 'Livreur', 'Prestataire', 'Autre'];

function getStatut(v) {
  if (v.statut === 'annulé') return 'annulé';
  if (v.date_validite && new Date(v.date_validite) < new Date()) return 'expiré';
  return 'actif';
}

function formatDateFr(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDateForShare(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const dd  = String(d.getDate()).padStart(2, '0');
  const mm  = String(d.getMonth() + 1).padStart(2, '0');
  const hh  = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`;
}

function nowLocalIso() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function SectionVisiteurs() {
  const { user }                    = useAuth();
  const [visiteurs, setVisiteurs]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeQr, setActiveQr]       = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareText, setShareText]     = useState('');
  const qrRef                         = useRef(null);

  useEffect(() => { if (activeQr) { setShowShareMenu(false); setShareText(''); } }, [activeQr]);

  const [form, setForm] = useState({
    nom: '',
    type: 'Famille',
    date_validite: '',
    max_utilisations: 1,
  });

  useEffect(() => {
    fetchVisiteurs(true);
    const interval = setInterval(() => fetchVisiteurs(false), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchVisiteurs(isInitial = true) {
    if (isInitial) setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/visiteurs');
      setVisiteurs(data);
    } catch {
      setError('Impossible de charger vos visiteurs.');
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/api/visiteurs', {
        nom: form.nom,
        type: form.type,
        date_validite: form.date_validite,
        max_utilisations: parseInt(form.max_utilisations, 10),
      });
      setForm({ nom: '', type: 'Famille', date_validite: '', max_utilisations: 1 });
      setShowForm(false);
      setActiveQr(data);
      fetchVisiteurs();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAnnuler(id) {
    if (!window.confirm('Annuler ce visiteur ?')) return;
    try {
      await api.put(`/api/visiteurs/${id}/annuler`);
      fetchVisiteurs();
    } catch {
      setError("Erreur lors de l'annulation.");
    }
  }

  function getQRCanvas() {
    const svgEl = qrRef.current?.querySelector('svg');
    if (!svgEl) return Promise.resolve(null);
    return new Promise((resolve) => {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const img = new Image();
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const objUrl = URL.createObjectURL(blob);
      img.onload = () => {
        ctx.drawImage(img, 12, 12, 200, 200);
        URL.revokeObjectURL(objUrl);
        resolve(canvas);
      };
      img.onerror = () => resolve(null);
      img.src = objUrl;
    });
  }

  async function handleDownload() {
    const canvas = await getQRCanvas();
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `visiteur-${(activeQr.nom || 'qr').replace(/\s+/g, '_')}.png`;
    a.click();
  }

  async function handleShare() {
    const canvas = await getQRCanvas();
    if (!canvas) return;
    canvas.toBlob(async (pngBlob) => {
      const fileName = `visiteur-${(activeQr.nom || 'qr').replace(/\s+/g, '_')}.png`;
      const file = new File([pngBlob], fileName, { type: 'image/png' });
      const residenceNom = user?.residence_nom ?? 'la résidence';
      const text = [
        `Bonjour ${activeQr.nom},`,
        '',
        `Voici votre code d'accès pour ${residenceNom} :`,
        `- Type de visite : ${activeQr.type}`,
        `- Valide jusqu'au : ${formatDateForShare(activeQr.date_validite)}`,
        `- Nombre d'utilisations autorisées : ${activeQr.max_utilisations}`,
        '',
        "Présentez ce QR code à l'agent de sécurité à votre arrivée.",
      ].join('\n');
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: `QR Code — ${activeQr.nom}`, text }); }
        catch {}
      } else {
        await handleDownload();
        setShareText(text);
        setShowShareMenu(true);
      }
    }, 'image/png');
  }

  return (
    <>
      <div style={s.card}>
        <div style={s.cardHead}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={s.h2}>Mes visiteurs</h2>
            <button
              style={{ ...s.btn, ...s.btnNeutral, padding: '3px 10px', minHeight: 26, fontSize: 12 }}
              onClick={() => fetchVisiteurs(true)}
            >
              🔄 Actualiser
            </button>
          </div>
          <button
            style={{ ...s.btn, ...s.btnPrimary }}
            onClick={() => { setShowForm(v => !v); setError(''); }}
          >
            {showForm ? 'Annuler' : '+ Nouveau visiteur'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} style={s.formPanel}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={s.formRow}>
                <label style={s.label}>Nom du visiteur</label>
                <input
                  style={s.input}
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>
              <div style={s.formRow}>
                <label style={s.label}>Type</label>
                <select
                  style={s.select}
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={s.formRow}>
                <label style={s.label}>Valide jusqu'au</label>
                <input
                  type="datetime-local"
                  style={s.input}
                  value={form.date_validite}
                  min={nowLocalIso()}
                  onChange={e => setForm({ ...form, date_validite: e.target.value })}
                  required
                />
              </div>
              <div style={s.formRow}>
                <label style={s.label}>Utilisations max</label>
                <input
                  type="number"
                  style={s.input}
                  value={form.max_utilisations}
                  min={1}
                  onChange={e => setForm({ ...form, max_utilisations: e.target.value })}
                  required
                />
              </div>
            </div>
            {error && <p style={s.error}>{error}</p>}
            <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={submitting}>
              {submitting ? 'Génération...' : 'Générer le QR Code'}
            </button>
          </form>
        )}

        {error && !showForm && <p style={s.error}>{error}</p>}
        {loading && <p style={s.loading}>Chargement...</p>}
        {!loading && visiteurs.length === 0 && (
          <p style={s.empty}>Aucun visiteur enregistré.</p>
        )}

        {visiteurs.length > 0 && (
          <div style={s.tableWrapper}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Nom</th>
                  <th style={s.th}>Type</th>
                  <th style={s.th}>Validité</th>
                  <th style={s.th}>Utilisations</th>
                  <th style={s.th}>Statut</th>
                  <th style={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {visiteurs.map(v => {
                  const statut = getStatut(v);
                  return (
                    <tr key={v.id}>
                      <td style={{ ...s.td, color: '#f1f5f9', fontWeight: '500' }}>{v.nom}</td>
                      <td style={s.td}>{v.type}</td>
                      <td style={{ ...s.td, whiteSpace: 'nowrap' }}>{formatDateFr(v.date_validite)}</td>
                      <td style={s.td}>
                        <span style={{ color: '#a5b4fc', fontWeight: '600' }}>
                          {v.nb_utilisations ?? 0}/{v.max_utilisations ?? 1}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, ...BADGE_STATUT[statut] }}>{statut}</span>
                      </td>
                      <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                        {statut === 'actif' && (
                          <button
                            style={{ ...s.btn, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}
                            onClick={() => setActiveQr(v)}
                          >
                            Voir QR
                          </button>
                        )}
                        {v.statut !== 'annulé' && (
                          <button
                            style={{ ...s.btn, ...s.btnDanger, marginRight: 0 }}
                            onClick={() => handleAnnuler(v.id)}
                          >
                            Annuler
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modale QR Code ── */}
      {activeQr && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setActiveQr(null); }}
        >
          <div style={{ background: 'rgba(26,29,39,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px 28px', maxWidth: 340, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)', position: 'relative', textAlign: 'center', boxSizing: 'border-box' }}>
            <button
              onClick={() => setActiveQr(null)}
              style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
            >✕</button>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 }}>{activeQr.nom}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                {activeQr.type}
              </div>
              <div style={{ fontSize: 12, color: '#475569' }}>
                Valide jusqu'au {formatDateFr(activeQr.date_validite)}
              </div>
            </div>

            <div ref={qrRef} style={{ background: '#ffffff', borderRadius: 12, padding: 12, display: 'inline-block', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <QRCodeSVG value={activeQr.token} size={200} />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
              <button style={{ ...s.btn, ...s.btnNeutral }} onClick={handleDownload}>
                ↓ Télécharger
              </button>
              <button style={{ ...s.btn, ...s.btnPrimary, marginRight: 0 }} onClick={handleShare}>
                Partager
              </button>
            </div>
            {showShareMenu && (
              <div style={{ margin: '8px 0 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 1.5 }}>
                  L'image du QR code a été téléchargée — joignez-la au message après ouverture.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 8, border: '1px solid rgba(37,211,102,0.3)', background: 'rgba(37,211,102,0.1)', color: '#4ade80', fontSize: 13, fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => window.open(`https://t.me/share/url?url=&text=${encodeURIComponent(shareText)}`, '_blank')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 8, border: '1px solid rgba(0,136,204,0.35)', background: 'rgba(0,136,204,0.1)', color: '#60a5fa', fontSize: 13, fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Telegram
                  </button>
                  <button
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent(`Code d'accès - ${user?.residence_nom ?? 'résidence'}`)}&body=${encodeURIComponent(shareText)}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)', color: '#94a3b8', fontSize: 13, fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveQr(null)}
              style={{ ...s.btn, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', width: '100%', marginRight: 0, marginTop: 4 }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
