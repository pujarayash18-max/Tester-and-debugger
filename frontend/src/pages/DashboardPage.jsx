// ============================================================
// pages/DashboardPage.jsx
// Unit 2: useEffect, useContext, Bootstrap grid
// CO1, CO2, CO3: Full-stack dashboard with API data
// ============================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBugs } from '../context/BugContext';
import { useAuth } from '../context/AuthContext';
import SeverityBadge  from '../components/Shared/SeverityBadge';
import StatusBadge    from '../components/Shared/StatusBadge';
import LoadingSpinner from '../components/Shared/LoadingSpinner';

export default function DashboardPage() {
  const { bugs, projects, fetchBugs, fetchProjects, loading } = useBugs();
  const { user, isAdmin, isDeveloper } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchBugs(); fetchProjects(); }, [fetchBugs, fetchProjects]);

  if (loading && bugs.length === 0) return <LoadingSpinner text="Loading dashboard..." />;

  const total      = bugs.length;
  const open       = bugs.filter(b => b.status === 'Open').length;
  const inProgress = bugs.filter(b => b.status === 'In Progress').length;
  const fixed      = bugs.filter(b => b.status === 'Fixed').length;
  const critical   = bugs.filter(b => b.severity === 'Critical').length;
  const recentBugs = [...bugs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const myBugs     = isDeveloper ? bugs.filter(b => b.assignedTo?._id === user._id || b.assignedTo === user._id) : [];

  const STATS = [
    { label: 'Total Bugs',  value: total,           color: 'var(--accent)'   },
    { label: 'Open',        value: open,             color: 'var(--critical)' },
    { label: 'In Progress', value: inProgress,       color: 'var(--high)'     },
    { label: 'Fixed',       value: fixed,            color: 'var(--low)'      },
    { label: 'Critical',    value: critical,         color: 'var(--critical)' },
    { label: 'Projects',    value: projects.length,  color: 'var(--purple)'   },
  ];

  return (
    <div>
      <div className="mb-4">
        <h4 className="section-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Here's your project overview</p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {STATS.map(s => (
          <div key={s.label} className="col-6 col-md-4 col-lg-2">
            <div className="stat-card">
              <div className="stat-line" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Recent Bugs */}
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Recent Bugs</span>
              <button className="btn btn-outline-custom btn-sm" onClick={() => navigate('/bugs')}>View All →</button>
            </div>
            <div className="card-body p-0">
              {recentBugs.length === 0 ? (
                <div className="text-center py-4" style={{ color: 'var(--text-muted)', fontSize: 13 }}>No bugs reported yet.</div>
              ) : recentBugs.map((bug, i) => (
                <div
                  key={bug._id}
                  className="d-flex align-items-center gap-3 px-3 cursor-pointer"
                  style={{ paddingTop: 12, paddingBottom: 12, borderBottom: i < recentBugs.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onClick={() => navigate(`/bugs/${bug._id}`)}
                >
                  <div className="flex-grow-1">
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)', marginBottom: 2 }}>{bug.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {bug.project?.name} · {new Date(bug.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <SeverityBadge severity={bug.severity} />
                  <StatusBadge   status={bug.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-lg-5 d-flex flex-column gap-4">
          {/* Resolution Progress */}
          <div className="card">
            <div className="card-header">Resolution Progress</div>
            <div className="card-body">
              {[['Open', open, 'var(--purple)'], ['In Progress', inProgress, 'var(--high)'], ['Fixed', fixed, 'var(--low)']].map(([lbl, val, clr]) => (
                <div key={lbl} className="mb-3">
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{lbl}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{val} / {total}</span>
                  </div>
                  <div className="progress" style={{ height: 5 }}>
                    <div className="progress-bar" style={{ width: `${total ? (val / total) * 100 : 0}%`, background: clr }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Bugs for Developer */}
          {isDeveloper && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>My Assigned Bugs</span>
                <button className="btn btn-outline-custom btn-sm" onClick={() => navigate('/my-bugs')}>View All</button>
              </div>
              <div className="card-body p-0">
                {myBugs.length === 0 ? (
                  <div className="text-center py-3" style={{ color: 'var(--text-muted)', fontSize: 12 }}>🎉 No bugs assigned!</div>
                ) : myBugs.slice(0, 4).map((bug, i) => (
                  <div
                    key={bug._id}
                    className="d-flex justify-content-between align-items-center px-3 cursor-pointer"
                    style={{ paddingTop: 10, paddingBottom: 10, borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}
                    onClick={() => navigate(`/bugs/${bug._id}`)}
                  >
                    <span style={{ fontSize: 12, color: 'var(--text-main)' }}>{bug.title.substring(0, 32)}...</span>
                    <StatusBadge status={bug.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects for Admin */}
          {isAdmin && (
            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <span>Projects</span>
                <button className="btn btn-outline-custom btn-sm" onClick={() => navigate('/projects')}>Manage</button>
              </div>
              <div className="card-body p-0">
                {projects.length === 0 ? (
                  <div className="text-center py-3" style={{ color: 'var(--text-muted)', fontSize: 12 }}>No projects yet.</div>
                ) : projects.slice(0, 4).map((p, i) => {
                  const pBugs = bugs.filter(b => b.project?._id === p._id || b.project === p._id);
                  return (
                    <div key={p._id} className="d-flex justify-content-between align-items-center px-3"
                      style={{ paddingTop: 10, paddingBottom: 10, borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pBugs.length} bugs</div>
                      </div>
                      <span className={`badge rounded-pill ${p.status === 'Active' ? 'badge-low' : 'badge-high'}`} style={{ fontSize: 10 }}>
                        {p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
