import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = {
  page:      { fontFamily: 'sans-serif', minHeight: '100vh', background: '#f0f2f5' },
  nav:       { background: '#1a1a2e', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 8, height: 56, flexWrap: 'wrap' },
  navTitle:  { fontWeight: 'bold', fontSize: 17, marginRight: 16 },
  navSep:    { flex: 1 },
  tab:       { background: 'none', border: '1px solid rgba(255,255,255,0.4)', color: '#ccc', padding: '5px 14px', cursor: 'pointer', borderRadius: 4, fontSize: 13 },
  tabActive: { background: '#fff', border: '1px solid #fff', color: '#1a1a2e', padding: '5px 14px', cursor: 'pointer', borderRadius: 4, fontSize: 13, fontWeight: '600' },
  logoutBtn: { background: '#c0392b', border: 'none', color: '#fff', padding: '5px 14px', cursor: 'pointer', borderRadius: 4, fontSize: 13, marginLeft: 8 },
  section:   { padding: 24, maxWidth: 1020, margin: '0 auto' },
  card:      { background: '#fff', borderRadius: 8, padding: 20, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  cardHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  h2:        { margin: 0, fontSize: 18 },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th:        { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #eee', background: '#fafafa', fontWeight: '600' },
  td:        { padding: '8px 12px', borderBottom: '1px solid #eee', verticalAlign: 'middle' },
  btn:       { padding: '5px 12px', cursor: 'pointer', borderRadius: 4, border: 'none', fontSize: 13, marginRight: 4 },
  btnPrimary:{ background: '#1a1a2e', color: '#fff' },
  btnDanger: { background: '#dc3545', color: '#fff' },
  btnSm:     { padding: '3px 8px', cursor: 'pointer', borderRadius: 4, border: 'none', fontSize: 12 },
  formPanel: { background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 6, padding: 16, marginBottom: 16 },
  formRow:   { marginBottom: 12 },
  label:     { display: 'block', marginBottom: 4, fontSize: 13, fontWeight: '500' },
  input:     { padding: '7px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, width: '100%', boxSizing: 'border-box' },
  select:    { padding: '7px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, background: '#fff' },
  error:     { color: '#dc3545', fontSize: 13, margin: '8px 0' },
  loading:   { color: '#888', fontSize: 13, margin: '8px 0' },
  empty:     { color: '#aaa', fontSize: 14, padding: '12px 0' },
  badge:     { padding: '2px 9px', borderRadius: 12, fontSize: 12, fontWeight: '600', display: 'inline-block' },
};

const BADGE_COLORS = {
  payé:       { background: '#d4edda', color: '#155724' },
  'en attente': { background: '#fff3cd', color: '#856404' },
  refusé:     { background: '#f8d7da', color: '#721c24' },
  ouvert:     { background: '#cce5ff', color: '#004085' },
  'en cours': { background: '#fff3cd', color: '#856404' },
  résolu:     { background: '#d4edda', color: '#155724' },
  basse:      { background: '#e2e3e5', color: '#383d41' },
  normale:    { background: '#cce5ff', color: '#004085' },
  haute:      { background: '#f8d7da', color: '#721c24' },
  urgente:    { background: '#721c24', color: '#fff' },
};

function Badge({ value }) {
  const colors = BADGE_COLORS[value] || { background: '#eee', color: '#555' };
  return <span style={{ ...s.badge, ...colors }}>{value ?? '—'}</span>;
}

// ─── Section Résidents ────────────────────────────────────────────────────────

function SectionResidents() {
  const [residents, setResidents]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ nom: '', email: '', mot_de_passe: '' });

  useEffect(() => { fetchResidents(); }, []);

  async function fetchResidents() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/residents');
      setResidents(data);
    } catch {
      setError('Impossible de charger les résidents.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/auth/register', { ...form, role: 'resident' });
      setForm({ nom: '', email: '', mot_de_passe: '' });
      setShowForm(false);
      fetchResidents();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création.');
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
        <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Annuler' : '+ Nouveau résident'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={s.formPanel}>
          <div style={s.formRow}>
            <label style={s.label}>Nom complet</label>
            <input style={s.input} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
          </div>
          <div style={s.formRow}>
            <label style={s.label}>Email</label>
            <input type="email" style={s.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div style={s.formRow}>
            <label style={s.label}>Mot de passe</label>
            <input type="password" style={s.input} value={form.mot_de_passe} onChange={e => setForm({ ...form, mot_de_passe: e.target.value })} required />
          </div>
          <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={submitting}>
            {submitting ? 'Création...' : 'Créer'}
          </button>
        </form>
      )}

      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}

      {!loading && residents.length === 0 && <p style={s.empty}>Aucun résident enregistré.</p>}

      {residents.length > 0 && (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Nom</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {residents.map(r => (
              <tr key={r.id}>
                <td style={s.td}>{r.nom}</td>
                <td style={s.td}>{r.email}</td>
                <td style={s.td}>
                  <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => handleDelete(r.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Section Paiements ────────────────────────────────────────────────────────

const STATUTS_PAIEMENT = ['en attente', 'payé', 'refusé'];

function SectionPaiements() {
  const [paiements, setPaiements]   = useState([]);
  const [residents, setResidents]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ user_id: '', montant: '', date_paiement: '', statut: 'en attente' });

  useEffect(() => {
    fetchPaiements();
    api.get('/api/residents').then(({ data }) => setResidents(data)).catch(() => {});
  }, []);

  async function fetchPaiements() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/paiements');
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

      {paiements.length > 0 && (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Résident</th>
              <th style={s.th}>Montant</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Statut</th>
              <th style={s.th}>Changer statut</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paiements.map(p => (
              <tr key={p.id}>
                <td style={s.td}>{p.resident?.nom ?? p.resident_nom ?? '—'}</td>
                <td style={s.td}>{p.montant} €</td>
                <td style={s.td}>{p.date_paiement ? new Date(p.date_paiement).toLocaleDateString('fr-FR') : '—'}</td>
                <td style={s.td}><Badge value={p.statut} /></td>
                <td style={s.td}>
                  <select
                    style={s.select}
                    value={p.statut}
                    onChange={e => handleStatutChange(p.id, e.target.value)}
                  >
                    {STATUTS_PAIEMENT.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
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
      )}
    </div>
  );
}

// ─── Section Problèmes ────────────────────────────────────────────────────────

const STATUTS_PROBLEME  = ['ouvert', 'en cours', 'résolu'];
const PRIORITES_PROBLEME = ['haute', 'normale', 'basse'];

function SectionProblemes() {
  const [problemes, setProblemes] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => { fetchProblemes(); }, []);

  async function fetchProblemes() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/problemes');
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
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Résident</th>
              <th style={s.th}>Titre</th>
              <th style={s.th}>Description</th>
              <th style={s.th}>Statut</th>
              <th style={s.th}>Priorité</th>
              <th style={s.th}>Changer statut</th>
              <th style={s.th}>Changer priorité</th>
            </tr>
          </thead>
          <tbody>
            {problemes.map(p => (
              <tr key={p.id}>
                <td style={s.td}>{p.resident?.nom ?? p.resident_nom ?? '—'}</td>
                <td style={s.td}>{p.titre}</td>
                <td style={{ ...s.td, maxWidth: 260, color: '#555' }}>{p.description ?? '—'}</td>
                <td style={s.td}><Badge value={p.statut} /></td>
                <td style={s.td}><Badge value={p.priorite} /></td>
                <td style={s.td}>
                  <select
                    style={s.select}
                    value={p.statut}
                    onChange={e => handleUpdate(p.id, { statut: e.target.value })}
                  >
                    {STATUTS_PROBLEME.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </td>
                <td style={s.td}>
                  <select
                    style={s.select}
                    value={p.priorite}
                    onChange={e => handleUpdate(p.id, { priorite: e.target.value })}
                  >
                    {PRIORITES_PROBLEME.map(pr => <option key={pr} value={pr}>{pr}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Section Annonces ─────────────────────────────────────────────────────────

function SectionAnnonces() {
  const [annonces, setAnnonces]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ titre: '', contenu: '' });

  useEffect(() => { fetchAnnonces(); }, []);

  async function fetchAnnonces() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/annonces');
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
      await api.post('/api/annonces', form);
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
                <td style={{ ...s.td, fontWeight: '500' }}>{a.titre}</td>
                <td style={{ ...s.td, maxWidth: 320, color: '#555' }}>{a.contenu}</td>
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
      )}
    </div>
  );
}

// ─── Section Messages ─────────────────────────────────────────────────────────

function SectionMessages({ onRead }) {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply]         = useState('');
  const [sending, setSending]     = useState(false);
  const { user }                  = useAuth();
  const bottomRef                 = useRef(null);

  useEffect(() => { fetchMessages(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, messages]);

  async function fetchMessages() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/messages');
      setMessages(data);
      const unread = data.filter(m => !m.lu);
      await Promise.all(unread.map(m => api.put(`/api/messages/${m.id}/lu`).catch(() => {})));
      if (unread.length > 0) onRead?.();
    } catch {
      setError('Impossible de charger les messages.');
    } finally {
      setLoading(false);
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
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  }

  const conversations = [];
  const seen = new Set();
  [...messages]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .forEach(m => {
      const otherId  = m.expediteur_id === user?.id ? m.destinataire_id  : m.expediteur_id;
      const otherNom = m.expediteur_id === user?.id ? (m.destinataire_nom ?? '—') : (m.expediteur_nom ?? '—');
      if (!seen.has(otherId)) {
        seen.add(otherId);
        const unread = messages.filter(msg => msg.expediteur_id === otherId && !msg.lu).length;
        conversations.push({ id: otherId, nom: otherNom, unread, last: m });
      }
    });

  const thread = selectedId
    ? messages
        .filter(m => m.expediteur_id === selectedId || m.destinataire_id === selectedId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    : [];

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <h2 style={s.h2}>Messages</h2>
      </div>

      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}

      {!loading && (
        <div style={{ display: 'flex', gap: 16, height: 460 }}>

          {/* Liste des conversations */}
          <div style={{ width: 220, borderRight: '1px solid #eee', overflowY: 'auto', paddingRight: 12, flexShrink: 0 }}>
            {conversations.length === 0 && <p style={s.empty}>Aucun message.</p>}
            {conversations.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{
                  padding: '10px 8px', borderRadius: 6, cursor: 'pointer', marginBottom: 4,
                  background: selectedId === c.id ? '#f0f2f5' : 'transparent',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: c.unread > 0 ? '700' : '400', fontSize: 14 }}>{c.nom}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.last.contenu.slice(0, 28)}{c.last.contenu.length > 28 ? '…' : ''}
                  </div>
                </div>
                {c.unread > 0 && (
                  <span style={{ background: '#dc3545', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: '700', flexShrink: 0, marginLeft: 6 }}>
                    {c.unread}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Thread sélectionné */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {!selectedId && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={s.empty}>Sélectionnez une conversation.</p>
              </div>
            )}
            {selectedId && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
                  {thread.map(m => {
                    const mine = m.expediteur_id === user?.id;
                    return (
                      <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                        <div style={{
                          maxWidth: '70%',
                          background: mine ? '#1a1a2e' : '#e9ecef',
                          color: mine ? '#fff' : '#333',
                          borderRadius: mine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                          padding: '8px 12px', fontSize: 14,
                        }}>
                          {!mine && (
                            <div style={{ fontSize: 11, fontWeight: '600', marginBottom: 3, opacity: 0.7 }}>
                              {m.expediteur_nom ?? '—'}
                            </div>
                          )}
                          <div style={{ whiteSpace: 'pre-wrap' }}>{m.contenu}</div>
                          {m.created_at && (
                            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6, textAlign: 'right' }}>
                              {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid #eee' }}>
                  <input
                    style={{ ...s.input, flex: 1 }}
                    placeholder="Répondre..."
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                  />
                  <button type="submit" style={{ ...s.btn, ...s.btnPrimary, marginRight: 0 }} disabled={sending || !reply.trim()}>
                    {sending ? '...' : 'Envoyer'}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

const TABS = [
  { key: 'residents',  label: 'Résidents' },
  { key: 'paiements',  label: 'Paiements' },
  { key: 'problemes',  label: 'Problèmes' },
  { key: 'annonces',   label: 'Annonces'  },
  { key: 'messages',   label: 'Messages'  },
];

export default function DashboardGestionnaire() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem('activeTab') || 'residents'
  );
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/api/messages')
      .then(({ data }) => setUnreadCount(data.filter(m => !m.lu).length))
      .catch(() => {});
  }, []);

  function handleTabChange(key) {
    localStorage.setItem('activeTab', key);
    setActiveTab(key);
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navTitle}>ResiConnect</span>
        {TABS.map(tab => (
          <button
            key={tab.key}
            style={activeTab === tab.key ? s.tabActive : s.tab}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
            {tab.key === 'messages' && unreadCount > 0 && (
              <span style={{ background: '#dc3545', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 11, fontWeight: '700', marginLeft: 6 }}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
        <span style={s.navSep} />
        <span style={{ fontSize: 13, color: '#ccc' }}>{user?.nom}</span>
        <button style={s.logoutBtn} onClick={logout}>Se déconnecter</button>
      </nav>

      <div style={s.section}>
        {activeTab === 'residents'  && <SectionResidents />}
        {activeTab === 'paiements'  && <SectionPaiements />}
        {activeTab === 'problemes'  && <SectionProblemes />}
        {activeTab === 'annonces'   && <SectionAnnonces />}
        {activeTab === 'messages'   && <SectionMessages onRead={() => setUnreadCount(0)} />}
      </div>
    </div>
  );
}
