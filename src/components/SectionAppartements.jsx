import React, { useState, useEffect } from 'react';
import api from '../services/api';

const cs = {
  head:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  label:       { fontSize: 14, fontWeight: '600', color: '#cbd5e1' },
  formPanel:   { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 14, marginBottom: 14 },
  formRow:     { marginBottom: 10 },
  lbl:         { display: 'block', marginBottom: 5, fontSize: 12, fontWeight: '500', color: '#94a3b8' },
  input:       { padding: '9px 12px', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13, width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontFamily: 'inherit', outline: 'none' },
  select:      { padding: '8px 11px', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13, width: '100%', boxSizing: 'border-box', background: '#1a1d27', color: '#e2e8f0', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' },
  btn:         { padding: '6px 12px', minHeight: 30, cursor: 'pointer', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: '500', fontFamily: 'inherit', marginRight: 4 },
  btnP:        { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' },
  btnD:        { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.22)' },
  btnAssign:   { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' },
  tableWrap:   { overflowX: 'auto' },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 },
  th:          { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', fontWeight: '600', color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' },
  td:          { padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle', color: '#cbd5e1' },
  error:       { color: '#fca5a5', fontSize: 12, margin: '6px 0' },
  empty:       { color: '#475569', fontSize: 12, textAlign: 'center', padding: '10px 0' },
};

export default function SectionAppartements({ residenceId }) {
  const [appartements, setAppartements] = useState([]);
  const [batiments, setBatiments]       = useState([]);
  const [residents, setResidents]       = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState({ numero: '', batiment_id: '' });
  const [submitting, setSubmitting]     = useState(false);
  const [assigningId, setAssigningId]   = useState(null);
  const [assignUserId, setAssignUserId] = useState('');

  useEffect(() => {
    if (!residenceId) return;
    load();
    api.get(`/api/residences/${residenceId}/batiments`).then(r => setBatiments(r.data)).catch(() => {});
    api.get(`/api/residents?residence_id=${residenceId}`).then(r => setResidents(r.data)).catch(() => {});
  }, [residenceId]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/api/residences/${residenceId}/appartements`);
      setAppartements(data);
    } catch { setError('Impossible de charger les appartements.'); }
    finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/api/residences/${residenceId}/appartements`, {
        numero: form.numero,
        ...(form.batiment_id && { batiment_id: parseInt(form.batiment_id, 10) }),
      });
      setForm({ numero: '', batiment_id: '' });
      setShowForm(false);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Erreur création.'); }
    finally { setSubmitting(false); }
  }

  async function handleAssign(id) {
    if (!assignUserId) return;
    setError('');
    try {
      await api.put(`/api/appartements/${id}`, { user_id: parseInt(assignUserId, 10) });
      setAssigningId(null);
      setAssignUserId('');
      load();
    } catch (err) { setError(err.response?.data?.message || 'Erreur assignation.'); }
  }

  return (
    <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={cs.head}>
        <span style={cs.label}>Appartements</span>
        <button style={{ ...cs.btn, ...cs.btnP }} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Annuler' : '+ Appartement'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={cs.formPanel}>
          <div style={cs.formRow}>
            <label style={cs.lbl}>Numéro</label>
            <input style={cs.input} value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} required placeholder="ex: A101" />
          </div>
          <div style={cs.formRow}>
            <label style={cs.lbl}>Bâtiment</label>
            <select style={cs.select} value={form.batiment_id} onChange={e => setForm({ ...form, batiment_id: e.target.value })}>
              <option value="">— Aucun bâtiment —</option>
              {batiments.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
            </select>
          </div>
          <button type="submit" style={{ ...cs.btn, ...cs.btnP }} disabled={submitting}>{submitting ? '...' : 'Créer'}</button>
        </form>
      )}

      {error && <p style={cs.error}>{error}</p>}
      {loading && <p style={cs.empty}>Chargement...</p>}
      {!loading && appartements.length === 0 && <p style={cs.empty}>Aucun appartement.</p>}

      {appartements.length > 0 && (
        <div style={cs.tableWrap}>
          <table style={cs.table}>
            <thead>
              <tr>
                <th style={cs.th}>Numéro</th>
                <th style={cs.th}>Bâtiment</th>
                <th style={cs.th}>Résident</th>
                <th style={cs.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appartements.map(a => (
                <tr key={a.id}>
                  <td style={{ ...cs.td, color: '#f1f5f9', fontWeight: '500' }}>{a.numero}</td>
                  <td style={cs.td}>{a.batiment_nom ?? a.batiment?.nom ?? '—'}</td>
                  <td style={cs.td}>
                    {a.resident_nom ?? a.user?.nom
                      ? <span style={{ color: '#a5b4fc' }}>{a.resident_nom ?? a.user?.nom}</span>
                      : <span style={{ color: '#475569' }}>Libre</span>}
                  </td>
                  <td style={cs.td}>
                    {assigningId === a.id ? (
                      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <select
                          style={{ ...cs.select, width: 'auto', minWidth: 120 }}
                          value={assignUserId}
                          onChange={e => setAssignUserId(e.target.value)}
                        >
                          <option value="">— Résident —</option>
                          {residents.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                        </select>
                        <button style={{ ...cs.btn, ...cs.btnP }} onClick={() => handleAssign(a.id)}>OK</button>
                        <button style={{ ...cs.btn, background: 'transparent', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setAssigningId(null)}>✕</button>
                      </span>
                    ) : (
                      <button style={{ ...cs.btn, ...cs.btnAssign }} onClick={() => { setAssigningId(a.id); setAssignUserId(''); }}>
                        Assigner
                      </button>
                    )}
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
