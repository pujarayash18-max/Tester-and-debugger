// components/Shared/LoadingSpinner.jsx
import React from 'react';
export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
      <div className="spinner-border" style={{ color: 'var(--accent)', width: 36, height: 36 }} />
      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{text}</span>
    </div>
  );
}
