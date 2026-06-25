import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const s = {
  card:       { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)' },
  cardHead:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  h2:         { margin: 0, fontSize: 18, fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  tableWrap:  { overflowX: 'auto' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 620 },
  th:         { textAlign: 'left', padding: '11px 14px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '700', whiteSpace: 'nowrap', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' },
  td:         { padding: '12px 14px', borderBottom: '1px solid #eef2f7', verticalAlign: 'middle', color: '#475569' },
  badge:      { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: '600', display: 'inline-block' },
  btn:        { padding: '8px 14px', minHeight: 36, cursor: 'pointer', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: '600', fontFamily: 'inherit', marginRight: 4 },
  btnNeutral: { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
  error:      { color: '#b91c1c', fontSize: 13, margin: '8px 0' },
  loading:    { color: '#64748b', fontSize: 13, margin: '8px 0' },
  empty:      { color: '#64748b', fontSize: 14, padding: '20px 0', textAlign: 'center' },
};

const BADGE_TYPE = {
  famille:     { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' },
  ami:         { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
  livreur:     { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' },
  prestataire: { background: '#ecfdf7', color: '#0c7860', border: '1px solid #a6f2da' },
  autre:       { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
};

const BADGE_STATUT = {
  'autorisé': { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' },
  'refusé':   { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' },
};

function formatDateFr(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' '
    + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
}

export default function SectionHistorique() {
  const { selectedResidence }         = useAuth();
  const [historique, setHistorique]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    if (selectedResidence?.id) fetchHistorique(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResidence?.id]);

  async function fetchHistorique(isInitial = true) {
    if (!selectedResidence?.id) return;
    if (isInitial) setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/api/historique-acces?residence_id=${selectedResidence.id}`);
      setHistorique([...data].sort((a, b) => new Date(b.date_entree) - new Date(a.date_entree)));
    } catch {
      setError("Impossible de charger l'historique.");
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  const noResidence = !selectedResidence?.id;

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={s.h2}>Historique des accès</h2>
          <button
            style={{ ...s.btn, ...s.btnNeutral, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', minHeight: 28, fontSize: 12 }}
            onClick={() => fetchHistorique(true)}
            disabled={noResidence}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M21 12a9 9 0 11-2.64-6.36M21 4v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      {noResidence && (
        <p style={s.empty}>Sélectionnez une résidence pour afficher l'historique.</p>
      )}

      {!noResidence && (
        <>
          {error   && <p style={s.error}>{error}</p>}
          {loading && <p style={s.loading}>Chargement...</p>}
          {!loading && historique.length === 0 && (
            <p style={s.empty}>Aucun accès enregistré pour cette résidence.</p>
          )}

          {historique.length > 0 && (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Date / Heure</th>
                    <th style={s.th}>Visiteur</th>
                    <th style={s.th}>Type</th>
                    <th style={s.th}>Résident</th>
                    <th style={s.th}>Statut</th>
                    <th style={s.th}>Motif</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.map(h => {
                    const typeKey    = (h.type || '').toLowerCase();
                    const typeBadge  = BADGE_TYPE[typeKey] || BADGE_TYPE.autre;
                    const statutBadge = BADGE_STATUT[h.statut] || BADGE_STATUT['refusé'];
                    return (
                      <tr key={h.id}>
                        <td style={{ ...s.td, whiteSpace: 'nowrap', color: '#64748b' }}>
                          {formatDateFr(h.date_entree)}
                        </td>
                        <td style={{ ...s.td, color: '#0f172a', fontWeight: '600' }}>
                          {h.visiteur_nom ?? (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>QR invalide</span>
                          )}
                        </td>
                        <td style={s.td}>
                          {h.type
                            ? <span style={{ ...s.badge, ...typeBadge }}>{h.type}</span>
                            : <span style={{ color: '#334155' }}>—</span>}
                        </td>
                        <td style={s.td}>{h.resident_nom ?? '—'}</td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, ...statutBadge }}>{h.statut}</span>
                        </td>
                        <td style={{ ...s.td, color: '#64748b', maxWidth: 200 }}>
                          {h.statut === 'refusé' && h.raison_refus ? (
                            <span title={h.raison_refus}>
                              {h.raison_refus.length > 50
                                ? h.raison_refus.slice(0, 50) + '…'
                                : h.raison_refus}
                            </span>
                          ) : (
                            <span style={{ color: '#334155' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
