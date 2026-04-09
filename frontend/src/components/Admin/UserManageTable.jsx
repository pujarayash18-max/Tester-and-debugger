// ============================================================
// components/Admin/UserManageTable.jsx
// Unit 2: Component with state
// Unit 4: Role-based access control UI (Admin only)
// ============================================================

import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../utils/api';

const ROLE_CLS = { Admin: 'badge-admin', Developer: 'badge-developer', Tester: 'badge-tester' };

export default function UserManageTable() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [editing,  setEditing]  = useState(null);
  const [editRole, setEditRole] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.getAll();
      setUsers(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally { setLoading(false); }
  };

  const handleEditRole = async (userId) => {
    try {
      const { data } = await usersAPI.update(userId, { role: editRole });
      setUsers(prev => prev.map(u => u._id === userId ? data.data : u));
      setEditing(null);
    } catch (err) { setError(err.response?.data?.message || 'Update failed'); }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await usersAPI.delete(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) { setError(err.response?.data?.message || 'Delete failed'); }
  };

  if (loading) return (
    <div className="text-center py-4">
      <div className="spinner-border" style={{ color: 'var(--accent)' }} />
    </div>
  );

  return (
    <div>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header d-flex justify-content-between align-items-center py-3">
          <h6 className="mb-0">All Users ({users.length})</h6>
          <button className="btn btn-accent btn-sm">+ Invite User</button>
        </div>
        <div className="table-responsive">
          <table className="table-dark-custom">
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar avatar-md">{u.name?.slice(0, 2).toUpperCase()}</div>
                      <span className="td-primary">{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.email}</td>
                  <td>
                    {editing === u._id ? (
                      <div className="d-flex gap-1">
                        <select className="form-select form-select-sm" value={editRole}
                          onChange={e => setEditRole(e.target.value)} style={{ width: 130 }}>
                          <option value="Admin">Admin</option>
                          <option value="Developer">Developer</option>
                          <option value="Tester">Tester</option>
                        </select>
                        <button className="btn btn-accent btn-sm" onClick={() => handleEditRole(u._id)}>✓</button>
                        <button className="btn btn-outline-custom btn-sm" onClick={() => setEditing(null)}>✕</button>
                      </div>
                    ) : (
                      <span className={`badge rounded-pill ${ROLE_CLS[u.role]}`}>{u.role}</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${u.isActive ? 'badge-low' : 'badge-critical'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, fontFamily: 'monospace' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-custom btn-sm"
                        onClick={() => { setEditing(u._id); setEditRole(u.role); }}>
                        Edit Role
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--critical)', border: '1px solid rgba(248,81,73,0.3)' }}
                        disabled={u.role === 'Admin'}
                        onClick={() => handleDelete(u._id)}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
