// ============================================================
// components/Tester/ReportBugForm.jsx
// Unit 2: Forms & validation, controlled components
// Unit 3: POST to REST API via Axios
// CO2, CO3: Frontend-Backend integration
// CO4: Role-based project member filtering
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBugs } from '../../context/BugContext';
import { usersAPI } from '../../utils/api';

export default function ReportBugForm() {
  const { createBug, fetchProjects, projects } = useBugs();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', project: '',
    severity: '', assignedTo: '', tags: ''
  });
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [apiError,     setApiError]     = useState('');
  const [allUsers,     setAllUsers]     = useState([]);
  const [projectDevs,  setProjectDevs]  = useState([]);
  const [projectTesters, setProjectTesters] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchProjects();
    loadAllUsers();
  }, [fetchProjects]);

  const loadAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await usersAPI.getAll();
      setAllUsers(data.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // ── When project changes, filter members ──────────────────
  useEffect(() => {
    if (!form.project || allUsers.length === 0) {
      setProjectDevs([]);
      setProjectTesters([]);
      setForm(p => ({ ...p, assignedTo: '' }));
      return;
    }

    const selectedProject = projects.find(p => p._id === form.project);
    if (!selectedProject) return;

    // members can be: array of strings, array of {_id}, or array of populated user objects
    // Normalize all to plain string IDs
    const memberIds = (selectedProject.members || []).map(m => {
      if (typeof m === 'string') return m;
      if (m._id)  return String(m._id);
      if (m.id)   return String(m.id);
      return String(m);
    });

    console.log('Project members raw:', selectedProject.members);
    console.log('Normalized memberIds:', memberIds);
    console.log('All users:', allUsers.map(u => ({ id: u._id, name: u.name, role: u.role })));

    const devs    = allUsers.filter(u => u.role === 'Developer' && memberIds.includes(String(u._id)));
    const testers = allUsers.filter(u => u.role === 'Tester'    && memberIds.includes(String(u._id)));

    console.log('Filtered devs:', devs);
    console.log('Filtered testers:', testers);

    setProjectDevs(devs);
    setProjectTesters(testers);
    setForm(p => ({ ...p, assignedTo: '' }));
  }, [form.project, projects, allUsers]);

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim())                e.title       = 'Title is required';
    else if (form.title.length < 10)       e.title       = 'Title must be at least 10 characters';
    if (!form.description.trim())          e.description = 'Description is required';
    else if (form.description.length < 20) e.description = 'Provide a detailed description (min 20 characters)';
    if (!form.project)  e.project  = 'Please select a project';
    if (!form.severity) e.severity = 'Please select severity level';
    return e;
  };

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: undefined }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await createBug({
        title:       form.title.trim(),
        description: form.description.trim(),
        project:     form.project,
        severity:    form.severity,
        assignedTo:  form.assignedTo || undefined,
        tags:        form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      setSuccess(true);
      setTimeout(() => navigate('/bugs'), 1800);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to submit bug report');
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setForm({ title: '', description: '', project: '', severity: '', assignedTo: '', tags: '' });
    setErrors({});
    setApiError('');
    setProjectDevs([]);
    setProjectTesters([]);
  };

  if (success) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="text-center">
        <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
        <h5 className="fw-bold" style={{ color: 'var(--accent)' }}>Bug Reported Successfully!</h5>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Redirecting to Bug Tracker...</p>
      </div>
    </div>
  );

  const selectedProject    = projects.find(p => p._id === form.project);
  const hasProjectSelected = !!form.project;
  const hasMembers         = projectDevs.length > 0 || projectTesters.length > 0;
  const hasDevs            = projectDevs.length > 0;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Report a New Bug</h5>
            <small style={{ color: 'var(--text-muted)' }}>
              Provide detailed information for faster resolution
            </small>
          </div>

          <div className="card-body p-4">
            {apiError && <div className="alert alert-danger">{apiError}</div>}

            <form onSubmit={handleSubmit} noValidate>

              {/* ── Bug Title ── */}
              <div className="mb-3">
                <label className="form-label">Bug Title <span className="text-danger">*</span></label>
                <input
                  name="title" value={form.title} onChange={handleChange}
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="Short, descriptive title of the issue"
                />
                <div className="invalid-feedback">{errors.title}</div>
                <div className="form-text" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {form.title.length}/100 — Min 10 characters
                </div>
              </div>

              {/* ── Description ── */}
              <div className="mb-3">
                <label className="form-label">Description <span className="text-danger">*</span></label>
                <textarea
                  name="description" value={form.description} onChange={handleChange} rows={4}
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  placeholder="Steps to reproduce, expected vs actual behavior, browser version, environment..."
                />
                <div className="invalid-feedback">{errors.description}</div>
                <div className="form-text" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {form.description.length} characters — Min 20 required
                </div>
              </div>

              {/* ── Project & Severity ── */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Project <span className="text-danger">*</span></label>
                  <select
                    name="project" value={form.project} onChange={handleChange}
                    className={`form-select ${errors.project ? 'is-invalid' : ''}`}
                  >
                    <option value="">Select project</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="invalid-feedback">{errors.project}</div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Severity <span className="text-danger">*</span></label>
                  <select
                    name="severity" value={form.severity} onChange={handleChange}
                    className={`form-select ${errors.severity ? 'is-invalid' : ''}`}
                  >
                    <option value="">Select severity</option>
                    <option value="Critical">🔴 Critical — App breaking</option>
                    <option value="High">🟠 High — Major feature broken</option>
                    <option value="Low">🟢 Low — Minor issue</option>
                  </select>
                  <div className="invalid-feedback">{errors.severity}</div>
                </div>
              </div>

              {/* ── Severity hint ── */}
              {form.severity && (
                <div className={`alert py-2 mb-3 alert-${form.severity === 'Critical' ? 'danger' : form.severity === 'High' ? 'warning' : 'success'}`}
                  style={{ fontSize: 12 }}>
                  {form.severity === 'Critical' && '🔴 Critical bugs are escalated immediately.'}
                  {form.severity === 'High'     && '🟠 High severity bugs are prioritized in the next sprint.'}
                  {form.severity === 'Low'      && '🟢 Low severity bugs are addressed in routine maintenance.'}
                </div>
              )}

              {/* ── Project Team Preview (shows once project is selected) ── */}
              {hasProjectSelected && hasMembers && (
                <div className="mb-3 p-3 rounded" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'monospace' }}>
                    Project Team — {selectedProject?.name}
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {projectDevs.map(d => (
                      <div key={d._id} className="d-flex align-items-center gap-2 px-2 py-1 rounded"
                        style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)', fontSize: 12 }}>
                        <div className="avatar" style={{ width: 20, height: 20, fontSize: 8, borderRadius: 4 }}>
                          {d.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ color: 'var(--text-main)' }}>{d.name}</span>
                        <span className="badge rounded-pill badge-developer" style={{ fontSize: 9 }}>Dev</span>
                      </div>
                    ))}
                    {projectTesters.map(t => (
                      <div key={t._id} className="d-flex align-items-center gap-2 px-2 py-1 rounded"
                        style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.25)', fontSize: 12 }}>
                        <div className="avatar" style={{ width: 20, height: 20, fontSize: 8, borderRadius: 4 }}>
                          {t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ color: 'var(--text-main)' }}>{t.name}</span>
                        <span className="badge rounded-pill badge-tester" style={{ fontSize: 9 }}>Tester</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Assign Developer ── */}
              <div className="mb-3">
                <label className="form-label">
                  Assign to Developer
                  {hasProjectSelected && (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 11, marginLeft: 6 }}>
                      (only developers assigned to this project)
                    </span>
                  )}
                </label>

                {/* No project selected */}
                {!hasProjectSelected && (
                  <div className="form-control" style={{ color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.6 }}>
                    Select a project first to see available developers
                  </div>
                )}

                {/* Loading users */}
                {hasProjectSelected && loadingUsers && (
                  <div className="form-control d-flex align-items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span className="spinner-border spinner-border-sm" style={{ color: 'var(--accent)' }} />
                    Loading team members...
                  </div>
                )}

                {/* No members assigned to project */}
                {hasProjectSelected && !loadingUsers && !hasMembers && (
                  <div className="alert alert-warning py-2 mb-0" style={{ fontSize: 12 }}>
                    ⚠ No Developers or Testers are assigned to <strong>{selectedProject?.name}</strong> yet.
                    Ask your Admin to assign team members to this project via the Projects page.
                  </div>
                )}

                {/* Has members but no devs specifically */}
                {hasProjectSelected && !loadingUsers && hasMembers && !hasDevs && (
                  <>
                    <div className="form-control" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                      No developers in this project — bug will remain unassigned
                    </div>
                    <div className="form-text" style={{ color: '#ff9f9f', fontSize: 11 }}>
                      Only Testers are assigned. Admin can add Developers via the Projects page.
                    </div>
                  </>
                )}

                {/* Show developer dropdown */}
                {hasProjectSelected && !loadingUsers && hasDevs && (
                  <>
                    <select
                      name="assignedTo" value={form.assignedTo} onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">— Leave Unassigned —</option>
                      {projectDevs.map(d => (
                        <option key={d._id} value={d._id}>
                          {d.name} · {d.email}
                        </option>
                      ))}
                    </select>
                    <div className="form-text" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {projectDevs.length} developer{projectDevs.length !== 1 ? 's' : ''} available in <strong>{selectedProject?.name}</strong>
                    </div>
                  </>
                )}
              </div>

              {/* ── Tags ── */}
              <div className="mb-4">
                <label className="form-label">
                  Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated, optional)</span>
                </label>
                <input
                  name="tags" value={form.tags} onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. frontend, login, api, database"
                />
                <div className="form-text" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  Tags help categorize and filter bugs quickly
                </div>
              </div>

              {/* ── Buttons ── */}
              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-outline-custom" onClick={handleReset}>
                  Reset Form
                </button>
                <button type="submit" className="btn btn-accent" disabled={loading}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                    : '✦ Submit Bug Report'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}