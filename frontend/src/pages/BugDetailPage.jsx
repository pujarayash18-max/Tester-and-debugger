// ============================================================
// pages/BugDetailPage.jsx - Full Bug Detail View
// Unit 2: useEffect, useState, React Router params
// Unit 3: GET/PUT/POST API calls
// CO2, CO3: Full-stack bug management
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bugsAPI, usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SeverityBadge  from '../components/Shared/SeverityBadge';
import StatusBadge    from '../components/Shared/StatusBadge';
import LoadingSpinner from '../components/Shared/LoadingSpinner';

const STATUS_FLOW = ['Open', 'In Progress', 'Fixed'];

export default function BugDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isDeveloper } = useAuth();

  const [bug,      setBug]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [comment,  setComment]  = useState('');
  const [devs,     setDevs]     = useState([]);
  const [assignTo, setAssignTo] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadBug();
    if (isAdmin) loadDevs();
  }, [id]);

  const loadBug = async () => {
    setLoading(true);
    try {
      const { data } = await bugsAPI.getById(id);
      setBug(data.data);
      setAssignTo(data.data.assignedTo?._id || '');
    } catch { setError('Bug not found or access denied.'); }
    finally   { setLoading(false); }
  };

  const loadDevs = async () => {
    try {
      const { data } = await usersAPI.getAll();
      setDevs(data.data.filter(u => u.role === 'Developer'));
    } catch {}
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const { data } = await bugsAPI.update(id, { status: newStatus });
      setBug(data.data);
    } catch (err) { alert(err.response?.data?.message || 'Update failed'); }
    finally { setUpdating(false); }
  };

  const handleAssign = async () => {
    setUpdating(true);
    try {
      const { data } = await bugsAPI.update(id, { assignedTo: assignTo || null });
      setBug(data.data);
    } catch (err) { alert(err.response?.data?.message || 'Assign failed'); }
    finally { setUpdating(false); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const { data } = await bugsAPI.addComment(id, { text: comment.trim() });
      setBug(prev => ({ ...prev, comments: data.data }));
      setComment('');
    } catch (err) { alert(err.response?.data?.message || 'Comment failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this bug permanently?')) return;
    try { await bugsAPI.delete(id); navigate('/bugs'); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  if (loading) return <LoadingSpinner text="Loading bug details..." />;
  if (error)   return <div className="alert alert-danger">{error}</div>;
  if (!bug)    return null;

  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(bug.status) + 1];
  const canUpdate  = isAdmin || isDeveloper;

  return (
    <div>
      <button className="btn btn-outline-custom btn-sm mb-3" onClick={() => navigate('/bugs')}>
        ← Back to Bugs
      </button>

      <div className="row g-4">
        {/* Main */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <SeverityBadge severity={bug.severity} />
                <StatusBadge   status={bug.status} />
                {bug.tags?.map(t => (
                  <span key={t} className="badge"
                    style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', fontSize: 11, border: '1px solid var(--border)' }}>
                    {t}
                  </span>
                ))}
              </div>

              <h4 style={{ color: 'var(--text-main)', fontWeight: 700 }}>{bug.title}</h4>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: 20 }}>
                #{bug._id} · {bug.project?.name} · Reported {new Date(bug.createdAt).toLocaleDateString('en-IN')}
              </div>

              <div className="p-3 rounded mb-4" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                <div className="form-label mb-2">Description</div>
                <p style={{ color: 'var(--text-main)', fontSize: 13, lineHeight: 1.8, margin: 0 }}>{bug.description}</p>
              </div>

              {canUpdate && (
                <div className="d-flex gap-2 flex-wrap">
                  {nextStatus && (
                    <button className="btn btn-accent btn-sm" disabled={updating}
                      onClick={() => handleStatusUpdate(nextStatus)}>
                      {updating
                        ? <span className="spinner-border spinner-border-sm" />
                        : `Move to: ${nextStatus} →`}
                    </button>
                  )}
                  {isAdmin && bug.status !== 'Open' && (
                    <button className="btn btn-outline-custom btn-sm" onClick={() => handleStatusUpdate('Open')}>
                      ↺ Reopen
                    </button>
                  )}
                  {isAdmin && (
                    <button className="btn btn-sm ms-auto"
                      style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--critical)', border: '1px solid rgba(248,81,73,0.3)' }}
                      onClick={handleDelete}>
                      Delete Bug
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <div className="card-header">Comments ({bug.comments?.length || 0})</div>
            <div className="card-body">
              {bug.comments?.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic' }}>No comments yet.</p>
              )}
              {bug.comments?.map(c => (
                <div key={c._id} className="comment-box">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <div className="avatar avatar-sm">{c.postedBy?.name?.slice(0, 2).toUpperCase()}</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{c.postedBy?.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {new Date(c.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{c.text}</p>
                </div>
              ))}
              <form onSubmit={handleComment} className="mt-3 d-flex gap-2">
                <input className="form-control" value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment..." />
                <button type="submit" className="btn btn-accent btn-sm" disabled={!comment.trim()}>Post</button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card mb-3">
            <div className="card-header">Details</div>
            <div className="card-body">
              <div className="mb-3">
                <div className="form-label">Reported By</div>
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-sm">{bug.reportedBy?.name?.slice(0, 2).toUpperCase()}</div>
                  <span style={{ fontSize: 13, color: 'var(--text-main)' }}>{bug.reportedBy?.name}</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="form-label">Assigned To</div>
                {isAdmin ? (
                  <div className="d-flex gap-2">
                    <select className="form-select form-select-sm" value={assignTo}
                      onChange={e => setAssignTo(e.target.value)}>
                      <option value="">Unassigned</option>
                      {devs.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                    <button className="btn btn-accent btn-sm" onClick={handleAssign} disabled={updating}>Save</button>
                  </div>
                ) : bug.assignedTo ? (
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar avatar-sm">{bug.assignedTo?.name?.slice(0, 2).toUpperCase()}</div>
                    <span style={{ fontSize: 13, color: 'var(--text-main)' }}>{bug.assignedTo?.name}</span>
                  </div>
                ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unassigned</span>}
              </div>

              <div className="mb-3">
                <div className="form-label">Project</div>
                <span style={{ color: 'var(--text-main)', fontSize: 13 }}>{bug.project?.name}</span>
              </div>

              <div>
                <div className="form-label">Last Updated</div>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  {new Date(bug.updatedAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="card">
            <div className="card-header">Activity Log</div>
            <div className="card-body p-3">
              {bug.activityLog?.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" />
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-main)' }}>
                      {a.action}{' '}
                      <span style={{ color: 'var(--text-muted)' }}>by {a.performedBy?.name}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {new Date(a.performedAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
