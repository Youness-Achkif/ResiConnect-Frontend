import React, { useState, useEffect } from 'react';
import api from '../services/api';

const s = {
  card:        { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)' },
  cardHead:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  h2:          { margin: 0, fontSize: 18, fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  tableWrap:   { overflowX: 'auto' },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 680 },
  th:          { textAlign: 'left', padding: '11px 14px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '700', whiteSpace: 'nowrap', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' },
  td:          { padding: '12px 14px', borderBottom: '1px solid #eef2f7', verticalAlign: 'middle', color: '#475569' },
  btn:         { padding: '6px 14px', minHeight: 32, cursor: 'pointer', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: '600', fontFamily: 'inherit', marginRight: 4 },
  btnAccept:   { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' },
  btnReject:   { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' },
  error:       { color: '#b91c1c', fontSize: 13, margin: '8px 0' },
  loading:     { color: '#64748b', fontSize: 13, margin: '8px 0' },
  empty:       { color: '#64748b', fontSize: 14, padding: '20px 0', textAlign: 'center' },
};

export default function SectionDemandes({ refreshResidences }) {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetchDemandes();
    const id = setInterval(fetchDemandes, 30000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchDemandes() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/join-requests');
      setDemandes(data);
    } catch {
      setError('Impossible de charger les demandes.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id) {
    setError('');
    try {
      await api.put(`/api/join-requests/${id}/accept`);
      fetchDemandes();
      refreshResidences?.();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'acceptation.");
    }
  }

  async function handleReject(id) {
    setError('');
    try {
      await api.put(`/api/join-requests/${id}/reject`);
      fetchDemandes();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du refus.');
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <h2 style={s.h2}>Demandes de rejoindre</h2>
        {demandes.length > 0 && (
          <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 20, padding: '3px 12px', fontSize: 13, fontWeight: '600' }}>
            {demandes.length} en attente
          </span>
        )}
      </div>

      {error   && <p style={s.error}>{error}</p>}
      {loading && <p style={s.loading}>Chargement...</p>}
      {!loading && demandes.length === 0 && <p style={s.empty}>Aucune demande en attente.</p>}

      {demandes.length > 0 && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Résident</th>
                <th style={s.th}>Résidence</th>
                <th style={s.th}>Appartement</th>
                <th style={s.th}>Message</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map(d => (
                <tr key={d.id}>
                  <td style={s.td}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{d.resident_nom ?? d.user?.nom ?? '—'}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{d.resident_email ?? d.user?.email ?? ''}</div>
                  </td>
                  <td style={s.td}>{d.residence_nom ?? d.residence?.nom ?? '—'}</td>
                  <td style={s.td}>{d.appartement_numero ?? d.appartement?.numero ?? <span style={{ color: '#334155' }}>—</span>}</td>
                  <td style={{ ...s.td, maxWidth: 220, color: '#64748b' }}>
                    {d.message ? (
                      <span title={d.message}>{d.message.length > 60 ? d.message.slice(0, 60) + '…' : d.message}</span>
                    ) : <span style={{ color: '#334155' }}>—</span>}
                  </td>
                  <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                    {d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={s.td}>
                    <button style={{ ...s.btn, ...s.btnAccept }} onClick={() => handleAccept(d.id)}>
                      Accepter
                    </button>
                    <button style={{ ...s.btn, ...s.btnReject }} onClick={() => handleReject(d.id)}>
                      Refuser
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
