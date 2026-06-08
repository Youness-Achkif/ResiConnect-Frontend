import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser]   = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [residences, setResidences]                   = useState([]);
  const [selectedResidence, setSelectedResidenceState] = useState(() => {
    const stored = localStorage.getItem('selectedResidence');
    return stored ? JSON.parse(stored) : null;
  });

  const setSelectedResidence = (residence) => {
    setSelectedResidenceState(residence);
    if (residence) {
      localStorage.setItem('selectedResidence', JSON.stringify(residence));
    } else {
      localStorage.removeItem('selectedResidence');
    }
  };

  const login = async (userData, tokenValue) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);

    if (userData.role === 'gestionnaire') {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/residences`,
          { headers: { Authorization: `Bearer ${tokenValue}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setResidences(data);
          if (data.length === 1) {
            setSelectedResidence(data[0]);
          }
        }
      } catch {}
    }
  };

  const refreshResidences = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/residences`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setResidences(data);
        if (!selectedResidence && data.length === 1) {
          setSelectedResidence(data[0]);
        }
      }
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedResidence');
    setToken(null);
    setUser(null);
    setResidences([]);
    setSelectedResidenceState(null);
  };

  return (
    <AuthContext.Provider value={{
      token, user, login, logout, refreshResidences,
      residences, selectedResidence, setSelectedResidence,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
