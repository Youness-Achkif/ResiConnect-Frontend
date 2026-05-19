import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import DashboardGestionnaire from './pages/DashboardGestionnaire';
import DashboardResident from './pages/DashboardResident';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/gestionnaire"
            element={
              <PrivateRoute>
                <DashboardGestionnaire />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/resident"
            element={
              <PrivateRoute>
                <DashboardResident />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
