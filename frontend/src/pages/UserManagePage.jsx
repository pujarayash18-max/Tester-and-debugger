import React from 'react';
import UserManageTable from '../components/Admin/UserManageTable';
export default function UserManagePage() {
  return (
    <div>
      <div className="mb-4">
        <h4 className="section-title">User Management</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Admin-only: Manage roles and access control</p>
      </div>
      <UserManageTable />
    </div>
  );
}
