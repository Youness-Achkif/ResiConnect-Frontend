import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CLOUDINARY_AUTO_URL, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = {
  page:            { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", minHeight: '100vh', background: 'linear-gradient(160deg, #0f1117 0%, #1a1d27 100%)' },
  nav:             { background: 'rgba(15,17,23,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 6, height: 60, position: 'sticky', top: 0, borderBottom: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 2px 20px rgba(0,0,0,0.4)', zIndex: 100 },
  navLogo:         { display: 'flex', alignItems: 'center', gap: 10, marginRight: 16 },
  navIcon:         { width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(99,102,241,0.4)' },
  navTitle:        { fontWeight: '700', fontSize: 16, color: '#f1f5f9', letterSpacing: '-0.3px' },
  navSep:          { flex: 1 },
  tab:             { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '6px 14px', cursor: 'pointer', borderRadius: 8, fontSize: 13, fontWeight: '500', fontFamily: 'inherit' },
  tabActive:       { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: '1px solid transparent', color: '#fff', padding: '6px 14px', cursor: 'pointer', borderRadius: 8, fontSize: 13, fontWeight: '600', fontFamily: 'inherit', boxShadow: '0 2px 14px rgba(99,102,241,0.4)' },
  logoutBtn:       { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', padding: '6px 14px', minHeight: 36, cursor: 'pointer', borderRadius: 8, fontSize: 13, fontWeight: '500', fontFamily: 'inherit' },
  hamburger:       { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', padding: '6px 10px', cursor: 'pointer', borderRadius: 8, fontSize: 18, lineHeight: '1.2' },
  mobileMenu:      { position: 'absolute', top: 60, left: 0, right: 0, background: 'rgba(15,17,23,0.98)', backdropFilter: 'blur(20px)', zIndex: 200, borderTop: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' },
  mobileTab:       { display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', padding: '15px 20px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box' },
  mobileTabActive: { display: 'block', width: '100%', textAlign: 'left', background: 'rgba(99,102,241,0.12)', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a5b4fc', fontWeight: '600', padding: '15px 20px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', boxSizing: 'border-box' },
  section:         { padding: '28px 16px', maxWidth: 960, margin: '0 auto' },
  card:            { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' },
  cardHead:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  h2:              { margin: 0, fontSize: 17, fontWeight: '600', color: '#f1f5f9', letterSpacing: '-0.2px' },
  tableWrapper:    { overflowX: 'auto' },
  table:           { width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 420 },
  th:              { textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px' },
  td:              { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle', color: '#cbd5e1' },
  btn:             { padding: '8px 14px', minHeight: 36, cursor: 'pointer', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: '500', fontFamily: 'inherit', marginRight: 4 },
  btnPrimary:      { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 2px 12px rgba(99,102,241,0.3)' },
  btnDanger:       { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.22)' },
  btnNeutral:      { background: 'rgba(255,255,255,0.07)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' },
  btnSm:           { padding: '4px 10px', cursor: 'pointer', borderRadius: 6, border: 'none', fontSize: 12, fontFamily: 'inherit', fontWeight: '500' },
  formPanel:       { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, marginBottom: 20 },
  formRow:         { marginBottom: 14 },
  label:           { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: '500', color: '#94a3b8' },
  input:           { padding: '10px 14px', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontFamily: 'inherit', outline: 'none' },
  select:          { padding: '9px 12px', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13, background: '#1a1d27', color: '#e2e8f0', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' },
  error:           { color: '#fca5a5', fontSize: 13, margin: '8px 0' },
  loading:         { color: '#475569', fontSize: 13, margin: '8px 0' },
  empty:           { color: '#475569', fontSize: 14, padding: '20px 0', textAlign: 'center' },
  badge:           { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: '600', display: 'inline-block' },
};

const BADGE_COLORS = {
  payé:           { background: 'rgba(34,197,94,0.15)',   color: '#4ade80',  border: '1px solid rgba(34,197,94,0.3)' },
  'en attente':   { background: 'rgba(245,158,11,0.15)',  color: '#fbbf24',  border: '1px solid rgba(245,158,11,0.3)' },
  refusé:         { background: 'rgba(239,68,68,0.15)',   color: '#f87171',  border: '1px solid rgba(239,68,68,0.3)' },
  ouvert:         { background: 'rgba(99,102,241,0.15)',  color: '#a5b4fc',  border: '1px solid rgba(99,102,241,0.3)' },
  'en cours':     { background: 'rgba(245,158,11,0.15)',  color: '#fbbf24',  border: '1px solid rgba(245,158,11,0.3)' },
  résolu:         { background: 'rgba(34,197,94,0.15)',   color: '#4ade80',  border: '1px solid rgba(34,197,94,0.3)' },
  basse:          { background: 'rgba(100,116,139,0.15)', color: '#94a3b8',  border: '1px solid rgba(100,116,139,0.25)' },
  normale:        { background: 'rgba(99,102,241,0.15)',  color: '#a5b4fc',  border: '1px solid rgba(99,102,241,0.3)' },
  haute:          { background: 'rgba(239,68,68,0.15)',   color: '#f87171',  border: '1px solid rgba(239,68,68,0.3)' },
  urgente:        { background: 'rgba(239,68,68,0.25)',   color: '#fca5a5',  border: '1px solid rgba(239,68,68,0.45)' },
};

function Badge({ value }) {
  const colors = BADGE_COLORS[value] || { background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' };
  return <span style={{ ...s.badge, ...colors }}>{value ?? '—'}</span>;
}

// ─── Section Mes Paiements ────────────────────────────────────────────────────

function SectionPaiements() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/api/paiements')
      .then(({ data }) => setPaiements(data))
      .catch(() => setError('Impossible de charger vos paiements.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <h2 style={s.h2}>Mes paiements</h2>
      </div>

      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}
      {!loading && paiements.length === 0 && <p style={s.empty}>Aucun paiement enregistré.</p>}

      {paiements.length > 0 && (
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Montant</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Statut</th>
                <th style={s.th}>Justificatif</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map(p => (
                <tr key={p.id}>
                  <td style={s.td}><span style={{ color: '#a5b4fc', fontWeight: '600' }}>{p.montant} €</span></td>
                  <td style={s.td}>
                    {p.date_paiement ? new Date(p.date_paiement).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={s.td}><Badge value={p.statut} /></td>
                  <td style={s.td}>
                    {p.justificatif_url
                      ? <a href={p.justificatif_url} target="_blank" rel="noreferrer" style={{ color: '#a5b4fc', fontSize: 13, textDecoration: 'none' }}>Voir justificatif</a>
                      : <span style={{ color: '#334155', fontSize: 13 }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Section Mes Problèmes ────────────────────────────────────────────────────

const PRIORITES = ['basse', 'normale', 'haute'];

function SectionProblemes() {
  const [problemes, setProblemes]           = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [showForm, setShowForm]             = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoFile, setPhotoFile]           = useState(null);
  const [form, setForm]                     = useState({ titre: '', description: '', priorite: 'normale' });
  const [uploadingRow, setUploadingRow]     = useState(null);
  const photoInputRef                       = useRef(null);
  const uploadRowIdRef                      = useRef(null);
  const [editId, setEditId]                 = useState(null);
  const [editForm, setEditForm]             = useState({ titre: '', description: '', priorite: 'normale' });
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => { fetchProblemes(); }, []);

  async function fetchProblemes() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/problemes');
      setProblemes(data);
    } catch {
      setError('Impossible de charger vos problèmes.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce problème ?')) return;
    try {
      await api.delete(`/api/problemes/${id}`);
      setProblemes(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Impossible de supprimer ce problème.');
    }
  }

  function openEdit(p) {
    setEditId(p.id);
    setEditForm({ titre: p.titre, description: p.description ?? '', priorite: p.priorite ?? 'normale' });
  }

  async function handleEditSubmit(e, id) {
    e.preventDefault();
    setEditSubmitting(true);
    setError('');
    try {
      await api.put(`/api/problemes/${id}`, editForm);
      setProblemes(prev => prev.map(p => p.id === id ? { ...p, ...editForm } : p));
      setEditId(null);
    } catch {
      setError('Erreur lors de la modification.');
    } finally {
      setEditSubmitting(false);
    }
  }

  function triggerPhotoChange(id) {
    uploadRowIdRef.current = id;
    photoInputRef.current.value = '';
    photoInputRef.current.click();
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 10 MB.');
      return;
    }
    const id = uploadRowIdRef.current;
    setUploadingRow(id);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const res  = await fetch(CLOUDINARY_AUTO_URL, { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.secure_url) throw new Error('Upload échoué.');
      await api.put(`/api/problemes/${id}`, { photo_url: data.secure_url });
      setProblemes(prev => prev.map(p => p.id === id ? { ...p, photo_url: data.secure_url } : p));
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'upload de la photo.');
    } finally {
      setUploadingRow(null);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      let photo_url = '';
      if (photoFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const res  = await fetch(CLOUDINARY_AUTO_URL, { method: 'POST', body: formData });
        const data = await res.json();
        if (!data.secure_url) throw new Error('Upload de la photo échoué.');
        photo_url = data.secure_url;
        setUploadingPhoto(false);
      }
      await api.post('/api/problemes', { ...form, ...(photo_url ? { photo_url } : {}) });
      setForm({ titre: '', description: '', priorite: 'normale' });
      setPhotoFile(null);
      setShowForm(false);
      fetchProblemes();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors du signalement.');
    } finally {
      setSubmitting(false);
      setUploadingPhoto(false);
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <h2 style={s.h2}>Mes problèmes</h2>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Annuler' : '+ Signaler un problème'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={s.formPanel}>
          <div style={s.formRow}>
            <label style={s.label}>Titre</label>
            <input
              style={s.input}
              value={form.titre}
              onChange={e => setForm({ ...form, titre: e.target.value })}
              required
            />
          </div>
          <div style={s.formRow}>
            <label style={s.label}>Description</label>
            <textarea
              style={{ ...s.input, height: 90, resize: 'vertical' }}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div style={s.formRow}>
            <label style={s.label}>Priorité</label>
            <select
              style={s.select}
              value={form.priorite}
              onChange={e => setForm({ ...form, priorite: e.target.value })}
            >
              {PRIORITES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={s.formRow}>
            <label style={s.label}>Photo (optionnel)</label>
            <input
              type="file"
              accept="image/*"
              style={{ ...s.input, paddingTop: 8, cursor: 'pointer' }}
              onChange={e => {
                const file = e.target.files[0];
                if (file && file.size > 10 * 1024 * 1024) {
                  setError('Le fichier ne doit pas dépasser 10 MB.');
                  e.target.value = '';
                  return;
                }
                setPhotoFile(file || null);
              }}
            />
          </div>
          <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={submitting}>
            {submitting ? (uploadingPhoto ? 'Upload photo...' : 'Envoi...') : 'Signaler'}
          </button>
        </form>
      )}

      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}
      {!loading && problemes.length === 0 && <p style={s.empty}>Aucun problème signalé.</p>}

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoChange}
      />

      {problemes.length > 0 && (
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Titre</th>
                <th style={s.th}>Description</th>
                <th style={s.th}>Statut</th>
                <th style={s.th}>Priorité</th>
                <th style={s.th}>Photo</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {problemes.map(p => editId === p.id ? (
                <tr key={p.id}>
                  <td colSpan={6} style={{ ...s.td, borderBottom: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)' }}>
                    <form onSubmit={e => handleEditSubmit(e, p.id)} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div>
                        <label style={{ ...s.label, marginBottom: 4 }}>Titre</label>
                        <input style={{ ...s.input, width: 180 }} value={editForm.titre} onChange={e => setEditForm({ ...editForm, titre: e.target.value })} required />
                      </div>
                      <div>
                        <label style={{ ...s.label, marginBottom: 4 }}>Description</label>
                        <input style={{ ...s.input, width: 240 }} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ ...s.label, marginBottom: 4 }}>Priorité</label>
                        <select style={s.select} value={editForm.priorite} onChange={e => setEditForm({ ...editForm, priorite: e.target.value })}>
                          {PRIORITES.map(pr => <option key={pr} value={pr}>{pr}</option>)}
                        </select>
                      </div>
                      <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={editSubmitting}>
                        {editSubmitting ? '...' : 'Enregistrer'}
                      </button>
                      <button type="button" style={{ ...s.btn, ...s.btnNeutral, marginRight: 0 }} onClick={() => setEditId(null)}>
                        Annuler
                      </button>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={p.id}>
                  <td style={{ ...s.td, color: '#f1f5f9', fontWeight: '500' }}>{p.titre}</td>
                  <td style={{ ...s.td, maxWidth: 220, color: '#64748b' }}>{p.description ?? '—'}</td>
                  <td style={s.td}><Badge value={p.statut} /></td>
                  <td style={s.td}><Badge value={p.priorite} /></td>
                  <td style={s.td}>
                    {p.photo_url && (
                      <a href={p.photo_url} target="_blank" rel="noreferrer" style={{ color: '#a5b4fc', fontSize: 13, marginRight: 8, textDecoration: 'none' }}>Voir photo</a>
                    )}
                    <button
                      style={{ ...s.btnSm, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}
                      onClick={() => triggerPhotoChange(p.id)}
                      disabled={uploadingRow === p.id}
                    >
                      {uploadingRow === p.id ? '...' : p.photo_url ? 'Changer la photo' : 'Ajouter une photo'}
                    </button>
                  </td>
                  <td style={s.td}>
                    <button
                      style={{ ...s.btn, ...s.btnPrimary, marginRight: 4 }}
                      onClick={() => openEdit(p)}
                    >Modifier</button>
                    <button
                      style={{ ...s.btn, ...s.btnDanger, marginRight: 0 }}
                      onClick={() => handleDelete(p.id)}
                    >Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Section Annonces ─────────────────────────────────────────────────────────

function SectionAnnonces() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/api/annonces')
      .then(({ data }) => setAnnonces(data))
      .catch(() => setError('Impossible de charger les annonces.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.card}>
      <div style={s.cardHead}><h2 style={s.h2}>Annonces</h2></div>
      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}
      {!loading && annonces.length === 0 && <p style={s.empty}>Aucune annonce pour le moment.</p>}

      {annonces.map((a, i) => (
        <div key={a.id} style={{
          borderBottom: i < annonces.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          paddingBottom: 18,
          marginBottom: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '600', marginBottom: 6, color: '#f1f5f9', fontSize: 15 }}>{a.titre}</div>
              <div style={{ fontSize: 14, color: '#94a3b8', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{a.contenu}</div>
              <div style={{ fontSize: 12, color: '#334155', marginTop: 8 }}>
                {a.date ?? a.created_at ?? ''}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section Messages ─────────────────────────────────────────────────────────

function SectionMessages({ residenceId }) {
  const [messages, setMessages]             = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [contenu, setContenu]               = useState('');
  const [sending, setSending]               = useState(false);
  const [gestionnaireId, setGestionnaireId] = useState(null);
  const { user }                            = useAuth();
  const bottomRef                           = useRef(null);
  const messagesContainerRef                = useRef(null);
  const shouldScrollRef                     = useRef(false);
  const prevCountRef                        = useRef(0);
  const [showNewBadge, setShowNewBadge]     = useState(false);

  useEffect(() => {
    fetchMessages(true);
    const id = setInterval(() => fetchMessages(false), 3000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!residenceId) return;
    api.get(`/api/auth/gestionnaire/${residenceId}`)
      .then(({ data }) => setGestionnaireId(data.id))
      .catch(() => setError('Impossible de récupérer le destinataire.'));
  }, [residenceId]);

  useEffect(() => {
    if (shouldScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      shouldScrollRef.current = false;
    }
  }, [messages]);

  function isAtBottom() {
    const el = messagesContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  }

  function scrollToBottom() {
    setShowNewBadge(false);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function fetchMessages(isInitial = false) {
    const wasAtBottom = isAtBottom();
    if (isInitial) setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/messages');
      const prevCount = prevCountRef.current;
      prevCountRef.current = data.length;
      setMessages(data);
      if (isInitial || wasAtBottom) {
        shouldScrollRef.current = true;
        setShowNewBadge(false);
      } else if (data.length > prevCount) {
        setShowNewBadge(true);
      }
    } catch {
      if (isInitial) setError('Impossible de charger les messages.');
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!contenu.trim()) return;
    setSending(true);
    setError('');
    try {
      await api.post('/api/messages', { contenu, destinataire_id: gestionnaireId });
      setContenu('');
      shouldScrollRef.current = true;
      fetchMessages(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  }

  const isMe = (msg) => msg.expediteur_id === user?.id || msg.role === 'resident';

  const bubbleMine  = { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderRadius: '14px 14px 2px 14px' };
  const bubbleOther = { background: 'rgba(255,255,255,0.07)', color: '#cbd5e1', borderRadius: '14px 14px 14px 2px', border: '1px solid rgba(255,255,255,0.08)' };

  return (
    <div style={s.card}>
      <div style={s.cardHead}><h2 style={s.h2}>Messages</h2></div>
      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}

      <div
        ref={messagesContainerRef}
        style={{
          height: 360,
          overflowY: 'auto',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          padding: 14,
          marginBottom: 12,
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        {messages.length === 0 && !loading && (
          <p style={s.empty}>Aucun message. Commencez la conversation.</p>
        )}
        {messages.map(m => {
          const mine = isMe(m);
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              <div style={{ maxWidth: '72%', ...(mine ? bubbleMine : bubbleOther), padding: '9px 13px', fontSize: 14 }}>
                {!mine && (
                  <div style={{ fontSize: 11, fontWeight: '600', marginBottom: 3, color: '#a5b4fc' }}>
                    {m.expediteur_nom ?? 'Gestionnaire'}
                  </div>
                )}
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.contenu}</div>
                {m.created_at && (
                  <div style={{ fontSize: 11, marginTop: 4, opacity: 0.55, textAlign: 'right' }}>
                    {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {showNewBadge && (
        <div style={{ textAlign: 'center', padding: '4px 0' }}>
          <button
            onClick={scrollToBottom}
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 18px', fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 12px rgba(99,102,241,0.4)', fontFamily: 'inherit' }}
          >
            Nouveau message ↓
          </button>
        </div>
      )}

      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <input
          style={{ ...s.input, flex: 1 }}
          placeholder="Écrire un message..."
          value={contenu}
          onChange={e => setContenu(e.target.value)}
        />
        <button type="submit" style={{ ...s.btn, ...s.btnPrimary, marginRight: 0 }} disabled={sending || !contenu.trim()}>
          {sending ? '...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

const TABS = [
  { key: 'paiements', label: 'Mes paiements' },
  { key: 'problemes', label: 'Mes problèmes' },
  { key: 'annonces',  label: 'Annonces'      },
  { key: 'messages',  label: 'Messages'      },
];

export default function DashboardResident() {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const isMobile          = useIsMobile();
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem('resident_activeTab') || 'paiements'
  );
  const [menuOpen, setMenuOpen]       = useState(false);
  const [residentInfo, setResidentInfo] = useState(null);

  useEffect(() => {
    api.get('/api/auth/me').then(({ data }) => setResidentInfo(data)).catch(() => {});
  }, []);

  function handleTabChange(key) {
    localStorage.setItem('resident_activeTab', key);
    setActiveTab(key);
    setMenuOpen(false);
  }

  return (
    <div style={s.page}>
      <style>{`
        input::placeholder, textarea::placeholder { color: rgba(100,116,139,0.6); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
        select option { background: #1a1d27; color: #e2e8f0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.5); }
      `}</style>

      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.navIcon}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={s.navTitle}>ResiConnect</span>
        </div>

        {isMobile ? (
          <button style={s.hamburger} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        ) : (
          TABS.map(tab => (
            <button
              key={tab.key}
              style={activeTab === tab.key ? s.tabActive : s.tab}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))
        )}

        <span style={s.navSep} />
        {!isMobile && (
          <span style={{ fontSize: 12, color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '3px 10px', marginRight: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
            {residentInfo?.residence_nom ? `Résidence : ${residentInfo.residence_nom}` : 'Aucune résidence assignée'}
          </span>
        )}
        {!isMobile && <span style={{ fontSize: 13, color: '#64748b', marginRight: 10 }}>{user?.nom}</span>}
        <button style={s.logoutBtn} onClick={logout}>Déconnecter</button>

        {isMobile && menuOpen && (
          <div style={s.mobileMenu}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                style={activeTab === tab.key ? s.mobileTabActive : s.mobileTab}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div style={s.section}>
        {residentInfo !== null && !residentInfo.residence_id && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '14px 20px', marginBottom: 20 }}>
            <span style={{ fontSize: 14, color: '#a5b4fc' }}>
              Vous n'êtes assigné à aucune résidence.
            </span>
            <button
              onClick={() => navigate('/join-residence')}
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(99,102,241,0.35)', whiteSpace: 'nowrap' }}
            >
              Rejoindre une résidence →
            </button>
          </div>
        )}
        {activeTab === 'paiements' && <SectionPaiements />}
        {activeTab === 'problemes' && <SectionProblemes />}
        {activeTab === 'annonces'  && <SectionAnnonces />}
        {activeTab === 'messages'  && <SectionMessages residenceId={residentInfo?.residence_id} />}
      </div>
    </div>
  );
}
