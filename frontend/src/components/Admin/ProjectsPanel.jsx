// ============================================================
// components/Admin/ProjectsPanel.jsx
// Unit 2: useState, useEffect, Forms, Custom Modal
// Unit 3: POST/GET/PUT/DELETE via Axios
// Unit 4: Role-based member assignment (Admin only)
// CO2, CO3, CO4
// ============================================================

import React, { useState, useEffect } from 'react';
import { useBugs } from '../../context/BugContext';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI, usersAPI } from '../../utils/api';
import EmptyState from '../Shared/EmptyState';

const ROLE_CLS   = { Admin: 'badge-admin', Developer: 'badge-developer', Tester: 'badge-tester' };
const STATUS_CLR = { Active: 'badge-low', Completed: 'badge-open', 'On Hold': 'badge-high' };
const STATUS_OPTIONS = ['Active', 'Completed', 'On Hold'];

export default function ProjectsPanel() {
  const { projects, bugs, fetchProjects, createProject, deleteProject } = useBugs();
  const { isAdmin } = useAuth();

  // ── All users fetched once ─────────────────────────────────
  const [allUsers, setAllUsers] = useState([]);

  // ── Modal modes: 'create' | 'edit' | 'assign' | null ──────
  const [mode,     setMode]     = useState(null);
  const [selected, setSelected] = useState(null);

  // ── Create / Edit form ─────────────────────────────────────
  const [form,     setForm]     = useState({ name: '', description: '', status: 'Active' });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');

  // ── Assign modal state ─────────────────────────────────────
  const [memberIds, setMemberIds] = useState([]); // selected member _id list
  const [assigning, setAssigning] = useState(false);
  const [assignErr, setAssignErr] = useState('');

  useEffect(() => {
    fetchProjects();
    loadUsers();
  }, [fetchProjects]);

  const loadUsers = async () => {
    try {
      const { data } = await usersAPI.getAll();
      setAllUsers(data.data);
    } catch {}
  };

  // ── Helpers ───────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name = 'Project name is required';
    else if (form.name.length < 3) e.name = 'Name must be at least 3 characters';
    return e;
  };

  const closeModal = () => { setMode(null); setSelected(null); setApiError(''); setAssignErr(''); };

  const openCreate = () => {
    setForm({ name: '', description: '', status: 'Active' });
    setErrors({}); setApiError('');
    setMode('create'); setSelected(null);
  };

  const openEdit = (project) => {
    setForm({ name: project.name, description: project.description || '', status: project.status || 'Active' });
    setErrors({}); setApiError('');
    setMode('edit'); setSelected(project);
  };

  const openAssign = (project) => {
    // Pre-tick existing members
    const existing = (project.members || []).map(m => m._id || m);
    setMemberIds(existing);
    setAssignErr('');
    setMode('assign'); setSelected(project);
  };

  // ── Toggle a member checkbox ──────────────────────────────
  const toggleMember = (userId) => {
    setMemberIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // ── Submit create / edit ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (mode === 'create') {
        await createProject({ name: form.name.trim(), description: form.description.trim(), status: form.status });
      } else {
        await projectsAPI.update(selected._id, {
          name: form.name.trim(), description: form.description.trim(), status: form.status,
        });
        await fetchProjects();
      }
      closeModal();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  // ── Submit assignment ─────────────────────────────────────
  const handleAssignSave = async () => {
    setAssigning(true); setAssignErr('');
    try {
      await projectsAPI.update(selected._id, { members: memberIds });
      await fetchProjects();
      closeModal();
    } catch (err) {
      setAssignErr(err.response?.data?.message || 'Failed to update members');
    } finally { setAssigning(false); }
  };

  // ── Delete project ────────────────────────────────────────
  const handleDelete = async (projectId, projectName) => {
    if (!window.confirm(`Delete "${projectName}" and all its bugs? This cannot be undone.`)) return;
    try { await deleteProject(projectId); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  // ── Per-project stats ─────────────────────────────────────
  const getStats = (projectId) => {
    const pBugs = bugs.filter(b => b.project?._id === projectId || b.project === projectId);
    return {
      total:      pBugs.length,
      open:       pBugs.filter(b => b.status === 'Open').length,
      inProgress: pBugs.filter(b => b.status === 'In Progress').length,
      fixed:      pBugs.filter(b => b.status === 'Fixed').length,
      progress:   pBugs.length ? Math.round((pBugs.filter(b => b.status === 'Fixed').length / pBugs.length) * 100) : 0,
    };
  };

  // ── Member display helpers ────────────────────────────────
  const getMemberObjects = (members = []) =>
    members.map(m => allUsers.find(u => u._id === (m._id || m))).filter(Boolean);

  const devAndTesters = allUsers.filter(u => u.role === 'Developer' || u.role === 'Tester');

  // ═════════════════════════════════════════════════════════
  return (
    <div>
      {/* ── Page Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="section-title mb-0">Projects</h5>
          <small style={{ color: 'var(--text-muted)' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </small>
        </div>
        {isAdmin && (
          <button className="btn btn-accent" onClick={openCreate}>+ New Project</button>
        )}
      </div>

      {/* ── Project Cards ── */}
      {projects.length === 0 ? (
        <EmptyState icon="◆" title="No projects yet" subtitle="Create your first project to get started" />
      ) : (
        <div className="row g-3">
          {projects.map(p => {
            const s       = getStats(p._id);
            const members = getMemberObjects(p.members || []);
            const devs    = members.filter(m => m.role === 'Developer');
            const testers = members.filter(m => m.role === 'Tester');

            return (
              <div key={p._id} className="col-md-6 col-lg-4">
                <div className="card h-100" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="card-body" style={{ flex: 1 }}>

                    {/* Top row */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="logo-box" style={{ width: 38, height: 38, fontSize: 16 }}>◆</div>
                      <span className={`badge rounded-pill ${STATUS_CLR[p.status] || 'badge-low'}`} style={{ fontSize: 10 }}>
                        {p.status}
                      </span>
                    </div>

                    <h6 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>{p.name}</h6>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12, minHeight: 32 }}>
                      {p.description || 'No description provided'}
                    </p>

                    {/* Progress */}
                    <div className="progress mb-2" style={{ height: 4 }}>
                      <div className="progress-bar progress-bar-accent" style={{ width: `${s.progress}%` }} />
                    </div>
                    <div className="d-flex justify-content-between mb-3" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>{s.progress}% resolved</span>
                      <span>{s.total} total bugs</span>
                    </div>

                    {/* Bug stats */}
                    <div className="row g-2 text-center mb-3">
                      {[['Open', s.open, 'var(--critical)'], ['Progress', s.inProgress, 'var(--high)'], ['Fixed', s.fixed, 'var(--low)']].map(([lbl, val, color]) => (
                        <div key={lbl} className="col-4">
                          <div className="py-2 rounded" style={{ background: 'var(--bg-input)' }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'monospace' }}>{val}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{lbl}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Assigned Members ── */}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: 'monospace' }}>
                        Team Members ({members.length})
                      </div>

                      {members.length === 0 ? (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No members assigned yet
                        </div>
                      ) : (
                        <div>
                          {/* Developers */}
                          {devs.length > 0 && (
                            <div className="mb-2">
                              <div style={{ fontSize: 10, color: 'var(--accent)', marginBottom: 4, fontWeight: 600 }}>
                                Developers ({devs.length})
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                {devs.map(d => (
                                  <div key={d._id} className="d-flex align-items-center gap-1 px-2 py-1 rounded"
                                    style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', fontSize: 11 }}>
                                    <div className="avatar" style={{ width: 16, height: 16, fontSize: 7, borderRadius: 3 }}>
                                      {d.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span style={{ color: 'var(--text-main)' }}>{d.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Testers */}
                          {testers.length > 0 && (
                            <div>
                              <div style={{ fontSize: 10, color: '#ff9f9f', marginBottom: 4, fontWeight: 600 }}>
                                Testers ({testers.length})
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                {testers.map(t => (
                                  <div key={t._id} className="d-flex align-items-center gap-1 px-2 py-1 rounded"
                                    style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', fontSize: 11 }}>
                                    <div className="avatar" style={{ width: 16, height: 16, fontSize: 7, borderRadius: 3 }}>
                                      {t.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span style={{ color: 'var(--text-main)' }}>{t.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Card Footer Buttons ── */}
                  {isAdmin && (
                    <div className="card-footer d-flex gap-2 flex-wrap">
                      <button className="btn btn-outline-custom btn-sm" onClick={() => openEdit(p)}>✏ Edit</button>
                      <button className="btn btn-accent btn-sm" onClick={() => openAssign(p)}>👥 Assign Members</button>
                      <button className="btn btn-sm ms-auto"
                        style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--critical)', border: '1px solid rgba(248,81,73,0.3)' }}
                        onClick={() => handleDelete(p._id, p.name)}>
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODAL: Create / Edit
      ════════════════════════════════════════════════════ */}
      {(mode === 'create' || mode === 'edit') && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 1040, background: 'rgba(0,0,0,0.65)' }} onClick={closeModal} />
          <div
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1050, width: '100%', maxWidth: 540, padding: '0 16px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
              {/* Header */}
              <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ margin: 0, color: 'var(--text-main)', fontSize: 15, fontWeight: 600 }}>
                    {mode === 'create' ? '+ Create New Project' : '✏ Edit Project'}
                  </h5>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {mode === 'edit' ? `Editing: ${selected?.name}` : 'Fill in the details below'}
                  </div>
                </div>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
              </div>

              {/* Body */}
              <div style={{ padding: '20px 24px' }}>
                {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label">Project Name <span className="text-danger">*</span></label>
                    <input autoFocus name="name" value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: undefined })); }}
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`} placeholder="e.g. E-Commerce Platform" />
                    <div className="invalid-feedback">{errors.name}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea name="description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      className="form-control" rows={3} placeholder="Brief description of the project..." />
                  </div>
                  {mode === 'edit' && (
                    <div className="mb-2">
                      <label className="form-label">Status</label>
                      <select name="status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="form-select">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </form>
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="btn btn-outline-custom" onClick={closeModal}>Cancel</button>
                <button className="btn btn-accent" onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2" />{mode === 'create' ? 'Creating...' : 'Saving...'}</>
                    : mode === 'create' ? 'Create Project' : 'Save Changes ✓'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════
          MODAL: Assign Members
      ════════════════════════════════════════════════════ */}
      {mode === 'assign' && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 1040, background: 'rgba(0,0,0,0.65)' }} onClick={closeModal} />
          <div
            style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1050, width: '100%', maxWidth: 560, padding: '0 16px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 24px 64px rgba(0,0,0,0.6)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>

              {/* Header */}
              <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <h5 style={{ margin: 0, color: 'var(--text-main)', fontSize: 15, fontWeight: 600 }}>
                    👥 Assign Team Members
                  </h5>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Project: <strong style={{ color: 'var(--accent)' }}>{selected?.name}</strong>
                  </div>
                </div>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
              </div>

              {/* Info banner */}
              <div style={{ padding: '10px 24px', background: 'rgba(0,212,170,0.06)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ✓ Tick the Developers and Testers you want to add to this project. Untick to remove.
                </div>
              </div>

              {/* Body — scrollable */}
              <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
                {assignErr && <div className="alert alert-danger py-2 mb-3">{assignErr}</div>}

                {devAndTesters.length === 0 ? (
                  <div className="text-center py-4" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    No Developer or Tester users found.<br />
                    <small>Register Developer/Tester accounts first.</small>
                  </div>
                ) : (
                  <>
                    {/* Developers section */}
                    {devAndTesters.filter(u => u.role === 'Developer').length > 0 && (
                      <div className="mb-4">
                        <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace', fontWeight: 700, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                          Developers
                        </div>
                        {devAndTesters.filter(u => u.role === 'Developer').map(u => {
                          const checked = memberIds.includes(u._id);
                          return (
                            <div key={u._id}
                              onClick={() => toggleMember(u._id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                                marginBottom: 6, transition: 'background 0.15s',
                                background: checked ? 'rgba(0,212,170,0.1)' : 'var(--bg-input)',
                                border: `1px solid ${checked ? 'rgba(0,212,170,0.35)' : 'var(--border)'}`,
                              }}
                            >
                              {/* Custom checkbox */}
                              <div style={{
                                width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                                background: checked ? 'var(--accent)' : 'transparent',
                                border: `2px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, color: '#0d1117', fontWeight: 700,
                                transition: 'all 0.15s',
                              }}>
                                {checked && '✓'}
                              </div>
                              <div className="avatar avatar-sm">{u.name.slice(0, 2).toUpperCase()}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.email}</div>
                              </div>
                              <span className="badge rounded-pill badge-developer" style={{ fontSize: 10 }}>Developer</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Testers section */}
                    {devAndTesters.filter(u => u.role === 'Tester').length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: '#ff9f9f', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace', fontWeight: 700, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                          Testers
                        </div>
                        {devAndTesters.filter(u => u.role === 'Tester').map(u => {
                          const checked = memberIds.includes(u._id);
                          return (
                            <div key={u._id}
                              onClick={() => toggleMember(u._id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                                marginBottom: 6, transition: 'background 0.15s',
                                background: checked ? 'rgba(248,81,73,0.08)' : 'var(--bg-input)',
                                border: `1px solid ${checked ? 'rgba(248,81,73,0.35)' : 'var(--border)'}`,
                              }}
                            >
                              <div style={{
                                width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                                background: checked ? 'var(--critical)' : 'transparent',
                                border: `2px solid ${checked ? 'var(--critical)' : 'var(--border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, color: '#fff', fontWeight: 700,
                                transition: 'all 0.15s',
                              }}>
                                {checked && '✓'}
                              </div>
                              <div className="avatar avatar-sm">{u.name.slice(0, 2).toUpperCase()}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.email}</div>
                              </div>
                              <span className="badge rounded-pill badge-tester" style={{ fontSize: 10 }}>Tester</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {memberIds.length} member{memberIds.length !== 1 ? 's' : ''} selected
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-custom" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-accent" onClick={handleAssignSave} disabled={assigning}>
                    {assigning
                      ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                      : '✓ Save Team'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
