import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

const statusBadge = (s) =>
  s === "Payé" ? "badge-green" : s === "En attente" ? "badge-yellow" : "badge-red";

export default function Payments() {
  const { user }                              = useAuth();
  const { payments, myPayments, addPayment, markPaid } = useData();
  const isManager = user?.role === "manager";

  const [filter, setFilter]     = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ residentName: "", apartment: "", label: "", amount: "", month: "" });

  const list     = isManager ? payments : myPayments;
  const filtered = filter === "Tous" ? list : list.filter((p) => p.status === filter);
  const filters  = ["Tous", "Payé", "En attente", "En retard"];

  const handleAdd = () => {
    if (!form.residentName || !form.amount || !form.label) return;
    addPayment({ ...form, amount: Number(form.amount) });
    setForm({ residentName: "", apartment: "", label: "", amount: "", month: "" });
    setShowModal(false);
  };

  const totalPaid = list.filter(p => p.status === "Payé").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>{isManager ? "Gestion des Paiements" : "Mes Paiements"}</h1>
            <p>{isManager ? "Suivi des charges de tous les résidents" : "Historique de vos charges mensuelles"}</p>
          </div>
          {isManager && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Ajouter une charge</button>
          )}
        </div>

        {/* Résumé */}
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
          <div className="stat-card" style={{ "--accent-color": "#3ecf8e" }}>
            <div className="stat-icon">✅</div>
            <div className="stat-value">{list.filter(p => p.status === "Payé").length}</div>
            <div className="stat-label">Payés</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "#f5c842" }}>
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{list.filter(p => p.status !== "Payé").length}</div>
            <div className="stat-label">En attente</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "#6c8bff" }}>
            <div className="stat-icon">💰</div>
            <div className="stat-value">{totalPaid.toLocaleString("fr-FR")} €</div>
            <div className="stat-label">Total collecté</div>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
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
            <div className="empty-icon">💳</div>
            <p>{filter === "Tous" ? "Aucun paiement enregistré pour le moment." : `Aucun paiement avec le statut "${filter}".`}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {isManager && <th>Résident</th>}
                  {isManager && <th>Appartement</th>}
                  <th>Libellé</th>
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Statut</th>
                  {isManager && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    {isManager && <td style={{ fontWeight: 500 }}>{p.residentName}</td>}
                    {isManager && <td style={{ color: "var(--text-muted)" }}>{p.apartment}</td>}
                    <td style={{ fontWeight: 500 }}>{p.label}</td>
                    <td style={{ fontWeight: 700 }}>{Number(p.amount).toLocaleString("fr-FR")} €</td>
                    <td style={{ color: "var(--text-muted)" }}>{p.date}</td>
                    <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                    {isManager && (
                      <td>
                        {p.status !== "Payé" && (
                          <button className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }}
                            onClick={() => markPaid(p.id)}>
                            ✓ Marquer payé
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal ajouter charge */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>💳 Ajouter une charge</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom du résident *</label>
                    <input className="form-control" placeholder="Jean Dupont"
                      value={form.residentName} onChange={(e) => setForm({ ...form, residentName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Appartement</label>
                    <input className="form-control" placeholder="Ex : 4A"
                      value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Libellé *</label>
                  <input className="form-control" placeholder="Ex : Charges Mai 2025"
                    value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Montant (€) *</label>
                    <input className="form-control" type="number" placeholder="650"
                      value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Mois concerné</label>
                    <input className="form-control" placeholder="Ex : Mai 2025"
                      value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                  <button className="btn btn-primary" onClick={handleAdd}>Ajouter</button>
                </div>
              </div>
              <style>{`.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}`}</style>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}