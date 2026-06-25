import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const cs = {
  head:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  label:       { fontSize: 14, fontWeight: '700', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  formPanel:   { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 14 },
  formRow:     { marginBottom: 10 },
  lbl:         { display: 'block', marginBottom: 5, fontSize: 12.5, fontWeight: '600', color: '#475569' },
  input:       { padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13, width: '100%', boxSizing: 'border-box', background: '#fff', color: '#0f172a', fontFamily: 'inherit', outline: 'none' },
  select:      { padding: '8px 11px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 13, width: '100%', boxSizing: 'border-box', background: '#fff', color: '#0f172a', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' },
  btn:         { padding: '6px 12px', minHeight: 30, cursor: 'pointer', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: '600', fontFamily: 'inherit', marginRight: 4 },
  btnP:        { background: 'linear-gradient(135deg, #14b890, #0c9576)', color: '#fff', boxShadow: '0 4px 14px rgba(20,184,144,0.28)' },
  btnD:        { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' },
  btnAssign:   { background: '#ecfdf7', color: '#0c7860', border: '1px solid #a6f2da' },
  tableWrap:   { overflowX: 'auto' },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 },
  th:          { textAlign: 'left', padding: '9px 12px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '700', color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' },
  td:          { padding: '10px 12px', borderBottom: '1px solid #eef2f7', verticalAlign: 'middle', color: '#475569' },
  error:       { color: '#b91c1c', fontSize: 12, margin: '6px 0' },
  empty:       { color: '#64748b', fontSize: 12, textAlign: 'center', padding: '10px 0' },
};

export default function SectionAppartements({ residenceId }) {
  const { refreshResidences }           = useAuth();
  const [appartements, setAppartements] = useState([]);
  const [batiments, setBatiments]       = useState([]);
  const [residents, setResidents]       = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState({ numero: '', batiment_id: '' });
  const [submitting, setSubmitting]     = useState(false);
  const [assigningId, setAssigningId]   = useState(null);

  useEffect(() => {
    if (!residenceId) return;
    load();
    api.get(`/api/residences/${residenceId}/batiments`).then(r => setBatiments(r.data)).catch(() => {});
    api.get(`/api/residents?residence_id=${residenceId}`).then(r => setResidents(r.data)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cet appartement ?')) return;
    setError('');
    try {
      await api.delete(`/api/appartements/${id}`);
      load();
      refreshResidences();
    } catch (err) { setError(err.response?.data?.message || 'Erreur suppression.'); }
  }

  async function handleAssign(id, userId) {
    const userIdToSend = userId === '' ? null : parseInt(userId, 10);
    setError('');
    try {
      await api.put(`/api/appartements/${id}`, { user_id: userIdToSend });
      setAssigningId(null);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Erreur assignation.'); }
  }

  return (
    <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #e2e8f0' }}>
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
                  <td style={{ ...cs.td, color: '#0f172a', fontWeight: '600' }}>{a.numero}</td>
                  <td style={cs.td}>{a.batiment_nom ?? a.batiment?.nom ?? '—'}</td>
                  <td style={cs.td}>
                    {a.resident_nom ?? a.user?.nom
                      ? <span style={{ color: '#0c7860', fontWeight: '600' }}>{a.resident_nom ?? a.user?.nom}</span>
                      : <span style={{ color: '#94a3b8' }}>Libre</span>}
                  </td>
                  <td style={cs.td}>
                    {assigningId === a.id ? (
                      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <select
                          style={{ ...cs.select, width: 'auto', minWidth: 120 }}
                          defaultValue=""
                          onChange={e => handleAssign(a.id, e.target.value)}
                        >
                          <option value="">— Résident —</option>
                          {residents.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                        </select>
                        <button style={{ ...cs.btn, background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0' }} onClick={() => setAssigningId(null)}>✕</button>
                      </span>
                    ) : (
                      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button style={{ ...cs.btn, ...cs.btnAssign }} onClick={() => setAssigningId(a.id)}>
                          Assigner
                        </button>
                        <button style={{ ...cs.btn, ...cs.btnD }} onClick={() => handleDelete(a.id)}>
                          Supprimer
                        </button>
                      </span>
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
