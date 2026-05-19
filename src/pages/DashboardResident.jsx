import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardResident() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 32 }}>
      <h1>Bienvenue {user?.nom} — Résident</h1>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
}
