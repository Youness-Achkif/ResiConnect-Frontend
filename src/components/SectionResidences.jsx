import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SectionBatiments from './SectionBatiments';
import SectionAppartements from './SectionAppartements';

const cs = {
  card:      { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)' },
  cardHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  h2:        { margin: 0, fontSize: 18, fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  formPanel: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 20 },
  formRow:   { marginBottom: 14 },
  lbl:       { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: '600', color: '#475569' },
  input:     { padding: '10px 14px', border: '1.5px solid #cbd5e1', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', background: '#fff', color: '#0f172a', fontFamily: 'inherit', outline: 'none' },
  btn:       { padding: '8px 14px', minHeight: 36, cursor: 'pointer', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: '600', fontFamily: 'inherit', marginRight: 4 },
  btnP:      { background: 'linear-gradient(135deg, #14b890, #0c9576)', color: '#fff', boxShadow: '0 4px 14px rgba(20,184,144,0.28)' },
  btnD:      { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' },
  resCard:   { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, marginBottom: 14, boxShadow: '0 1px 2px rgba(15,23,42,0.05)' },
  resName:   { margin: '0 0 6px', fontSize: 16, fontWeight: '700', color: '#0f172a' },
  resAddr:   { margin: 0, fontSize: 13, color: '#64748b' },
  statsRow:  { display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 14, marginBottom: 14 },
  stat:      { background: '#ecfdf7', border: '1px solid #a6f2da', borderRadius: 10, padding: '8px 16px', textAlign: 'center' },
  statVal:   { fontSize: 18, fontWeight: '800', color: '#0c7860' },
  statLbl:   { fontSize: 11, color: '#64748b', marginTop: 2 },
  actRow:    { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  expandBtn: { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' },
  error:     { color: '#b91c1c', fontSize: 13, margin: '8px 0' },
  loading:   { color: '#64748b', fontSize: 13, margin: '8px 0' },
  empty:     { color: '#64748b', fontSize: 14, padding: '20px 0', textAlign: 'center' },
  welcome:   { background: '#ecfdf7', border: '1px solid #a6f2da', borderRadius: 12, padding: '18px 20px', marginBottom: 20 },
};

export default function SectionResidences({ welcomeMode }) {
  const { refreshResidences }         = useAuth();
  const [residences, setResidences]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ nom: '', adresse: '' });
  const [submitting, setSubmitting]   = useState(false);
  const [expandedId, setExpandedId]         = useState(null);
  const [expandedSection, setExpandedSection] = useState('batiments');
  const [copiedId, setCopiedId]             = useState(null);
  const [pinFormId, setPinFormId]           = useState(null);
  const [pin, setPin]                       = useState('');
  const [pinMsg, setPinMsg]                 = useState(null);
  const [pinSubmitting, setPinSubmitting]   = useState(false);

  function handleCopy(code, id) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {});
  }

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
      refreshResidences();
    } catch (err) { setError(err.response?.data?.message || 'Erreur création.'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer cette résidence et toutes ses données ?')) return;
    try { await api.delete(`/api/residences/${id}`); load(); refreshResidences(); }
    catch { setError('Erreur suppression.'); }
  }

  function togglePinForm(id) {
    if (pinFormId === id) {
      setPinFormId(null);
    } else {
      setPinFormId(id);
      setPin('');
      setPinMsg(null);
    }
  }

  async function handlePinSubmit(e, residenceId) {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) {
      setPinMsg({ type: 'error', text: 'Le PIN doit contenir 4 à 6 chiffres numériques.' });
      return;
    }
    setPinSubmitting(true);
    setPinMsg(null);
    try {
      await api.put(`/api/residences/${residenceId}/pin`, { pin });
      setPinMsg({ type: 'success', text: 'PIN mis à jour.' });
      setPin('');
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || err.response?.data?.error;
      if (status === 400) setPinMsg({ type: 'error', text: msg || 'PIN invalide (4 à 6 chiffres).' });
      else if (status === 403) setPinMsg({ type: 'error', text: 'Accès refusé à cette résidence.' });
      else setPinMsg({ type: 'error', text: msg || 'Erreur lors de la mise à jour.' });
    } finally {
      setPinSubmitting(false);
    }
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
          <p style={{ margin: 0, color: '#0c7860', fontWeight: '700', fontSize: 15 }}>Bienvenue sur ResiConnect !</p>
          <p style={{ margin: '6px 0 0', color: '#0c9576', fontSize: 13 }}>
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

          {r.code && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>Code :</span>
              <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: '700', color: '#0c7860', background: '#ecfdf7', border: '1px solid #a6f2da', borderRadius: 6, padding: '3px 10px', letterSpacing: '0.5px' }}>
                {r.code}
              </span>
              <button
                onClick={() => handleCopy(r.code, r.id)}
                style={{ padding: '4px 10px', border: copiedId === r.id ? '1px solid #bbf7d0' : '1px solid #e2e8f0', borderRadius: 6, background: copiedId === r.id ? '#dcfce7' : '#f1f5f9', color: copiedId === r.id ? '#15803d' : '#475569', fontSize: 12, fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
              >
                {copiedId === r.id ? 'Copié !' : 'Copier'}
              </button>
            </div>
          )}

          <div style={cs.actRow}>
            <button
              style={{ ...cs.expandBtn, ...(expandedId === r.id && expandedSection === 'batiments' ? { color: '#0c7860', border: '1px solid #a6f2da', background: '#ecfdf7' } : {}) }}
              onClick={() => toggleExpand(r.id, 'batiments')}
            >
              {expandedId === r.id && expandedSection === 'batiments' ? '▾' : '▸'} Bâtiments
            </button>
            <button
              style={{ ...cs.expandBtn, ...(expandedId === r.id && expandedSection === 'appartements' ? { color: '#0c7860', border: '1px solid #a6f2da', background: '#ecfdf7' } : {}) }}
              onClick={() => toggleExpand(r.id, 'appartements')}
            >
              {expandedId === r.id && expandedSection === 'appartements' ? '▾' : '▸'} Appartements
            </button>
            <button
              style={{ ...cs.expandBtn, ...(pinFormId === r.id ? { color: '#b45309', border: '1px solid #fde68a', background: '#fef3c7' } : {}) }}
              onClick={() => togglePinForm(r.id)}
            >
              {pinFormId === r.id ? '▾' : '▸'} PIN gardien
            </button>
            <button style={{ ...cs.btn, ...cs.btnD, minHeight: 30, padding: '5px 12px' }} onClick={() => handleDelete(r.id)}>
              Supprimer
            </button>
          </div>

          {expandedId === r.id && expandedSection === 'batiments'    && <SectionBatiments    residenceId={r.id} />}
          {expandedId === r.id && expandedSection === 'appartements' && <SectionAppartements residenceId={r.id} />}

          {pinFormId === r.id && (
            <form
              onSubmit={e => handlePinSubmit(e, r.id)}
              style={{ marginTop: 14, padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}
            >
              <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748b' }}>
                Définir le PIN d'accès pour les gardiens (4 à 6 chiffres)
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={e => { setPin(e.target.value); setPinMsg(null); }}
                  placeholder="••••"
                  maxLength={6}
                  style={{ ...cs.input, width: 130 }}
                  required
                />
                <button type="submit" style={{ ...cs.btn, ...cs.btnP }} disabled={pinSubmitting}>
                  {pinSubmitting ? 'Mise à jour...' : 'Enregistrer'}
                </button>
              </div>
              {pinMsg && (
                <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: '500', color: pinMsg.type === 'success' ? '#15803d' : '#b91c1c' }}>
                  {pinMsg.text}
                </p>
              )}
            </form>
          )}
        </div>
      ))}
    </div>
  );
}
