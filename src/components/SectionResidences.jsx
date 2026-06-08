import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SectionBatiments from './SectionBatiments';
import SectionAppartements from './SectionAppartements';

const cs = {
  card:      { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' },
  cardHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  h2:        { margin: 0, fontSize: 17, fontWeight: '600', color: '#f1f5f9', letterSpacing: '-0.2px' },
  formPanel: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, marginBottom: 20 },
  formRow:   { marginBottom: 14 },
  lbl:       { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: '500', color: '#94a3b8' },
  input:     { padding: '10px 14px', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontFamily: 'inherit', outline: 'none' },
  btn:       { padding: '8px 14px', minHeight: 36, cursor: 'pointer', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: '500', fontFamily: 'inherit', marginRight: 4 },
  btnP:      { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 2px 12px rgba(99,102,241,0.3)' },
  btnD:      { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.22)' },
  resCard:   { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 20, marginBottom: 14 },
  resName:   { margin: '0 0 6px', fontSize: 16, fontWeight: '600', color: '#f1f5f9' },
  resAddr:   { margin: 0, fontSize: 13, color: '#64748b' },
  statsRow:  { display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 14, marginBottom: 14 },
  stat:      { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 8, padding: '8px 14px', textAlign: 'center' },
  statVal:   { fontSize: 18, fontWeight: '700', color: '#a5b4fc' },
  statLbl:   { fontSize: 11, color: '#64748b', marginTop: 2 },
  actRow:    { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  expandBtn: { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' },
  error:     { color: '#fca5a5', fontSize: 13, margin: '8px 0' },
  loading:   { color: '#475569', fontSize: 13, margin: '8px 0' },
  empty:     { color: '#475569', fontSize: 14, padding: '20px 0', textAlign: 'center' },
  welcome:   { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 12, padding: '18px 20px', marginBottom: 20 },
};

export default function SectionResidences({ welcomeMode }) {
  const [residences, setResidences]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ nom: '', adresse: '' });
  const [submitting, setSubmitting]   = useState(false);
  const [expandedId, setExpandedId]   = useState(null);
  const [expandedSection, setExpandedSection] = useState('batiments');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/residences');
      setResidences(data);
    } catch { setError('Impossible de charger les résidences.'); }
    finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/residences', form);
      setForm({ nom: '', adresse: '' });
      setShowForm(false);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Erreur création.'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cette résidence et toutes ses données ?')) return;
    try { await api.delete(`/api/residences/${id}`); load(); }
    catch { setError('Erreur suppression.'); }
  }

  function toggleExpand(id, section = 'batiments') {
    if (expandedId === id && expandedSection === section) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setExpandedSection(section);
    }
  }

  return (
    <div style={cs.card}>
      <div style={cs.cardHead}>
        <h2 style={cs.h2}>Résidences</h2>
        <button style={{ ...cs.btn, ...cs.btnP }} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Annuler' : '+ Nouvelle résidence'}
        </button>
      </div>

      {welcomeMode && (
        <div style={cs.welcome}>
          <p style={{ margin: 0, color: '#a5b4fc', fontWeight: '600', fontSize: 15 }}>Bienvenue sur ResiConnect !</p>
          <p style={{ margin: '6px 0 0', color: 'rgba(165,180,252,0.7)', fontSize: 13 }}>
            Commencez par créer votre première résidence.
          </p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} style={cs.formPanel}>
          <div style={cs.formRow}>
            <label style={cs.lbl}>Nom de la résidence</label>
            <input style={cs.input} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required placeholder="ex: Résidence Les Pins" />
          </div>
          <div style={cs.formRow}>
            <label style={cs.lbl}>Adresse</label>
            <input style={cs.input} value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} required placeholder="ex: 12 rue de la Paix, Paris" />
          </div>
          <button type="submit" style={{ ...cs.btn, ...cs.btnP }} disabled={submitting}>
            {submitting ? 'Création...' : 'Créer'}
          </button>
        </form>
      )}

      {error   && <p style={cs.error}>{error}</p>}
      {loading && <p style={cs.loading}>Chargement...</p>}
      {!loading && residences.length === 0 && !welcomeMode && <p style={cs.empty}>Aucune résidence.</p>}

      {residences.map(r => (
        <div key={r.id} style={cs.resCard}>
          <p style={cs.resName}>{r.nom}</p>
          <p style={cs.resAddr}>{r.adresse}</p>

          <div style={cs.statsRow}>
            {r.nb_batiments    != null && <div style={cs.stat}><div style={cs.statVal}>{r.nb_batiments}</div><div style={cs.statLbl}>Bâtiments</div></div>}
            {r.nb_appartements != null && <div style={cs.stat}><div style={cs.statVal}>{r.nb_appartements}</div><div style={cs.statLbl}>Appartements</div></div>}
            {r.nb_residents    != null && <div style={cs.stat}><div style={cs.statVal}>{r.nb_residents}</div><div style={cs.statLbl}>Résidents</div></div>}
          </div>

          <div style={cs.actRow}>
            <button
              style={{ ...cs.expandBtn, ...(expandedId === r.id && expandedSection === 'batiments' ? { color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' } : {}) }}
              onClick={() => toggleExpand(r.id, 'batiments')}
            >
              {expandedId === r.id && expandedSection === 'batiments' ? '▾' : '▸'} Bâtiments
            </button>
            <button
              style={{ ...cs.expandBtn, ...(expandedId === r.id && expandedSection === 'appartements' ? { color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' } : {}) }}
              onClick={() => toggleExpand(r.id, 'appartements')}
            >
              {expandedId === r.id && expandedSection === 'appartements' ? '▾' : '▸'} Appartements
            </button>
            <button style={{ ...cs.btn, ...cs.btnD, minHeight: 30, padding: '5px 12px' }} onClick={() => handleDelete(r.id)}>
              Supprimer
            </button>
          </div>

          {expandedId === r.id && expandedSection === 'batiments'    && <SectionBatiments    residenceId={r.id} />}
          {expandedId === r.id && expandedSection === 'appartements' && <SectionAppartements residenceId={r.id} />}
        </div>
      ))}
    </div>
  );
}
