import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const residentLinks = [
    { to: "/resident",               icon: "📊", label: "Dashboard"   },
    { to: "/resident/payments",      icon: "💳", label: "Paiements"   },
    { to: "/resident/tickets",       icon: "🔧", label: "Mes Tickets" },
    { to: "/resident/announcements", icon: "📢", label: "Annonces"    },
  ];

  const managerLinks = [
    { to: "/manager",               icon: "📊", label: "Dashboard"  },
    { to: "/manager/payments",      icon: "💳", label: "Paiements"  },
    { to: "/manager/tickets",       icon: "🔧", label: "Tickets"    },
    { to: "/manager/announcements", icon: "📢", label: "Annonces"   },
  ];

  const links = user?.role === "manager" ? managerLinks : residentLinks;

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span style={{ fontSize: 24 }}>🏢</span>
        <span className="sidebar-brand-name">ResiConnect</span>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{user?.name?.[0] ?? "?"}</div>
        <div>
          <p className="sidebar-user-name">{user?.name}</p>
          <span className={`badge ${user?.role === "manager" ? "badge-blue" : "badge-green"}`}
            style={{ fontSize: 10 }}>
            {user?.role === "manager" ? "Gestionnaire" : "Résident"}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/resident" || link.to === "/manager"}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " sidebar-link--active" : ""}`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <span>🚪</span><span>Déconnexion</span>
      </button>

      <style>{`
        .sidebar {
          position: fixed; top: 0; left: 0;
          width: 240px; height: 100vh;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          padding: 20px 0; z-index: 100;
        }
        .sidebar-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 0 20px 20px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 16px;
        }
        .sidebar-brand-name {
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px;
        }
        .sidebar-user {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 20px; margin-bottom: 16px;
          background: var(--surface2);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .sidebar-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), #a78bff);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px; color: #fff; flex-shrink: 0;
        }
        .sidebar-user-name { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
        .sidebar-nav {
          flex: 1; display: flex; flex-direction: column;
          gap: 2px; padding: 0 12px;
        }
        .sidebar-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: var(--radius-sm);
          color: var(--text-muted); font-size: 14px; font-weight: 500;
          transition: all var(--transition);
        }
        .sidebar-link:hover { background: var(--surface2); color: var(--text); }
        .sidebar-link--active { background: var(--accent-soft); color: var(--accent); }
        .sidebar-logout {
          margin: 12px; display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: var(--radius-sm);
          background: none; border: 1px solid var(--border);
          color: var(--text-muted); font-size: 14px; font-weight: 500;
          transition: all var(--transition);
        }
        .sidebar-logout:hover { border-color: var(--red); color: var(--red); background: var(--red-soft); }
      `}</style>
    </aside>
  );
}