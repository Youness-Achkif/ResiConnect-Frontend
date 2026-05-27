import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthStyles } from "./Login";

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [step, setStep]       = useState(1);
  const [role, setRole]       = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "",
    residenceName: "", apartmentNumber: "",
    companyName: "", siret: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = register({ ...form, role });
    setLoading(false);
    if (result.success) {
      setSuccess("Compte créé avec succès ! Redirection vers la connexion...");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setError(result.error);
    }
  };

  const strength = (pwd) => {
    if (!pwd) return null;
    let s = 0;
    if (pwd.length >= 8)           s++;
    if (pwd.length >= 12)          s++;
    if (/[A-Z]/.test(pwd))         s++;
    if (/[0-9]/.test(pwd))         s++;
    if (/[^A-Za-z0-9]/.test(pwd))  s++;
    if (s <= 1) return { level: 1, label: "Faible",  color: "var(--red)"    };
    if (s <= 3) return { level: 2, label: "Moyen",   color: "var(--yellow)" };
    return            { level: 3, label: "Fort",    color: "var(--green)"  };
  };
  const pwdStrength = strength(form.password);

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span style={{ fontSize: 42 }}>🏢</span>
          <h1>ResiConnect</h1>
        </div>
        <p className="auth-tagline">
          Rejoignez la plateforme de gestion résidentielle et simplifiez votre quotidien dès aujourd'hui.
        </p>
        <div className="auth-features">
          {[
            { icon: "⚡", text: "Inscription en 2 minutes"              },
            { icon: "🔒", text: "Données sécurisées"                    },
            { icon: "📱", text: "Accessible sur tous les appareils"     },
            { icon: "🤝", text: "Interface simple et intuitive"         },
          ].map((f) => (
            <div className="auth-feature-item" key={f.text}>
              <span className="auth-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right"
        style={{ alignItems: step === 1 ? "center" : "flex-start", overflowY: "auto", paddingTop: step === 2 ? 40 : undefined }}>
        <div className="auth-card">

          {/* Étape 1 — Choix du rôle */}
          {step === 1 && (
            <>
              <div className="auth-card-header">
                <h2>Créer un compte</h2>
                <p>Choisissez votre profil pour commencer</p>
              </div>
              <div className="role-selector">
                <button className="role-option" onClick={() => { setRole("resident"); setStep(2); }}>
                  <div className="role-option-icon">🏠</div>
                  <div className="role-option-title">Résident</div>
                  <div className="role-option-desc">Je vis dans une résidence gérée via ResiConnect</div>
                </button>
                <button className="role-option" onClick={() => { setRole("manager"); setStep(2); }}>
                  <div className="role-option-icon">🏗️</div>
                  <div className="role-option-title">Gestionnaire</div>
                  <div className="role-option-desc">Je gère une ou plusieurs résidences</div>
                </button>
              </div>
              <p className="auth-switch" style={{ marginTop: 28 }}>
                Déjà un compte ? <Link to="/login" className="auth-link">Se connecter</Link>
              </p>
            </>
          )}

          {/* Étape 2 — Formulaire */}
          {step === 2 && (
            <>
              <div className="auth-card-header">
                <button className="back-btn" onClick={() => { setStep(1); setError(""); }}>← Retour</button>
                <h2 style={{ marginTop: 12 }}>
                  {role === "resident" ? "🏠 Inscription Résident" : "🏗️ Inscription Gestionnaire"}
                </h2>
                <p>Renseignez vos informations personnelles</p>
              </div>

              {error   && <div className="auth-alert">⚠️ {error}</div>}
              {success && <div className="auth-success">✓ {success}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input name="firstName" type="text" className="form-control"
                      placeholder="Jean" value={form.firstName}
                      onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Nom *</label>
                    <input name="lastName" type="text" className="form-control"
                      placeholder="Dupont" value={form.lastName}
                      onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Adresse email *</label>
                  <input name="email" type="email" className="form-control"
                    placeholder="jean.dupont@email.com" value={form.email}
                    onChange={handleChange} autoComplete="email" required />
                </div>

                <div className="form-group">
                  <label>Téléphone</label>
                  <input name="phone" type="tel" className="form-control"
                    placeholder="+33 6 00 00 00 00" value={form.phone}
                    onChange={handleChange} />
                </div>

                {role === "resident" && (
                  <>
                    <div className="form-group">
                      <label>Nom de la résidence *</label>
                      <input name="residenceName" type="text" className="form-control"
                        placeholder="Résidence Les Cerisiers" value={form.residenceName}
                        onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Numéro d'appartement</label>
                      <input name="apartmentNumber" type="text" className="form-control"
                        placeholder="Ex : 12B" value={form.apartmentNumber}
                        onChange={handleChange} />
                    </div>
                  </>
                )}

                {role === "manager" && (
                  <>
                    <div className="form-group">
                      <label>Nom de la société / agence</label>
                      <input name="companyName" type="text" className="form-control"
                        placeholder="Gestion Immo SAS" value={form.companyName}
                        onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Numéro SIRET</label>
                      <input name="siret" type="text" className="form-control"
                        placeholder="000 000 000 00000" value={form.siret}
                        onChange={handleChange} maxLength={17} />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Mot de passe * <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(min. 8 caractères)</span></label>
                  <input name="password" type="password" className="form-control"
                    placeholder="••••••••" value={form.password}
                    onChange={handleChange} autoComplete="new-password" required />
                  {pwdStrength && (
                    <div className="pwd-strength">
                      <div className="pwd-bars">
                        {[1,2,3].map((i) => (
                          <div key={i} className="pwd-bar"
                            style={{ background: i <= pwdStrength.level ? pwdStrength.color : "var(--border)" }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: pwdStrength.color }}>{pwdStrength.label}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Confirmer le mot de passe *</label>
                  <input name="confirmPassword" type="password" className="form-control"
                    placeholder="••••••••" value={form.confirmPassword}
                    onChange={handleChange} autoComplete="new-password" required />
                </div>

                <label className="cgu-label">
                  <input type="checkbox" required
                    style={{ accentColor: "var(--accent)", width: 15, height: 15, flexShrink: 0, marginTop: 2 }} />
                  <span>J'accepte les <a href="#" className="auth-link">conditions générales d'utilisation</a> et la <a href="#" className="auth-link">politique de confidentialité</a></span>
                </label>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? <span className="spinner" /> : "Créer mon compte"}
                </button>
              </form>

              <p className="auth-switch">
                Déjà un compte ? <Link to="/login" className="auth-link">Se connecter</Link>
              </p>
            </>
          )}
        </div>
      </div>
      <AuthStyles />
    </div>
  );
}