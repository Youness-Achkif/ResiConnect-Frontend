import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardGestionnaire() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 32 }}>
      <h1>Bienvenue {user?.nom} — Gestionnaire</h1>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
}
