// ============================================================
// components/Shared/AppLayout.jsx - Main Layout Shell
// Unit 2: Component composition, React Router Outlet
// CO1, CO2: Responsive design, routing
// ============================================================

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard',       icon: '⬡', roles: ['Admin','Developer','Tester'] },
  { path: '/bugs',      label: 'Bug Tracker',     icon: '⚠', roles: ['Admin','Developer','Tester'] },
  { path: '/report',    label: 'Report Bug',      icon: '✦', roles: ['Tester','Admin'] },
  { path: '/my-bugs',   label: 'My Assigned',     icon: '◎', roles: ['Developer'] },
  { path: '/projects',  label: 'Projects',        icon: '◆', roles: ['Admin','Developer','Tester'] },
  { path: '/users',     label: 'User Management', icon: '◉', roles: ['Admin'] },
  { path: '/activity',  label: 'Activity Log',    icon: '≋', roles: ['Admin','Developer','Tester'] },
];

const ROLE_CLS = { Admin: 'badge-admin', Developer: 'badge-developer', Tester: 'badge-tester' };

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="d-flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo d-flex align-items-center gap-2">
          <div className="logo-box">BT</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>BugTracker</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Issue Manager
            </div>
          </div>
        </div>

        <nav className="p-2 flex-grow-1">
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 10px 6px', fontFamily: 'monospace' }}>
            Menu
          </div>
          {NAV_ITEMS.filter(item => item.roles.includes(user?.role)).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span style={{ width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
          <div
            className="d-flex align-items-center gap-2 p-2 rounded"
            style={{ background: 'var(--bg-input)', cursor: 'pointer' }}
            onClick={handleLogout}
          >
            <div className="avatar avatar-md">{userInitials}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{user?.role} · Logout</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content w-100">
        <header className="topbar d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-custom btn-sm d-md-none"
            onClick={() => setSidebarOpen(s => !s)}
          >
            ☰
          </button>
          <div className="flex-grow-1">
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <span className={`badge rounded-pill ${ROLE_CLS[user?.role] || ''}`}>{user?.role}</span>
          <div className="avatar avatar-md">{userInitials}</div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
