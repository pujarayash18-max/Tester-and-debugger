// ============================================================
// pages/BugListPage.jsx
// Unit 2: useEffect, Axios fetch, filter state
// ============================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBugs } from '../context/BugContext';
import { useAuth } from '../context/AuthContext';
import BugTable       from '../components/Shared/BugTable';
import LoadingSpinner from '../components/Shared/LoadingSpinner';

export default function BugListPage() {
  const { bugs, projects, fetchBugs, fetchProjects, loading } = useBugs();
  const { isAdmin, isTester } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchBugs(); fetchProjects(); }, [fetchBugs, fetchProjects]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="section-title">Bug Tracker</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{bugs.length} total issues</p>
        </div>
        {(isTester || isAdmin) && (
          <button className="btn btn-accent" onClick={() => navigate('/report')}>+ Report Bug</button>
        )}
      </div>
      {loading ? <LoadingSpinner /> : <BugTable bugs={bugs} projects={projects} showFilters={true} />}
    </div>
  );
}
