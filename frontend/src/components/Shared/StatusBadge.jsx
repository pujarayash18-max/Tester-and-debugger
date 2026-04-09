// components/Shared/StatusBadge.jsx
import React from 'react';
const CLS = { 'Open': 'badge-open', 'In Progress': 'badge-inprogress', 'Fixed': 'badge-fixed' };
export default function StatusBadge({ status }) {
  return <span className={`badge rounded-pill ${CLS[status] || ''}`}>{status}</span>;
}
