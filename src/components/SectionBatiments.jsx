import React, { useState, useEffect } from 'react';
import api from '../services/api';

const cs = {
  head:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label:     { fontSize: 14, fontWeight: '600', color: '#cbd5e1' },
  formPanel: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 14, marginBottom: 12 },
  formRow:   { marginBottom: 10 },
  lbl:       { display: 'block', marginBottom: 5, fontSize: 12, fontWeight: '500', color: '#94a3b8' },
  input:     { padding: '9px 12px', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13, width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontFamily: 'inherit', outline: 'none' },
  btn:       { padding: '6px 12px', minHeight: 30, cursor: 'pointer', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: '500', fontFamily: 'inherit', marginRight: 4 },
  btnP:      { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' },
  btnD:      { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.22)' },
  item:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 6 },
  error:     { color: '#fca5a5', fontSize: 12, margin: '6px 0' },
  empty:     { color: '#475569', fontSize: 12, textAlign: 'center', padding: '8px 0' },
};

export default function SectionBatiments({ residenceId }) {
  const [batiments, setBatiments]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [nom, setNom]               = useState('');
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (residenceId) load(); }, [residenceId]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/api/residences/${residenceId}/batiments`);
      setBatiments(data);
    } catch { setError('Impossible de charger les bâtiments.'); }
    finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/api/residences/${residenceId}/batiments`, { nom });
      setNom(''); setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Erreur création.'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce bâtiment ?')) return;
    try { await api.delete(`/api/batiments/${id}`); load(); }
    catch { setError('Erreur suppression.'); }
  }

  return (
    <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={cs.head}>
        <span style={cs.label}>Bâtiments</span>
        <button style={{ ...cs.btn, ...cs.btnP }} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Annuler' : '+ Bâtiment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={cs.formPanel}>
          <div style={cs.formRow}>
            <label style={cs.lbl}>Nom</label>
            <input style={cs.input} value={nom} onChange={e => setNom(e.target.value)} required placeholder="ex: Bâtiment A" />
          </div>
          <button type="submit" style={{ ...cs.btn, ...cs.btnP }} disabled={submitting}>{submitting ? '...' : 'Créer'}</button>
        </form>
      )}

      {error && <p style={cs.error}>{error}</p>}
      {loading && <p style={cs.empty}>Chargement...</p>}
      {!loading && batiments.length === 0 && <p style={cs.empty}>Aucun bâtiment.</p>}

      {batiments.map(b => (
        <div key={b.id} style={cs.item}>
          <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: '500' }}>{b.nom}</span>
          <button style={{ ...cs.btn, ...cs.btnD }} onClick={() => handleDelete(b.id)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
}
