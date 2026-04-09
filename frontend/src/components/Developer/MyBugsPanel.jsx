// ============================================================
// components/Developer/MyBugsPanel.jsx
// Unit 2: useState, useEffect, Axios integration
// CO2, CO3: Developer dashboard for assigned bugs
// ============================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBugs } from '../../context/BugContext';
import { useAuth } from '../../context/AuthContext';
import SeverityBadge  from '../Shared/SeverityBadge';
import StatusBadge    from '../Shared/StatusBadge';
import EmptyState     from '../Shared/EmptyState';
import LoadingSpinner from '../Shared/LoadingSpinner';

export default function MyBugsPanel() {
  const { bugs, fetchBugs, updateBug, loading } = useBugs();
  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => { fetchBugs(); }, [fetchBugs]);

  const myBugs    = bugs.filter(b => b.assignedTo?._id === user._id || b.assignedTo === user._id);
  const unclaimed = bugs.filter(b => !b.assignedTo && b.status === 'Open');

  const handleClaim = async (bugId) => {
    try { await updateBug(bugId, { assignedTo: user._id, status: 'In Progress' }); }
    catch (err) { alert(err.response?.data?.message || 'Failed to claim bug'); }
  };

  const handleStatusUpdate = async (bugId, newStatus) => {
    try { await updateBug(bugId, { status: newStatus }); }
    catch (err) { alert(err.response?.data?.message || 'Update failed'); }
  };

  if (loading) return <LoadingSpinner text="Loading your bugs..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="section-title mb-0">My Assigned Bugs</h5>
          <small style={{ color: 'var(--text-muted)' }}>
            {myBugs.length} bug{myBugs.length !== 1 ? 's' : ''} assigned to you
          </small>
        </div>
      </div>

      {myBugs.length === 0 ? (
        <div className="card mb-4">
          <EmptyState icon="✓" title="No bugs assigned" subtitle="You're all clear! Check unclaimed bugs below." />
        </div>
      ) : (
        <div className="card mb-4" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="table-dark-custom">
              <thead>
                <tr><th>Title</th><th>Project</th><th>Severity</th><th>Status</th><th>Quick Action</th></tr>
              </thead>
              <tbody>
                {myBugs.map(bug => (
                  <tr key={bug._id}>
                    <td className="td-primary cursor-pointer" onClick={() => navigate(`/bugs/${bug._id}`)}>
                      {bug.title}
                    </td>
                    <td>{bug.project?.name || '—'}</td>
                    <td><SeverityBadge severity={bug.severity} /></td>
                    <td><StatusBadge   status={bug.status} /></td>
                    <td>
                      {bug.status === 'Open' && (
                        <button className="btn btn-outline-custom btn-sm" onClick={() => handleStatusUpdate(bug._id, 'In Progress')}>
                          ▶ Start
                        </button>
                      )}
                      {bug.status === 'In Progress' && (
                        <button className="btn btn-accent btn-sm" onClick={() => handleStatusUpdate(bug._id, 'Fixed')}>
                          ✓ Mark Fixed
                        </button>
                      )}
                      {bug.status === 'Fixed' && (
                        <span style={{ color: 'var(--low)', fontSize: 12 }}>✓ Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {unclaimed.length > 0 && (
        <>
          <div className="mb-3">
            <h5 className="section-title mb-0">Unclaimed Bugs</h5>
            <small style={{ color: 'var(--text-muted)' }}>Pick up open issues to work on</small>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table-dark-custom">
                <thead>
                  <tr><th>Title</th><th>Project</th><th>Severity</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {unclaimed.map(bug => (
                    <tr key={bug._id}>
                      <td className="td-primary">{bug.title}</td>
                      <td>{bug.project?.name || '—'}</td>
                      <td><SeverityBadge severity={bug.severity} /></td>
                      <td>
                        <button className="btn btn-accent btn-sm" onClick={() => handleClaim(bug._id)}>
                          Claim Bug
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
