import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─── Styles (cohérent avec DashboardGestionnaire) ─────────────────────────────

const s = {
  page:       { fontFamily: 'sans-serif', minHeight: '100vh', background: '#f0f2f5' },
  nav:        { background: '#16213e', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 8, height: 56, flexWrap: 'wrap' },
  navTitle:   { fontWeight: 'bold', fontSize: 17, marginRight: 16 },
  navSep:     { flex: 1 },
  tab:        { background: 'none', border: '1px solid rgba(255,255,255,0.4)', color: '#ccc', padding: '5px 14px', cursor: 'pointer', borderRadius: 4, fontSize: 13 },
  tabActive:  { background: '#fff', border: '1px solid #fff', color: '#16213e', padding: '5px 14px', cursor: 'pointer', borderRadius: 4, fontSize: 13, fontWeight: '600' },
  subTab:     { background: 'none', border: '1px solid #ccc', color: '#555', padding: '4px 12px', cursor: 'pointer', borderRadius: 4, fontSize: 13, marginRight: 6 },
  subTabActive: { background: '#16213e', border: '1px solid #16213e', color: '#fff', padding: '4px 12px', cursor: 'pointer', borderRadius: 4, fontSize: 13, marginRight: 6, fontWeight: '600' },
  logoutBtn:  { background: '#c0392b', border: 'none', color: '#fff', padding: '5px 14px', cursor: 'pointer', borderRadius: 4, fontSize: 13, marginLeft: 8 },
  section:    { padding: 24, maxWidth: 900, margin: '0 auto' },
  card:       { background: '#fff', borderRadius: 8, padding: 20, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  cardHead:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  h2:         { margin: 0, fontSize: 18 },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th:         { textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #eee', background: '#fafafa', fontWeight: '600' },
  td:         { padding: '8px 12px', borderBottom: '1px solid #eee', verticalAlign: 'middle' },
  btn:        { padding: '5px 12px', cursor: 'pointer', borderRadius: 4, border: 'none', fontSize: 13, marginRight: 4 },
  btnPrimary: { background: '#16213e', color: '#fff' },
  formPanel:  { background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 6, padding: 16, marginBottom: 16 },
  formRow:    { marginBottom: 12 },
  label:      { display: 'block', marginBottom: 4, fontSize: 13, fontWeight: '500' },
  input:      { padding: '7px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, width: '100%', boxSizing: 'border-box' },
  error:      { color: '#dc3545', fontSize: 13, margin: '8px 0' },
  loading:    { color: '#888', fontSize: 13, margin: '8px 0' },
  empty:      { color: '#aaa', fontSize: 14, padding: '12px 0' },
  badge:      { padding: '2px 9px', borderRadius: 12, fontSize: 12, fontWeight: '600', display: 'inline-block' },
};

const BADGE_COLORS = {
  payé:         { background: '#d4edda', color: '#155724' },
  'en attente': { background: '#fff3cd', color: '#856404' },
  refusé:       { background: '#f8d7da', color: '#721c24' },
  ouvert:       { background: '#cce5ff', color: '#004085' },
  'en cours':   { background: '#fff3cd', color: '#856404' },
  résolu:       { background: '#d4edda', color: '#155724' },
  basse:        { background: '#e2e3e5', color: '#383d41' },
  normale:      { background: '#cce5ff', color: '#004085' },
  haute:        { background: '#f8d7da', color: '#721c24' },
  urgente:      { background: '#721c24', color: '#fff' },
};

function Badge({ value }) {
  const colors = BADGE_COLORS[value] || { background: '#eee', color: '#555' };
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
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Montant</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {paiements.map(p => (
              <tr key={p.id}>
                <td style={s.td}>{p.montant} €</td>
                <td style={s.td}>
                  {p.date_paiement ? new Date(p.date_paiement).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td style={s.td}><Badge value={p.statut} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Section Mes Problèmes ────────────────────────────────────────────────────

const PRIORITES = ['basse', 'normale', 'haute', 'urgente'];

function SectionProblemes() {
  const [problemes, setProblemes]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ titre: '', description: '', priorite: 'normale' });

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

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/problemes', form);
      setForm({ titre: '', description: '', priorite: 'normale' });
      setShowForm(false);
      fetchProblemes();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du signalement.');
    } finally {
      setSubmitting(false);
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
              style={{ ...s.input, height: 80, resize: 'vertical' }}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div style={s.formRow}>
            <label style={s.label}>Priorité</label>
            <select
              style={{ ...s.input, width: 'auto' }}
              value={form.priorite}
              onChange={e => setForm({ ...form, priorite: e.target.value })}
            >
              {PRIORITES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={submitting}>
            {submitting ? 'Envoi...' : 'Signaler'}
          </button>
        </form>
      )}

      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}
      {!loading && problemes.length === 0 && <p style={s.empty}>Aucun problème signalé.</p>}

      {problemes.length > 0 && (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Titre</th>
              <th style={s.th}>Description</th>
              <th style={s.th}>Statut</th>
              <th style={s.th}>Priorité</th>
            </tr>
          </thead>
          <tbody>
            {problemes.map(p => (
              <tr key={p.id}>
                <td style={s.td}>{p.titre}</td>
                <td style={{ ...s.td, maxWidth: 260, color: '#555' }}>{p.description ?? '—'}</td>
                <td style={s.td}><Badge value={p.statut} /></td>
                <td style={s.td}><Badge value={p.priorite} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Section Messagerie ───────────────────────────────────────────────────────

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
    <>
      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}
      {!loading && annonces.length === 0 && <p style={s.empty}>Aucune annonce pour le moment.</p>}

      {annonces.map(a => (
        <div key={a.id} style={{ borderBottom: '1px solid #eee', paddingBottom: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: '600', marginBottom: 4 }}>{a.titre}</div>
          <div style={{ fontSize: 14, color: '#444', whiteSpace: 'pre-wrap' }}>{a.contenu}</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
            {a.date ?? a.created_at ?? ''}
          </div>
        </div>
      ))}
    </>
  );
}

function SectionMessages() {
  const [messages, setMessages]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [contenu, setContenu]           = useState('');
  const [sending, setSending]           = useState(false);
  const [gestionnaireId, setGestionnaireId] = useState(null);
  const { user }                        = useAuth();
  const bottomRef                       = useRef(null);

  useEffect(() => {
    fetchMessages();
    api.get('/api/auth/gestionnaire')
      .then(({ data }) => setGestionnaireId(data.id))
      .catch(() => setError('Impossible de récupérer le destinataire.'));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/messages');
      setMessages(data);
    } catch {
      setError('Impossible de charger les messages.');
    } finally {
      setLoading(false);
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
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  }

  const isMe = (msg) => msg.expediteur_id === user?.id || msg.role === 'resident';

  return (
    <>
      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}

      <div style={{ height: 340, overflowY: 'auto', border: '1px solid #eee', borderRadius: 6, padding: 12, marginBottom: 12, background: '#fafafa' }}>
        {messages.length === 0 && !loading && (
          <p style={s.empty}>Aucun message. Commencez la conversation.</p>
        )}
        {messages.map(m => {
          const mine = isMe(m);
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              <div style={{
                maxWidth: '70%',
                background: mine ? '#16213e' : '#e9ecef',
                color: mine ? '#fff' : '#333',
                borderRadius: mine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                padding: '8px 12px',
                fontSize: 14,
              }}>
                {!mine && (
                  <div style={{ fontSize: 11, fontWeight: '600', marginBottom: 3, opacity: 0.7 }}>
                    {m.expediteur_nom ?? 'Gestionnaire'}
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

      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
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
    </>
  );
}

function SectionMessagerie() {
  const [subTab, setSubTab] = useState(
    () => localStorage.getItem('resident_subTab') || 'annonces'
  );

  function handleSubTab(key) {
    localStorage.setItem('resident_subTab', key);
    setSubTab(key);
  }

  return (
    <div style={s.card}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ ...s.h2, marginBottom: 12 }}>Messagerie</h2>
        <button style={subTab === 'annonces' ? s.subTabActive : s.subTab} onClick={() => handleSubTab('annonces')}>
          Annonces
        </button>
        <button style={subTab === 'messages' ? s.subTabActive : s.subTab} onClick={() => handleSubTab('messages')}>
          Messages
        </button>
      </div>

      {subTab === 'annonces' && <SectionAnnonces />}
      {subTab === 'messages' && <SectionMessages />}
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

const TABS = [
  { key: 'paiements',  label: 'Mes paiements'  },
  { key: 'problemes',  label: 'Mes problèmes'  },
  { key: 'messagerie', label: 'Messagerie'      },
];

export default function DashboardResident() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem('resident_activeTab') || 'paiements'
  );

  function handleTabChange(key) {
    localStorage.setItem('resident_activeTab', key);
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
          </button>
        ))}
        <span style={s.navSep} />
        <span style={{ fontSize: 13, color: '#ccc' }}>{user?.nom}</span>
        <button style={s.logoutBtn} onClick={logout}>Se déconnecter</button>
      </nav>

      <div style={s.section}>
        {activeTab === 'paiements'  && <SectionPaiements />}
        {activeTab === 'problemes'  && <SectionProblemes />}
        {activeTab === 'messagerie' && <SectionMessagerie />}
      </div>
    </div>
  );
}
