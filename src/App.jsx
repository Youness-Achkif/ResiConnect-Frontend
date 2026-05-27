import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider }          from "./context/DataContext";
import Login             from "./pages/Login";
import Register          from "./pages/Register";
import ResidentDashboard from "./pages/ResidentDashboard";
import ManagerDashboard  from "./pages/ManagerDashboard";
import Payments          from "./pages/Payments";
import Tickets           from "./pages/Tickets";
import Announcements     from "./pages/Announcements";

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return <DataProvider>{children}</DataProvider>;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === "manager" ? "/manager" : "/resident"} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<Navigate to="/login" replace />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/resident"               element={<PrivateRoute role="resident"><ResidentDashboard /></PrivateRoute>} />
          <Route path="/resident/payments"      element={<PrivateRoute role="resident"><Payments /></PrivateRoute>} />
          <Route path="/resident/tickets"       element={<PrivateRoute role="resident"><Tickets /></PrivateRoute>} />
          <Route path="/resident/announcements" element={<PrivateRoute role="resident"><Announcements /></PrivateRoute>} />

          <Route path="/manager"               element={<PrivateRoute role="manager"><ManagerDashboard /></PrivateRoute>} />
          <Route path="/manager/payments"      element={<PrivateRoute role="manager"><Payments /></PrivateRoute>} />
          <Route path="/manager/tickets"       element={<PrivateRoute role="manager"><Tickets /></PrivateRoute>} />
          <Route path="/manager/announcements" element={<PrivateRoute role="manager"><Announcements /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}