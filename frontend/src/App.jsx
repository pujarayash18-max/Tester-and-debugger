// ============================================================
// App.jsx - Root Component & Route Configuration
// Unit 2: React Router (Routing with React Router)
// CO1, CO2: Component-based UI, routing
// ============================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BugProvider } from './context/BugContext';

// Pages
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import DashboardPage  from './pages/DashboardPage';
import BugListPage    from './pages/BugListPage';
import ReportBugPage  from './pages/ReportBugPage';
import ProjectsPage   from './pages/ProjectsPage';
import UserManagePage from './pages/UserManagePage';
import MyBugsPage     from './pages/MyBugsPage';
import ActivityPage   from './pages/ActivityPage';
import BugDetailPage  from './pages/BugDetailPage';
import AppLayout      from './components/Shared/AppLayout';

// ── Protected Route ──────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="spinner-border" style={{ color: 'var(--accent)' }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── App Routes ───────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={!user ? <LoginPage />    : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />

      {/* Protected inside layout */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="bugs"      element={<BugListPage />} />
        <Route path="bugs/:id"  element={<BugDetailPage />} />
        <Route path="report"    element={<ProtectedRoute roles={['Tester','Admin']}><ReportBugPage /></ProtectedRoute>} />
        <Route path="projects"  element={<ProjectsPage />} />
        <Route path="my-bugs"   element={<ProtectedRoute roles={['Developer']}><MyBugsPage /></ProtectedRoute>} />
        <Route path="users"     element={<ProtectedRoute roles={['Admin']}><UserManagePage /></ProtectedRoute>} />
        <Route path="activity"  element={<ActivityPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BugProvider>
        <Router>
          <AppRoutes />
        </Router>
      </BugProvider>
    </AuthProvider>
  );
}
