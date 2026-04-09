// ============================================================
// components/Shared/BugTable.jsx - Reusable Bug Table
// Unit 2: Component props, filtering state, React Router
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SeverityBadge from './SeverityBadge';
import StatusBadge   from './StatusBadge';
import EmptyState    from './EmptyState';

export default function BugTable({ bugs, projects = [], showFilters = true }) {
  const navigate = useNavigate();
  const [search,   setSearch]  = useState('');
  const [severity, setSev]     = useState('');
  const [status,   setStat]    = useState('');
  const [project,  setProj]    = useState('');

  const filtered = bugs.filter(b => {
    if (search   && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (severity && b.severity !== severity) return false;
    if (status   && b.status   !== status)   return false;
    if (project  && b.project?._id !== project && b.project !== project) return false;
    return true;
  });

  return (
    <div>
      {showFilters && (
        <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
          <div className="input-group" style={{ maxWidth: 280 }}>
            <span className="input-group-text" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              🔍
            </span>
            <input
              className="form-control"
              placeholder="Search bugs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" style={{ width: 'auto' }} value={severity} onChange={e => setSev(e.target.value)}>
            <option value="">All Severities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Low</option>
          </select>

          <select className="form-select" style={{ width: 'auto' }} value={status} onChange={e => setStat(e.target.value)}>
            <option value="">All Statuses</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Fixed</option>
          </select>

          {projects.length > 0 && (
            <select className="form-select" style={{ width: 'auto' }} value={project} onChange={e => setProj(e.target.value)}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}

          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', marginLeft: 'auto' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table-dark-custom">
            <thead>
              <tr>
                <th>Bug Title</th>
                <th>Project</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Reported By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState title="No bugs found" subtitle="Try adjusting your filters" />
                  </td>
                </tr>
              ) : (
                filtered.map(bug => (
                  <tr key={bug._id} className="cursor-pointer" onClick={() => navigate(`/bugs/${bug._id}`)}>
                    <td className="td-primary">
                      <div>{bug.title}</div>
                      <div>
                        {bug.tags?.map(t => (
                          <span key={t} className="badge me-1"
                            style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: 10, border: '1px solid var(--border)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{bug.project?.name || '—'}</td>
                    <td><SeverityBadge severity={bug.severity} /></td>
                    <td><StatusBadge   status={bug.status} /></td>
                    <td>
                      {bug.assignedTo ? (
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar avatar-sm">{bug.assignedTo.name?.slice(0, 2).toUpperCase()}</div>
                          <span style={{ fontSize: 12 }}>{bug.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12 }}>{bug.reportedBy?.name}</td>
                    <td style={{ fontSize: 11, fontFamily: 'monospace' }}>
                      {new Date(bug.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
