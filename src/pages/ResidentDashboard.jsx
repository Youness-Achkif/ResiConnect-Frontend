import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import Sidebar from "../components/Sidebar";

export default function ResidentDashboard() {
  const { user }        = useAuth();
  const { residentStats } = useData();

  const s = residentStats;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Bonjour, {user?.firstName} 👋</h1>
            <p>Voici un résumé de votre espace résidentiel</p>
          </div>
          <span className="badge badge-green">● Connecté</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{ "--accent-color": "#3ecf8e" }}>
            <div className="stat-icon">💳</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{s.paymentStatus}</div>
            <div className="stat-label">Paiement du mois</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "#f5c842" }}>
            <div className="stat-icon">🔧</div>
            <div className="stat-value">{s.openTickets}</div>
            <div className="stat-label">Tickets en cours</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "#6c8bff" }}>
            <div className="stat-icon">📢</div>
            <div className="stat-value">{s.newAnnouncements}</div>
            <div className="stat-label">Annonces</div>
          </div>
          <div className="stat-card" style={{ "--accent-color": "#8b90a8" }}>
            <div className="stat-icon">🏠</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{user?.apartmentNumber || "—"}</div>
            <div className="stat-label">Appartement</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Tickets récents */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15 }}>🔧 Mes tickets récents</h2>
              <Link to="/resident/tickets" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }}>Voir tout</Link>
            </div>
            {s.recentTickets.length === 0 ? (
              <EmptySection text="Aucun ticket ouvert." icon="✅" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {s.recentTickets.map((t) => (
                  <div key={t.id} style={rowStyle}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>{t.subject}</p>
                      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>{t.reference} · {t.date}</p>
                    </div>
                    <span className={`badge ${t.status === "En cours" ? "badge-yellow" : "badge-blue"}`}>{t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Annonces récentes */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 15 }}>📢 Dernières annonces</h2>
              <Link to="/resident/announcements" className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }}>Voir tout</Link>
            </div>
            {s.recentAnnouncements.length === 0 ? (
              <EmptySection text="Aucune annonce pour le moment." icon="📭" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {s.recentAnnouncements.map((a) => (
                  <div key={a.id} style={{
                    padding: 12, background: "var(--surface2)",
                    borderLeft: "3px solid var(--accent)",
                    borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  }}>
                    <p style={{ fontWeight: 500, fontSize: 14 }}>{a.title}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{a.date}</p>
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

const rowStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: 12, background: "var(--surface2)",
  borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
};

function EmptySection({ text, icon }) {
  return (
    <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text-muted)" }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 13 }}>{text}</p>
    </div>
  );
}