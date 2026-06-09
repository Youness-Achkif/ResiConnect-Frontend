import React, { useState, useEffect } from 'react';
import api from '../services/api';

const s = {
  card:        { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' },
  cardHead:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  h2:          { margin: 0, fontSize: 17, fontWeight: '600', color: '#f1f5f9', letterSpacing: '-0.2px' },
  tableWrap:   { overflowX: 'auto' },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 680 },
  th:          { textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px' },
  td:          { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle', color: '#cbd5e1' },
  btn:         { padding: '6px 14px', minHeight: 32, cursor: 'pointer', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: '500', fontFamily: 'inherit', marginRight: 4 },
  btnAccept:   { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' },
  btnReject:   { background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.22)' },
  error:       { color: '#fca5a5', fontSize: 13, margin: '8px 0' },
  loading:     { color: '#475569', fontSize: 13, margin: '8px 0' },
  empty:       { color: '#475569', fontSize: 14, padding: '20px 0', textAlign: 'center' },
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
          <span style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '3px 12px', fontSize: 13, fontWeight: '600' }}>
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
                    <div style={{ fontWeight: '500', color: '#f1f5f9' }}>{d.resident_nom ?? d.user?.nom ?? '—'}</div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{d.resident_email ?? d.user?.email ?? ''}</div>
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
