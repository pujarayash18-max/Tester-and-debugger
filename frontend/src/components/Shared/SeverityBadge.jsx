// components/Shared/SeverityBadge.jsx
import React from 'react';
const DOT = { Critical: '🔴', High: '🟠', Low: '🟢' };
const CLS = { Critical: 'badge-critical', High: 'badge-high', Low: 'badge-low' };
export default function SeverityBadge({ severity }) {
  return <span className={`badge rounded-pill ${CLS[severity] || ''}`}>{DOT[severity]} {severity}</span>;
}
