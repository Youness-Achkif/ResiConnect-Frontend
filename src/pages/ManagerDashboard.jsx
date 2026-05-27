import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import Sidebar from "../components/Sidebar";

export default function ManagerDashboard() {
  const { managerStats } = useData();
  const s = managerStats;
  const rate = s.totalResidents > 0 ? Math.round((s.paidPayments / s.totalResidents) * 100) : 0;
  const statusBadge = (st) => st === "En cours" ? "badge-yellow" : st === "Résolu" ? "badge-green" : "badge-blue";

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Dashboard Gestionnaire</h1>
            <p>Vue d'ensemble — {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
          </div>
          <span className="badge badge-blue">🏗️ Gestionnaire</span>
        </div>

        <div className="stats-grid">
          {[
            { icon: "👥", label: "Résidents",         value: s.totalResidents,  color: "#6c8bff" },
            { icon: "💳", label: "Paiements reçus",   value: s.paidPayments,    color: "#3ecf8e" },
            { icon: "⚠️", label: "En attente",        value: s.pendingPayments, color: "#f5c842" },
            { icon: "🔧", label: "Tickets ouverts",   value: s.openTickets,     color: "#ff6b6b" },
          ].map((st) => (
            <div key={st.label} className="stat-card" style={{ "--accent-color": st.color }}>
              <div className="stat-icon">{st.icon}</div>
              <div className="stat-value">{st.value}</div>
              <div className="stat-label">{st.label}</div>
            </div>
          ))}
        </div>

        {s.totalResidents > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <h2 style={{ fontSize: 15 }}>💳 Taux de paiement ce mois</h2>
              <span style={{ fontWeight: 700, color: "var(--green)" }}>{rate}%</span>
            </div>
            <div style={{ height: 8, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${rate}%`, height: "100%", background: "linear-gradient(90deg,var(--green),#6c8bff)", borderRadius: 99, transition: "width 0.8s ease" }} />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8 }}>
              {s.paidPayments} paiements reçus sur {s.totalResidents} résidents enregistrés
            </p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15 }}>🔧 Tickets récents</h2>
              <Link to="/manager/tickets" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }}>Tout voir</Link>
            </div>
            {s.recentTickets.length === 0 ? (
              <Empty text="Aucun ticket signalé." icon="✅" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {s.recentTickets.map((t) => (
                  <div key={t.id} style={row}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>{t.subject}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{t.reference} · {t.residentName}</p>
                    </div>
                    <span className={`badge ${statusBadge(t.status)}`}>{t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15 }}>⚠️ Paiements en attente</h2>
              <Link to="/manager/payments" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }}>Tout voir</Link>
            </div>
            {s.pendingList.length === 0 ? (
              <Empty text="Tous les paiements sont à jour." icon="✅" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {s.pendingList.map((p) => (
                  <div key={p.id} style={{ ...row, borderLeft: "3px solid var(--yellow)", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0" }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>{p.residentName}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{p.apartment} · {p.month}</p>
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--yellow)" }}>{p.amount} €</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const row = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: 12, background: "var(--surface2)",
  borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
};

function Empty({ text, icon }) {
  return (
    <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text-muted)" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 13 }}>{text}</p>
    </div>
  );
}