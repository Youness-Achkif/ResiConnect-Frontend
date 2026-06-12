import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

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

function nowLocalIso() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function SectionVisiteurs() {
  const [visiteurs, setVisiteurs]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeQr, setActiveQr]     = useState(null);
  const qrRef                       = useRef(null);

  const [form, setForm] = useState({
    nom: '',
    type: 'Famille',
    date_validite: '',
    nb_utilisations_max: 1,
  });

  useEffect(() => { fetchVisiteurs(); }, []);

  async function fetchVisiteurs() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/visiteurs');
      setVisiteurs(data);
    } catch {
      setError('Impossible de charger vos visiteurs.');
    } finally {
      setLoading(false);
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
        nb_utilisations_max: parseInt(form.nb_utilisations_max, 10),
      });
      setForm({ nom: '', type: 'Famille', date_validite: '', nb_utilisations_max: 1 });
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
      const file = new File(
        [pngBlob],
        `visiteur-${(activeQr.nom || 'qr').replace(/\s+/g, '_')}.png`,
        { type: 'image/png' }
      );
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: `QR Code — ${activeQr.nom}` }); }
        catch {}
      } else {
        handleDownload();
      }
    }, 'image/png');
  }

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <>
      <div style={s.card}>
        <div style={s.cardHead}>
          <h2 style={s.h2}>Mes visiteurs</h2>
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
                  value={form.nb_utilisations_max}
                  min={1}
                  onChange={e => setForm({ ...form, nb_utilisations_max: e.target.value })}
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
                          {v.nb_utilisations ?? 0}/{v.nb_utilisations_max ?? 1}
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

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <button style={{ ...s.btn, ...s.btnNeutral }} onClick={handleDownload}>
                ↓ Télécharger
              </button>
              {canShare && (
                <button style={{ ...s.btn, ...s.btnPrimary, marginRight: 0 }} onClick={handleShare}>
                  Partager
                </button>
              )}
            </div>

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
