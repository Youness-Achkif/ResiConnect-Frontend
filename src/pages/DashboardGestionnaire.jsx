import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CLOUDINARY_IMAGE_URL, CLOUDINARY_RAW_URL, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary';
import SectionResidences from '../components/SectionResidences';

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
  section:         { padding: '28px 16px', maxWidth: 1060, margin: '0 auto' },
  card:            { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' },
  cardHead:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  h2:              { margin: 0, fontSize: 17, fontWeight: '600', color: '#f1f5f9', letterSpacing: '-0.2px' },
  tableWrapper:    { overflowX: 'auto' },
  table:           { width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 480 },
  th:              { textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px' },
  td:              { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle', color: '#cbd5e1' },
  btn:             { padding: '8px 14px', minHeight: 36, cursor: 'pointer', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: '500', fontFamily: 'inherit', marginRight: 4 },
  btnPrimary:      { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 2px 12px rgba(99,102,241,0.3)' },
  btnDanger:       { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.22)' },
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
  actif:          { background: 'rgba(34,197,94,0.15)',   color: '#4ade80',  border: '1px solid rgba(34,197,94,0.3)' },
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

// ─── Section Résidents ────────────────────────────────────────────────────────

function SectionResidents() {
  const { selectedResidence } = useAuth();
  const [residents, setResidents]                   = useState([]);
  const [loading, setLoading]                       = useState(false);
  const [error, setError]                           = useState('');
  const [success, setSuccess]                       = useState('');
  const [showForm, setShowForm]                     = useState(false);
  const [submitting, setSubmitting]                 = useState(false);
  const [form, setForm]                             = useState({ nom: '', email: '' });
  const [inviteBatiments, setInviteBatiments]       = useState([]);
  const [inviteBatId, setInviteBatId]               = useState('');
  const [inviteAptId, setInviteAptId]               = useState('');
  const [inviteAppartements, setInviteAppartements] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchResidents(); }, [selectedResidence?.id]);

  useEffect(() => {
    if (!showForm || !selectedResidence?.id) return;
    setInviteBatId('');
    setInviteAptId('');
    setInviteAppartements([]);
    api.get(`/api/residences/${selectedResidence.id}/batiments`)
      .then(({ data }) => setInviteBatiments(data))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm]);

  async function fetchResidents() {
    setLoading(true);
    setError('');
    try {
      const url = selectedResidence?.id
        ? `/api/residents?residence_id=${selectedResidence.id}`
        : '/api/residents';
      const { data } = await api.get(url);
      setResidents(data);
    } catch {
      setError('Impossible de charger les résidents.');
    } finally {
      setLoading(false);
    }
  }

  function resetInviteForm() {
    setForm({ nom: '', email: '' });
    setInviteBatId('');
    setInviteAptId('');
    setInviteBatiments([]);
    setInviteAppartements([]);
  }

  async function handleInviteBatChange(batId) {
    setInviteBatId(batId);
    setInviteAptId('');
    if (!batId || !selectedResidence?.id) return;
    try {
      const { data } = await api.get(`/api/residences/${selectedResidence.id}/appartements`);
      setInviteAppartements(data.filter(a => !a.user_id && !a.resident_nom && !a.user?.id));
    } catch {}
  }

  async function handleInvite(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/auth/invite-resident', {
        nom: form.nom,
        email: form.email,
        ...(inviteAptId && { appartement_id: parseInt(inviteAptId, 10) }),
        ...(selectedResidence?.id && { residence_id: selectedResidence.id }),
      });
      setSuccess(`Invitation envoyée à ${form.email}`);
      resetInviteForm();
      setShowForm(false);
      fetchResidents();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'invitation.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce résident ?')) return;
    setError('');
    try {
      await api.delete(`/api/residents/${id}`);
      fetchResidents();
    } catch {
      setError('Erreur lors de la suppression.');
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <h2 style={s.h2}>Résidents</h2>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => { const closing = showForm; setShowForm(v => !v); setSuccess(''); setError(''); if (closing) resetInviteForm(); }}>
          {showForm ? 'Annuler' : '+ Inviter un résident'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleInvite} style={s.formPanel}>
          {!selectedResidence ? (
            <p style={{ margin: 0, color: '#fbbf24', fontSize: 13 }}>
              Veuillez d'abord sélectionner une résidence dans la navbar.
            </p>
          ) : (
            <>
              <div style={s.formRow}>
                <label style={s.label}>Nom complet</label>
                <input style={s.input} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required placeholder="Prénom Nom" />
              </div>
              <div style={s.formRow}>
                <label style={s.label}>Email</label>
                <input type="email" style={s.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="resident@email.com" />
              </div>
              <div style={s.formRow}>
                <label style={s.label}>Bâtiment</label>
                <select style={{ ...s.select, width: '100%' }} value={inviteBatId} onChange={e => handleInviteBatChange(e.target.value)}>
                  <option value="">— Choisir un bâtiment —</option>
                  {inviteBatiments.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
                </select>
              </div>
              {inviteBatId && (
                <div style={s.formRow}>
                  <label style={s.label}>Appartement</label>
                  <select style={{ ...s.select, width: '100%' }} value={inviteAptId} onChange={e => setInviteAptId(e.target.value)}>
                    <option value="">— Choisir un appartement —</option>
                    {inviteAppartements
                      .filter(a => a.batiment_id === parseInt(inviteBatId, 10))
                      .map(a => (
                        <option key={a.id} value={a.id}>
                          {a.numero}{a.batiment_nom ? ` — ${a.batiment_nom}` : ''}
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={submitting}>
                {submitting ? 'Envoi...' : "Envoyer l'invitation"}
              </button>
            </>
          )}
        </form>
      )}

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/>
            <polyline points="9,12 11,14 15,10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p style={{ margin: 0, color: '#4ade80', fontSize: 13 }}>{success}</p>
        </div>
      )}

      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}

      {!loading && residents.length === 0 && <p style={s.empty}>Aucun résident enregistré.</p>}

      {residents.length > 0 && (
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Nom</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Statut</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {residents.map(r => (
                <tr key={r.id}>
                  <td style={{ ...s.td, color: '#f1f5f9', fontWeight: '500' }}>{r.nom}</td>
                  <td style={s.td}>{r.email}</td>
                  <td style={s.td}><Badge value={r.is_active ? 'actif' : 'en attente'} /></td>
                  <td style={s.td}>
                    <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => handleDelete(r.id)}>
                      Supprimer
                    </button>
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

// ─── Section Paiements ────────────────────────────────────────────────────────

const STATUTS_PAIEMENT = ['en attente', 'payé', 'refusé'];

function SectionPaiements() {
  const { selectedResidence }           = useAuth();
  const [paiements, setPaiements]       = useState([]);
  const [residents, setResidents]       = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [form, setForm]                 = useState({ user_id: '', montant: '', date_paiement: '', statut: 'en attente' });
  const [uploading, setUploading]       = useState(null);
  const fileInputRef                    = useRef(null);
  const uploadIdRef                     = useRef(null);

  useEffect(() => {
    fetchPaiements();
    const resUrl = selectedResidence?.id
      ? `/api/residents?residence_id=${selectedResidence.id}`
      : '/api/residents';
    api.get(resUrl).then(({ data }) => setResidents(data)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResidence?.id]);

  async function fetchPaiements() {
    setLoading(true);
    setError('');
    try {
      const url = selectedResidence?.id
        ? `/api/paiements?residence_id=${selectedResidence.id}`
        : '/api/paiements';
      const { data } = await api.get(url);
      setPaiements(data);
    } catch {
      setError('Impossible de charger les paiements.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/paiements', {
        user_id: parseInt(form.user_id, 10),
        montant: parseFloat(form.montant),
        date_paiement: form.date_paiement,
        statut: form.statut,
      });
      setForm({ user_id: '', montant: '', date_paiement: '', statut: 'en attente' });
      setShowForm(false);
      fetchPaiements();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce paiement ?')) return;
    setError('');
    try {
      await api.delete(`/api/paiements/${id}`);
      fetchPaiements();
    } catch {
      setError('Erreur lors de la suppression.');
    }
  }

  async function handleStatutChange(id, statut) {
    setError('');
    try {
      await api.put(`/api/paiements/${id}`, { statut });
      setPaiements(prev => prev.map(p => p.id === id ? { ...p, statut } : p));
    } catch {
      setError('Erreur lors de la mise à jour du statut.');
    }
  }

  function triggerUpload(id) {
    uploadIdRef.current = id;
    setUploading(id);
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  }

  async function handleUploadJustificatif(e) {
    const file = e.target.files[0];
    if (!file) { setUploading(null); return; }
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 10 MB.');
      setUploading(null);
      return;
    }
    const id    = uploadIdRef.current;
    const isPdf = file.type === 'application/pdf';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', isPdf ? 'raw' : 'image');
    try {
      const uploadUrl = isPdf ? CLOUDINARY_RAW_URL : CLOUDINARY_IMAGE_URL;
      const res  = await fetch(uploadUrl, { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.secure_url) throw new Error();
      await api.put(`/api/paiements/${id}`, { justificatif_url: data.secure_url });
      setPaiements(prev => prev.map(p => p.id === id ? { ...p, justificatif_url: data.secure_url } : p));
    } catch {
      setError('Erreur lors de l\'upload du justificatif.');
    } finally {
      setUploading(null);
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <h2 style={s.h2}>Paiements</h2>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Annuler' : '+ Nouveau paiement'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={s.formPanel}>
          <div style={s.formRow}>
            <label style={s.label}>Résident</label>
            <select style={{ ...s.select, width: '100%' }} value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} required>
              <option value="">-- Choisir un résident --</option>
              {residents.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
          </div>
          <div style={s.formRow}>
            <label style={s.label}>Montant (€)</label>
            <input type="number" min="0" step="0.01" style={s.input} value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} required />
          </div>
          <div style={s.formRow}>
            <label style={s.label}>Date</label>
            <input type="date" style={s.input} value={form.date_paiement} onChange={e => setForm({ ...form, date_paiement: e.target.value })} required />
          </div>
          <div style={s.formRow}>
            <label style={s.label}>Statut initial</label>
            <select style={{ ...s.select, width: '100%' }} value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
              {STATUTS_PAIEMENT.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={submitting}>
            {submitting ? 'Création...' : 'Créer'}
          </button>
        </form>
      )}

      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}

      {!loading && paiements.length === 0 && <p style={s.empty}>Aucun paiement enregistré.</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        style={{ display: 'none' }}
        onChange={handleUploadJustificatif}
      />

      {paiements.length > 0 && (
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Résident</th>
                <th style={s.th}>Montant</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Statut</th>
                <th style={s.th}>Changer statut</th>
                <th style={s.th}>Justificatif</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map(p => (
                <tr key={p.id}>
                  <td style={{ ...s.td, color: '#f1f5f9', fontWeight: '500' }}>{p.resident?.nom ?? p.resident_nom ?? '—'}</td>
                  <td style={s.td}><span style={{ color: '#a5b4fc', fontWeight: '600' }}>{p.montant} €</span></td>
                  <td style={s.td}>{p.date_paiement ? new Date(p.date_paiement).toLocaleDateString('fr-FR') : '—'}</td>
                  <td style={s.td}><Badge value={p.statut} /></td>
                  <td style={s.td}>
                    <select style={s.select} value={p.statut} onChange={e => handleStatutChange(p.id, e.target.value)}>
                      {STATUTS_PAIEMENT.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </td>
                  <td style={s.td}>
                    {p.justificatif_url && (
                      <a href={p.justificatif_url} target="_blank" rel="noreferrer" style={{ color: '#a5b4fc', fontSize: 13, marginRight: 8, textDecoration: 'none' }}>Voir justificatif</a>
                    )}
                    <button
                      style={{ ...s.btnSm, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}
                      onClick={() => triggerUpload(p.id)}
                      disabled={uploading === p.id}
                    >
                      {uploading === p.id ? '...' : p.justificatif_url ? 'Changer' : 'Ajouter justificatif'}
                    </button>
                  </td>
                  <td style={s.td}>
                    <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => handleDelete(p.id)}>
                      Supprimer
                    </button>
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

// ─── Section Problèmes ────────────────────────────────────────────────────────

const STATUTS_PROBLEME = ['ouvert', 'en cours', 'résolu'];

function SectionProblemes() {
  const { selectedResidence }     = useAuth();
  const [problemes, setProblemes] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => { fetchProblemes(); }, [selectedResidence?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchProblemes() {
    setLoading(true);
    setError('');
    try {
      const url = selectedResidence?.id
        ? `/api/problemes?residence_id=${selectedResidence.id}`
        : '/api/problemes';
      const { data } = await api.get(url);
      setProblemes(data);
    } catch {
      setError('Impossible de charger les problèmes.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id, patch) {
    setError('');
    try {
      await api.put(`/api/problemes/${id}`, patch);
      setProblemes(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    } catch {
      setError('Erreur lors de la mise à jour.');
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <h2 style={s.h2}>Problèmes signalés</h2>
      </div>

      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}

      {!loading && problemes.length === 0 && <p style={s.empty}>Aucun problème signalé.</p>}

      {problemes.length > 0 && (
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Résident</th>
                <th style={s.th}>Titre</th>
                <th style={s.th}>Description</th>
                <th style={s.th}>Statut</th>
                <th style={s.th}>Priorité</th>
                <th style={s.th}>Photo</th>
                <th style={s.th}>Changer statut</th>
              </tr>
            </thead>
            <tbody>
              {problemes.map(p => (
                <tr key={p.id}>
                  <td style={{ ...s.td, color: '#f1f5f9', fontWeight: '500' }}>{p.resident?.nom ?? p.resident_nom ?? '—'}</td>
                  <td style={s.td}>{p.titre}</td>
                  <td style={{ ...s.td, maxWidth: 260, color: '#64748b' }}>{p.description ?? '—'}</td>
                  <td style={s.td}><Badge value={p.statut} /></td>
                  <td style={s.td}><Badge value={p.priorite} /></td>
                  <td style={s.td}>
                    {p.photo_url
                      ? <a href={p.photo_url} target="_blank" rel="noreferrer" style={{ color: '#a5b4fc', fontSize: 13, textDecoration: 'none' }}>Voir photo</a>
                      : <span style={{ color: '#334155', fontSize: 13 }}>—</span>}
                  </td>
                  <td style={s.td}>
                    <select style={s.select} value={p.statut} onChange={e => handleUpdate(p.id, { statut: e.target.value })}>
                      {STATUTS_PROBLEME.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
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
  const { selectedResidence }       = useAuth();
  const [annonces, setAnnonces]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ titre: '', contenu: '' });

  useEffect(() => { fetchAnnonces(); }, [selectedResidence?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchAnnonces() {
    setLoading(true);
    setError('');
    try {
      const url = selectedResidence?.id
        ? `/api/annonces?residence_id=${selectedResidence.id}`
        : '/api/annonces';
      const { data } = await api.get(url);
      setAnnonces(data);
    } catch {
      setError('Impossible de charger les annonces.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/annonces', {
        ...form,
        ...(selectedResidence?.id && { residence_id: selectedResidence.id }),
      });
      setForm({ titre: '', contenu: '' });
      setShowForm(false);
      fetchAnnonces();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la publication.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    setError('');
    try {
      await api.delete(`/api/annonces/${id}`);
      fetchAnnonces();
    } catch {
      setError('Erreur lors de la suppression.');
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <h2 style={s.h2}>Annonces</h2>
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Annuler' : '+ Nouvelle annonce'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={s.formPanel}>
          <div style={s.formRow}>
            <label style={s.label}>Titre</label>
            <input style={s.input} value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} required />
          </div>
          <div style={s.formRow}>
            <label style={s.label}>Contenu</label>
            <textarea
              style={{ ...s.input, height: 100, resize: 'vertical' }}
              value={form.contenu}
              onChange={e => setForm({ ...form, contenu: e.target.value })}
              required
            />
          </div>
          <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={submitting}>
            {submitting ? 'Publication...' : 'Publier'}
          </button>
        </form>
      )}

      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}

      {!loading && annonces.length === 0 && <p style={s.empty}>Aucune annonce publiée.</p>}

      {annonces.length > 0 && (
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Titre</th>
                <th style={s.th}>Contenu</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {annonces.map(a => (
                <tr key={a.id}>
                  <td style={{ ...s.td, color: '#f1f5f9', fontWeight: '500' }}>{a.titre}</td>
                  <td style={{ ...s.td, maxWidth: 320, color: '#64748b' }}>{a.contenu}</td>
                  <td style={s.td}>{a.date ?? a.created_at ?? '—'}</td>
                  <td style={s.td}>
                    <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => handleDelete(a.id)}>
                      Supprimer
                    </button>
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

// ─── Section Messages ─────────────────────────────────────────────────────────

function SectionMessages({ onRead }) {
  const { user, selectedResidence }    = useAuth();
  const [messages, setMessages]        = useState([]);
  const [loading, setLoading]          = useState(false);
  const [error, setError]              = useState('');
  const [selectedId, setSelectedId]    = useState(null);
  const [reply, setReply]              = useState('');
  const [sending, setSending]          = useState(false);
  const isMobile                       = useIsMobile();
  const bottomRef                      = useRef(null);
  const messagesContainerRef           = useRef(null);
  const shouldScrollRef                = useRef(false);
  const prevThreadCountRef             = useRef(0);
  const selectedIdRef                  = useRef(null);
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [residents, setResidents]       = useState([]);

  useEffect(() => {
    fetchMessages(true);
    const resUrl = selectedResidence?.id
      ? `/api/residents?residence_id=${selectedResidence.id}`
      : '/api/residents';
    api.get(resUrl).then(({ data }) => setResidents(data)).catch(() => {});
    const id = setInterval(() => fetchMessages(false), 3000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResidence?.id]);

  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  useEffect(() => {
    if (shouldScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      shouldScrollRef.current = false;
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowNewBadge(false);
    prevThreadCountRef.current = 0;
  }, [selectedId]);

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
      const url = selectedResidence?.id
        ? `/api/messages?residence_id=${selectedResidence.id}`
        : '/api/messages';
      const { data } = await api.get(url);
      const curId = selectedIdRef.current;
      const newThread = curId
        ? data.filter(m => m.expediteur_id === curId || m.destinataire_id === curId)
        : [];
      const prevCount = prevThreadCountRef.current;
      prevThreadCountRef.current = newThread.length;
      setMessages(data);
      if (isInitial || wasAtBottom) {
        shouldScrollRef.current = true;
        setShowNewBadge(false);
      } else if (newThread.length > prevCount) {
        setShowNewBadge(true);
      }
      const unread = data.filter(m => !m.lu);
      await Promise.all(unread.map(m => api.put(`/api/messages/${m.id}/lu`).catch(() => {})));
      if (unread.length > 0) onRead?.();
    } catch {
      if (isInitial) setError('Impossible de charger les messages.');
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!reply.trim() || !selectedId) return;
    setSending(true);
    setError('');
    try {
      await api.post('/api/messages', { contenu: reply, destinataire_id: selectedId });
      setReply('');
      shouldScrollRef.current = true;
      fetchMessages(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteConversation(e, id, nom) {
    e.stopPropagation();
    if (!window.confirm(`Supprimer toute la conversation avec ${nom} ?`)) return;
    try {
      await api.delete(`/api/messages/conversation/${id}`);
      setMessages(prev => prev.filter(m => m.expediteur_id !== id && m.destinataire_id !== id));
    } catch {
      setError('Impossible de supprimer la conversation.');
    }
  }

  const msgMap = new Map();
  [...messages]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .forEach(m => {
      const otherId = m.expediteur_id === user?.id ? m.destinataire_id : m.expediteur_id;
      if (!msgMap.has(otherId)) {
        const unread = messages.filter(msg => msg.expediteur_id === otherId && !msg.lu).length;
        msgMap.set(otherId, { unread, last: m });
      }
    });
  const conversations = residents
    .map(r => {
      const msgData = msgMap.get(r.id);
      return { id: r.id, nom: r.nom || r.email || '—', unread: msgData?.unread ?? 0, last: msgData?.last ?? null };
    })
    .sort((a, b) => {
      if (a.last && b.last) return new Date(b.last.created_at) - new Date(a.last.created_at);
      if (a.last) return -1;
      if (b.last) return 1;
      return (a.nom || '').localeCompare(b.nom || '');
    });

  const thread = selectedId
    ? messages
        .filter(m => m.expediteur_id === selectedId || m.destinataire_id === selectedId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    : [];

  const bubbleMine  = { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderRadius: '14px 14px 2px 14px' };
  const bubbleOther = { background: 'rgba(255,255,255,0.07)', color: '#cbd5e1', borderRadius: '14px 14px 14px 2px', border: '1px solid rgba(255,255,255,0.08)' };

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <h2 style={s.h2}>Messages</h2>
      </div>

      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}

      {!loading && (
        isMobile ? (
          selectedId ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: 500 }}>
              <button
                onClick={() => setSelectedId(null)}
                style={{ ...s.btn, background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 12, alignSelf: 'flex-start' }}
              >
                ← Retour
              </button>
              <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
                {thread.map(m => {
                  const mine = m.expediteur_id === user?.id;
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                      <div style={{ maxWidth: '80%', ...(mine ? bubbleMine : bubbleOther), padding: '9px 13px', fontSize: 14 }}>
                        {!mine && <div style={{ fontSize: 11, fontWeight: '600', marginBottom: 3, color: '#a5b4fc' }}>{m.expediteur_nom ?? '—'}</div>}
                        <div style={{ whiteSpace: 'pre-wrap' }}>{m.contenu}</div>
                        {m.created_at && <div style={{ fontSize: 11, marginTop: 4, opacity: 0.55, textAlign: 'right' }}>{new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              {showNewBadge && (
                <div style={{ textAlign: 'center', padding: '4px 0' }}>
                  <button onClick={scrollToBottom} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 18px', fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 12px rgba(99,102,241,0.4)', fontFamily: 'inherit' }}>Nouveau message ↓</button>
                </div>
              )}
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <input style={{ ...s.input, flex: 1 }} placeholder="Répondre..." value={reply} onChange={e => setReply(e.target.value)} />
                <button type="submit" style={{ ...s.btn, ...s.btnPrimary, marginRight: 0 }} disabled={sending || !reply.trim()}>{sending ? '...' : 'Envoyer'}</button>
              </form>
            </div>
          ) : (
            <div>
              {conversations.length === 0 && <p style={s.empty}>Aucun message.</p>}
              {conversations.map(c => (
                <div key={c.id} onClick={() => setSelectedId(c.id)} style={{ padding: '13px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 8 }}>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontWeight: c.unread > 0 ? '700' : '500', fontSize: 15, color: c.unread > 0 ? '#f1f5f9' : '#cbd5e1' }}>{c.nom}</div>
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 3 }}>{c.last ? (c.last.contenu.slice(0, 40) + (c.last.contenu.length > 40 ? '…' : '')) : 'Aucun message'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {c.unread > 0 && <span style={{ background: '#6366f1', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 12, fontWeight: '700' }}>{c.unread}</span>}
                    <button
                      onClick={e => handleDeleteConversation(e, c.id, c.nom)}
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                    >🗑️ Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={{ display: 'flex', gap: 0, height: 460 }}>
            <div style={{ width: 230, borderRight: '1px solid rgba(255,255,255,0.07)', overflowY: 'auto', paddingRight: 0, flexShrink: 0 }}>
              {conversations.length === 0 && <p style={s.empty}>Aucun message.</p>}
              {conversations.map(c => (
                <div key={c.id} onClick={() => setSelectedId(c.id)} style={{ padding: '11px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: selectedId === c.id ? 'rgba(99,102,241,0.15)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: selectedId === c.id ? '2px solid #6366f1' : '2px solid transparent' }}>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div style={{ fontWeight: c.unread > 0 ? '700' : '500', fontSize: 14, color: c.unread > 0 ? '#f1f5f9' : '#cbd5e1' }}>{c.nom}</div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last ? (c.last.contenu.slice(0, 26) + (c.last.contenu.length > 26 ? '…' : '')) : 'Aucun message'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 6 }}>
                    {c.unread > 0 && <span style={{ background: '#6366f1', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: '700' }}>{c.unread}</span>}
                    <button
                      onClick={e => handleDeleteConversation(e, c.id, c.nom)}
                      title={`Supprimer la conversation avec ${c.nom}`}
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 5, padding: '3px 6px', fontSize: 12, cursor: 'pointer', lineHeight: 1, fontFamily: 'inherit' }}
                    >🗑️</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingLeft: 16 }}>
              {!selectedId && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={s.empty}>Sélectionnez une conversation.</p>
                </div>
              )}
              {selectedId && (
                <>
                  <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
                    {thread.map(m => {
                      const mine = m.expediteur_id === user?.id;
                      return (
                        <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                          <div style={{ maxWidth: '70%', ...(mine ? bubbleMine : bubbleOther), padding: '9px 13px', fontSize: 14 }}>
                            {!mine && <div style={{ fontSize: 11, fontWeight: '600', marginBottom: 3, color: '#a5b4fc' }}>{m.expediteur_nom ?? '—'}</div>}
                            <div style={{ whiteSpace: 'pre-wrap' }}>{m.contenu}</div>
                            {m.created_at && <div style={{ fontSize: 11, marginTop: 4, opacity: 0.55, textAlign: 'right' }}>{new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                  {showNewBadge && (
                    <div style={{ textAlign: 'center', padding: '4px 0' }}>
                      <button onClick={scrollToBottom} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 18px', fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 12px rgba(99,102,241,0.4)', fontFamily: 'inherit' }}>Nouveau message ↓</button>
                    </div>
                  )}
                  <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <input style={{ ...s.input, flex: 1 }} placeholder="Répondre..." value={reply} onChange={e => setReply(e.target.value)} />
                    <button type="submit" style={{ ...s.btn, ...s.btnPrimary, marginRight: 0 }} disabled={sending || !reply.trim()}>{sending ? '...' : 'Envoyer'}</button>
                  </form>
                </>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

const TABS = [
  { key: 'residents', label: 'Résidents' },
  { key: 'paiements', label: 'Paiements' },
  { key: 'problemes', label: 'Problèmes' },
  { key: 'annonces',  label: 'Annonces'  },
  { key: 'messages',  label: 'Messages'  },
  { key: 'residences', label: '⚙️ Résidences' },
];

export default function DashboardGestionnaire() {
  const { user, logout, residences, selectedResidence, setSelectedResidence, refreshResidences } = useAuth();
  const isMobile          = useIsMobile();
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem('activeTab') || 'residents'
  );
  const [menuOpen, setMenuOpen]       = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'gestionnaire') {
      refreshResidences();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FE-G9 : si aucune résidence, aller sur l'onglet résidences
  useEffect(() => {
    if (residences.length === 0) {
      setActiveTab('residences');
      localStorage.setItem('activeTab', 'residences');
    }
  }, [residences.length]);

  useEffect(() => {
    const fetchUnread = () => api.get('/api/messages')
      .then(({ data }) => setUnreadCount(data.filter(m => !m.lu).length))
      .catch(() => {});
    fetchUnread();
    const id = setInterval(fetchUnread, 3000);
    return () => clearInterval(id);
  }, []);

  function handleTabChange(key) {
    localStorage.setItem('activeTab', key);
    setActiveTab(key);
    setMenuOpen(false);
  }

  return (
    <div style={s.page}>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
        input::placeholder, textarea::placeholder { color: rgba(100,116,139,0.6); }
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

        {/* Residence selector */}
        <select
          value={selectedResidence?.id || ''}
          onChange={e => {
            const res = residences.find(r => r.id === parseInt(e.target.value, 10));
            if (res) setSelectedResidence(res);
          }}
          style={{
            background: '#1a1d27',
            color: residences.length === 0 ? '#475569' : '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 13,
            cursor: residences.length === 0 ? 'default' : 'pointer',
            outline: 'none',
            fontFamily: 'inherit',
            maxWidth: 160,
            flexShrink: 0,
          }}
          disabled={residences.length === 0}
        >
          {residences.length === 0
            ? <option value="">Aucune résidence</option>
            : residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)
          }
        </select>

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
              {tab.key === 'messages' && unreadCount > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 11, fontWeight: '700', marginLeft: 6 }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))
        )}

        <span style={s.navSep} />
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
                {tab.key === 'messages' && unreadCount > 0 && (
                  <span style={{ background: '#6366f1', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 11, fontWeight: '700', marginLeft: 8 }}>{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div style={s.section}>
        {activeTab === 'residents'  && <SectionResidents />}
        {activeTab === 'paiements'  && <SectionPaiements />}
        {activeTab === 'problemes'  && <SectionProblemes />}
        {activeTab === 'annonces'   && <SectionAnnonces />}
        {activeTab === 'messages'   && <SectionMessages onRead={() => setUnreadCount(0)} />}
        {activeTab === 'residences' && <SectionResidences welcomeMode={residences.length === 0} />}
      </div>
    </div>
  );
}
