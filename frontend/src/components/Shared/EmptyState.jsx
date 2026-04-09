// components/Shared/EmptyState.jsx
import React from 'react';
export default function EmptyState({ icon = '⚠', title = 'Nothing here', subtitle = '' }) {
  return (
    <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 40, opacity: 0.3, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12 }}>{subtitle}</div>}
    </div>
  );
}
