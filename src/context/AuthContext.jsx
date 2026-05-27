<<<<<<< HEAD
import { createContext, useContext, useState, useEffect } from "react";
=======
import React, { createContext, useContext, useState } from 'react';
>>>>>>> 2b72b0b48b961df35c287b002bc9682ee65f089b

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
<<<<<<< HEAD
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Au démarrage, recharge la session si elle existe
  useEffect(() => {
    const saved = localStorage.getItem("rc_user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  //   Inscription
  // Sauvegarde le nouvel utilisateur dans localStorage
  const register = (formData) => {
    const users = JSON.parse(localStorage.getItem("rc_users") || "[]");

    // Vérifie si l'email existe déjà
    if (users.find((u) => u.email === formData.email)) {
      return { success: false, error: "Un compte avec cet email existe déjà." };
    }

    const newUser = {
      id:        Date.now(),
      firstName: formData.firstName,
      lastName:  formData.lastName,
      email:     formData.email,
      phone:     formData.phone,
      password:  formData.password,
      role:      formData.role,
      // Champs résident
      residenceName:   formData.residenceName   || "",
      apartmentNumber: formData.apartmentNumber || "",
      // Champs gestionnaire
      companyName: formData.companyName || "",
      siret:       formData.siret       || "",
      createdAt:   new Date().toLocaleDateString("fr-FR"),
    };

    users.push(newUser);
    localStorage.setItem("rc_users", JSON.stringify(users));
    return { success: true };
  };

  // ── Connexion ──
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("rc_users") || "[]");
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { success: false, error: "Email ou mot de passe incorrect." };

    // Ne sauvegarde pas le mot de passe dans la session
    const { password: _, ...safeUser } = found;
    localStorage.setItem("rc_user", JSON.stringify(safeUser));
    setUser(safeUser);
    return { success: true, role: safeUser.role };
  };

  // ── Déconnexion ──
  const logout = () => {
    localStorage.removeItem("rc_user");
=======
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData, tokenValue) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
>>>>>>> 2b72b0b48b961df35c287b002bc9682ee65f089b
    setUser(null);
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
=======
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
>>>>>>> 2b72b0b48b961df35c287b002bc9682ee65f089b
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
<<<<<<< HEAD
}
=======
}
>>>>>>> 2b72b0b48b961df35c287b002bc9682ee65f089b
