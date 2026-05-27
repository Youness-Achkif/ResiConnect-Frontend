import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

const CATEGORIES = ["Plomberie","Électricité","Serrurerie","Ascenseur","Nettoyage","Autre"];
const PRIORITIES  = ["Basse","Moyenne","Haute"];
const statusBadge   = (s) => s === "Résolu" ? "badge-green" : s === "En cours" ? "badge-yellow" : "badge-blue";
const priorityColor = (p) => p === "Haute" ? "var(--red)" : p === "Moyenne" ? "var(--yellow)" : "var(--text-muted)";

export default function Tickets() {
  const { user }                          = useAuth();
  const { tickets, myTickets, addTicket, updateTicketStatus } = useData();
  const isManager = user?.role === "manager";

  const [filter, setFilter]       = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [form, setForm]           = useState({ subject: "", category: "Plomberie", priority: "Moyenne", description: "" });

  const list     = isManager ? tickets : myTickets;
  const filtered = filter === "Tous" ? list : list.filter((t) => t.status === filter);
  const filters  = ["Tous","Ouvert","En cours","Résolu"];

  const handleCreate = () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    addTicket(form);
    setForm({ subject: "", category: "Plomberie", priority: "Moyenne", description: "" });
    setShowModal(false);
  };

  const handleUpdateStatus = (id, status) => {
    updateTicketStatus(id, status);
    setSelected(prev => prev ? { ...prev, status } : null);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>{isManager ? "Gestion des Tickets" : "Mes Tickets"}</h1>
            <p>{isManager ? "Suivez et résolvez les incidents signalés" : "Signalez un problème, suivez son avancement"}</p>
          </div>
          {!isManager && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Signaler un problème</button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 16px", borderRadius: 99,
              border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
              background: filter === f ? "var(--accent)" : "transparent",
              color: filter === f ? "#fff" : "var(--text-muted)",
              fontSize: 13, cursor: "pointer", transition: "all 0.2s",
            }}>{f}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>{filter === "Tous" ? "Aucun ticket pour le moment." : `Aucun ticket "${filter}".`}</p>
            {!isManager && filter === "Tous" && (
              <button className="btn btn-primary" style={{ marginTop: 16 }}
                onClick={() => setShowModal(true)}>Signaler un problème</button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
            {filtered.map((t) => (
              <div key={t.id} onClick={() => setSelected(t)}
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)" }}>{t.reference}</span>
                  <span className={`badge ${statusBadge(t.status)}`}>{t.status}</span>
                </div>
                <h3 style={{ fontSize: 15, margin: "8px 0 6px" }}>{t.subject}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                }}>{t.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>📅 {t.date}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span className="badge badge-blue" style={{ fontSize: 11 }}>{t.category}</span>
                    <span style={{ fontSize: 12, color: priorityColor(t.priority), fontWeight: 600 }}>● {t.priority}</span>
                  </div>
                </div>
                {isManager && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>👤 {t.residentName}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Modal nouveau ticket */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🔧 Signaler un problème</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label>Sujet *</label>
                  <input className="form-control" placeholder="Décrivez le problème en quelques mots"
                    value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label>Catégorie</label>
                    <select className="form-control" value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Urgence</label>
                    <select className="form-control" value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                      {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea className="form-control" rows={4}
                    placeholder="Expliquez le problème avec le maximum de détails..."
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                  <button className="btn btn-primary" onClick={handleCreate}>Envoyer</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal détail */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selected.subject}</h2>
                <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className={`badge ${statusBadge(selected.status)}`}>{selected.status}</span>
                  <span className="badge badge-blue">{selected.category}</span>
                  <span style={{ fontSize: 12, color: priorityColor(selected.priority), fontWeight: 600 }}>● {selected.priority}</span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>{selected.description}</p>
                <div style={{ padding: 14, background: "var(--surface2)", borderRadius: "var(--radius-sm)", display: "flex", flexDirection: "column", gap: 5 }}>
                  {isManager && <p style={{ fontSize: 13 }}>👤 <strong>{selected.residentName}</strong></p>}
                  <p style={{ fontSize: 13 }}>🔖 <span style={{ fontFamily: "monospace" }}>{selected.reference}</span></p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>📅 Ouvert le {selected.date}</p>
                </div>
                {isManager && selected.status !== "Résolu" && (
                  <div style={{ display: "flex", gap: 10 }}>
                    {selected.status === "Ouvert" && (
                      <button className="btn btn-primary" onClick={() => handleUpdateStatus(selected.id, "En cours")}>
                        ▶ Prendre en charge
                      </button>
                    )}
                    <button className="btn btn-ghost" style={{ color: "var(--green)", borderColor: "var(--green)" }}
                      onClick={() => handleUpdateStatus(selected.id, "Résolu")}>
                      ✓ Marquer résolu
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}