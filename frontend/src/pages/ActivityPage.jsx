// ============================================================
// pages/ActivityPage.jsx - Global Activity Log
// Unit 2: useEffect, useContext
// ============================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBugs } from '../context/BugContext';
import LoadingSpinner from '../components/Shared/LoadingSpinner';

export default function ActivityPage() {
  const { bugs, fetchBugs, loading } = useBugs();
  const navigate = useNavigate();

  useEffect(() => { fetchBugs(); }, [fetchBugs]);

  const allActivity = bugs
    .flatMap(b => (b.activityLog || []).map(a => ({ ...a, bugTitle: b.title, bugId: b._id })))
    .sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-4">
        <h4 className="section-title">Activity Log</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Full audit trail of all bug-related actions</p>
      </div>
      <div className="card">
        <div className="card-body p-4">
          {allActivity.length === 0 ? (
            <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No activity recorded yet.</div>
          ) : allActivity.map((a, i) => (
            <div key={i} className="activity-item">
              <div className="activity-dot" />
              <div className="flex-grow-1">
                <span style={{ fontSize: 13, color: 'var(--text-main)' }}>{a.action}</span>
                {a.performedBy?.name && (
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> by {a.performedBy.name}</span>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> on </span>
                <span
                  className="text-accent"
                  style={{ fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => navigate(`/bugs/${a.bugId}`)}
                >
                  {a.bugTitle}
                </span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {new Date(a.performedAt).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
