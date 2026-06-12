import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const s = {
  card:       { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' },
  cardHead:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  h2:         { margin: 0, fontSize: 17, fontWeight: '600', color: '#f1f5f9', letterSpacing: '-0.2px' },
  tableWrap:  { overflowX: 'auto' },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 620 },
  th:         { textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.6px' },
  td:         { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'middle', color: '#cbd5e1' },
  badge:      { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: '600', display: 'inline-block' },
  btn:        { padding: '8px 14px', minHeight: 36, cursor: 'pointer', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: '500', fontFamily: 'inherit', marginRight: 4 },
  btnNeutral: { background: 'rgba(255,255,255,0.07)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' },
  error:      { color: '#fca5a5', fontSize: 13, margin: '8px 0' },
  loading:    { color: '#475569', fontSize: 13, margin: '8px 0' },
  empty:      { color: '#475569', fontSize: 14, padding: '20px 0', textAlign: 'center' },
};

const BADGE_TYPE = {
  famille:     { background: 'rgba(34,197,94,0.15)',   color: '#4ade80',  border: '1px solid rgba(34,197,94,0.3)'    },
  ami:         { background: 'rgba(99,102,241,0.15)',  color: '#a5b4fc',  border: '1px solid rgba(99,102,241,0.3)'   },
  livreur:     { background: 'rgba(245,158,11,0.15)',  color: '#fbbf24',  border: '1px solid rgba(245,158,11,0.3)'   },
  prestataire: { background: 'rgba(139,92,246,0.15)',  color: '#c4b5fd',  border: '1px solid rgba(139,92,246,0.3)'   },
  autre:       { background: 'rgba(100,116,139,0.15)', color: '#94a3b8',  border: '1px solid rgba(100,116,139,0.25)' },
};

const BADGE_STATUT = {
  'autorisé': { background: 'rgba(34,197,94,0.15)',  color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)'  },
  'refusé':   { background: 'rgba(239,68,68,0.15)',  color: '#f87171', border: '1px solid rgba(239,68,68,0.3)'  },
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
            style={{ ...s.btn, ...s.btnNeutral, padding: '3px 10px', minHeight: 26, fontSize: 12 }}
            onClick={() => fetchHistorique(true)}
            disabled={noResidence}
          >
            🔄 Actualiser
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
                        <td style={{ ...s.td, whiteSpace: 'nowrap', color: '#94a3b8' }}>
                          {formatDateFr(h.date_entree)}
                        </td>
                        <td style={{ ...s.td, color: '#f1f5f9', fontWeight: '500' }}>
                          {h.visiteur_nom ?? (
                            <span style={{ color: '#475569', fontStyle: 'italic' }}>QR invalide</span>
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
