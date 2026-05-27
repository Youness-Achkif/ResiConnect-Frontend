import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate(result.role === "manager" ? "/manager" : "/resident");
    else setError(result.error);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span style={{ fontSize: 42 }}>🏢</span>
          <h1>ResiConnect</h1>
        </div>
        <p className="auth-tagline">
          La plateforme de gestion résidentielle qui simplifie le quotidien des résidents et des gestionnaires.
        </p>
        <div className="auth-features">
          {[
            { icon: "💳", text: "Suivi des paiements en temps réel"   },
            { icon: "🔧", text: "Gestion des incidents techniques"      },
            { icon: "📢", text: "Communication centralisée"             },
            { icon: "📊", text: "Tableau de bord complet"               },
          ].map((f) => (
            <div className="auth-feature-item" key={f.text}>
              <span className="auth-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace personnel</p>
          </div>

          {error && <div className="auth-alert">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Adresse email</label>
              <input type="email" className="form-control" placeholder="votre@email.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email" required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" className="form-control" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="spinner" /> : "Se connecter"}
            </button>
          </form>

          <p className="auth-switch">
            Pas encore de compte ?{" "}
            <Link to="/register" className="auth-link">Créer un compte</Link>
          </p>
        </div>
      </div>
      <AuthStyles />
    </div>
  );
}

export function AuthStyles() {
  return (
    <style>{`
      .auth-page { min-height:100vh; display:flex; }

      .auth-left {
        flex:1; background:linear-gradient(160deg,#1a1d27 0%,#0f1117 100%);
        padding:60px 50px; display:flex; flex-direction:column;
        justify-content:center; border-right:1px solid var(--border);
        position:relative; overflow:hidden;
      }
      .auth-left::after {
        content:''; position:absolute; width:500px; height:500px;
        background:radial-gradient(circle,#6c8bff12 0%,transparent 65%);
        bottom:-150px; right:-150px; border-radius:50%; pointer-events:none;
      }
      .auth-brand { display:flex; align-items:center; gap:14px; margin-bottom:36px; }
      .auth-brand h1 {
        font-size:34px;
        background:linear-gradient(135deg,#fff 0%,#6c8bff 100%);
        -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
      }
      .auth-tagline { font-size:16px; color:var(--text-muted); max-width:380px; line-height:1.8; margin-bottom:44px; }
      .auth-features { display:flex; flex-direction:column; gap:18px; }
      .auth-feature-item { display:flex; align-items:center; gap:14px; font-size:15px; color:var(--text); }
      .auth-feature-icon {
        width:38px; height:38px; background:var(--surface2);
        border:1px solid var(--border); border-radius:var(--radius-sm);
        display:flex; align-items:center; justify-content:center;
        font-size:17px; flex-shrink:0;
      }

      .auth-right {
        width:500px; display:flex; align-items:center; justify-content:center;
        padding:40px; background:var(--bg);
      }
      .auth-card { width:100%; }
      .auth-card-header { margin-bottom:32px; }
      .auth-card-header h2 { font-size:26px; margin-bottom:6px; }
      .auth-card-header p { color:var(--text-muted); font-size:14px; }

      .auth-alert {
        background:var(--red-soft); border:1px solid var(--red);
        color:var(--red); padding:12px 16px; border-radius:var(--radius-sm);
        font-size:14px; margin-bottom:20px;
      }
      .auth-success {
        background:var(--green-soft); border:1px solid var(--green);
        color:var(--green); padding:12px 16px; border-radius:var(--radius-sm);
        font-size:14px; margin-bottom:20px;
      }
      .auth-form { display:flex; flex-direction:column; gap:20px; margin-bottom:24px; }
      .btn-full { width:100%; justify-content:center; padding:13px; font-size:15px; }

      .spinner {
        width:18px; height:18px;
        border:2px solid rgba(255,255,255,0.3);
        border-top-color:#fff; border-radius:50%;
        animation:spin 0.7s linear infinite; display:inline-block;
      }
      @keyframes spin { to { transform:rotate(360deg); } }

      .auth-switch {
        text-align:center; color:var(--text-muted); font-size:14px;
        border-top:1px solid var(--border); padding-top:20px;
      }
      .auth-link { color:var(--accent); font-weight:500; }
      .auth-link:hover { text-decoration:underline; }

      .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

      .role-selector { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      .role-option {
        border:1.5px solid var(--border); border-radius:var(--radius);
        padding:20px 16px; cursor:pointer; transition:all var(--transition);
        text-align:center; background:transparent; color:var(--text);
        width:100%;
      }
      .role-option:hover, .role-option.selected {
        border-color:var(--accent); background:var(--accent-soft);
      }
      .role-option-icon { font-size:30px; margin-bottom:10px; }
      .role-option-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; }
      .role-option-desc { font-size:12px; color:var(--text-muted); margin-top:4px; }

      .back-btn {
        background:none; border:none; color:var(--text-muted); font-size:13px;
        cursor:pointer; padding:0; transition:color var(--transition); font-family:inherit;
      }
      .back-btn:hover { color:var(--text); }

      .cgu-label {
        display:flex; align-items:flex-start; gap:10px;
        font-size:13px; color:var(--text-muted); cursor:pointer; line-height:1.5;
      }

      .pwd-strength { display:flex; align-items:center; gap:8px; margin-top:8px; }
      .pwd-bars { display:flex; gap:4px; flex:1; }
      .pwd-bar { height:3px; flex:1; border-radius:99px; transition:background 0.3s ease; }

      @media (max-width:900px) { .auth-left { display:none; } .auth-right { width:100%; } }
      @media (max-width:480px) { .auth-right { padding:24px; } .form-row { grid-template-columns:1fr; } }
    `}</style>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, mot_de_passe: motDePasse });
      login(data.user, data.token);
      if (data.user.role === 'gestionnaire') {
        navigate('/dashboard/gestionnaire');
      } else {
        navigate('/dashboard/resident');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
      padding: 16,
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#fff',
        borderRadius: 8,
        padding: 32,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
      }}>
        <h2 style={{ margin: '0 0 24px', textAlign: 'center', fontFamily: 'sans-serif' }}>ResiConnect</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: '500', fontFamily: 'sans-serif' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: '500', fontFamily: 'sans-serif' }}>Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          {error && <p style={{ color: '#dc3545', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', minHeight: 44, background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 4, fontSize: 15, fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'sans-serif' }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

