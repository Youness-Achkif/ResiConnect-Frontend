import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

const CATEGORY_ICONS = { "Travaux":"🔨","Maintenance":"⚙️","Événement":"🎉","Information":"ℹ️","Urgence":"🚨" };
const CATEGORIES = Object.keys(CATEGORY_ICONS);

export default function Announcements() {
  const { user }                                    = useAuth();
  const { announcements, addAnnouncement, deleteAnnouncement } = useData();
  const isManager = user?.role === "manager";

  const [filterCat, setFilterCat] = useState("Toutes");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ title: "", category: "Information", content: "", important: false });

  const filtered = filterCat === "Toutes" ? announcements : announcements.filter((a) => a.category === filterCat);

  const handleCreate = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    addAnnouncement(form);
    setForm({ title: "", category: "Information", content: "", important: false });
    setShowModal(false);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Annonces</h1>
            <p>{isManager ? "Communiquez avec tous les résidents" : "Actualités de votre résidence"}</p>
          </div>
          {isManager && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Publier une annonce</button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["Toutes", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setFilterCat(c)} style={{
              padding: "6px 14px", borderRadius: 99,
              border: `1px solid ${filterCat === c ? "var(--accent)" : "var(--border)"}`,
              background: filterCat === c ? "var(--accent)" : "transparent",
              color: filterCat === c ? "#fff" : "var(--text-muted)",
              fontSize: 13, cursor: "pointer", transition: "all 0.2s",
            }}>
              {c !== "Toutes" ? `${CATEGORY_ICONS[c]} ${c}` : c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>{filterCat === "Toutes" ? "Aucune annonce publiée pour le moment." : `Aucune annonce dans "${filterCat}".`}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((a) => (
              <div key={a.id} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderLeft: `3px solid ${a.important ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius)", padding: 22, transition: "border-color 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{CATEGORY_ICONS[a.category] ?? "📢"}</span>
                    <div>
                      <h3 style={{ fontSize: 16, marginBottom: 5 }}>
                        {a.title}
                        {a.important && <span className="badge badge-red" style={{ marginLeft: 10, fontSize: 11 }}>Important</span>}
                      </h3>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="badge badge-blue" style={{ fontSize: 11 }}>{a.category}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>📅 {a.date}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>✍️ {a.authorName}</span>
                      </div>
                    </div>
                  </div>
                  {isManager && (
                    <button className="btn btn-danger" style={{ fontSize: 12, padding: "5px 10px", flexShrink: 0 }}
                      onClick={() => deleteAnnouncement(a.id)}>🗑 Supprimer</button>
                  )}
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.8, marginTop: 14 }}>{a.content}</p>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📢 Nouvelle annonce</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label>Titre *</label>
                  <input className="form-control" placeholder="Ex : Travaux ascenseur"
                    value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select className="form-control" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Contenu *</label>
                  <textarea className="form-control" rows={5} placeholder="Rédigez votre annonce..."
                    value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
                  <input type="checkbox" checked={form.important}
                    onChange={(e) => setForm({ ...form, important: e.target.checked })}
                    style={{ accentColor: "var(--accent)", width: 15, height: 15 }} />
                  Marquer comme importante
                </label>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                  <button className="btn btn-primary" onClick={handleCreate}>Publier</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}