// ============================================================
// components/Auth/LoginForm.jsx
// Unit 2: Forms & validation (controlled components)
// Unit 4: JWT-based authentication
// CO4: Security implementation
// ============================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Validation
  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';

    if (!form.password) e.password = 'Password is required';

    return e;
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setApiError('');
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-box">

        {/* Logo */}
        <div className="text-center mb-4">
          <div
            className="logo-box mx-auto mb-3"
            style={{ width: 52, height: 52, fontSize: 18 }}
          >
            BT
          </div>
          <h4 className="fw-bold" style={{ color: 'var(--text-main)' }}>
            BugTracker Pro
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            MERN Stack · AWT (01CE1412)
          </p>
        </div>

        {/* ❌ Demo Credentials Removed */}

        {/* API Error */}
        {apiError && (
          <div className="alert alert-danger py-2 mb-3">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="your@email.com"
            />
            <div className="invalid-feedback">{errors.email}</div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter password"
            />
            <div className="invalid-feedback">{errors.password}</div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-accent w-100 py-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Authenticating...
              </>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        {/* Register */}
        <p
          className="text-center mt-3"
          style={{ fontSize: 12, color: 'var(--text-muted)' }}
        >
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }}>
            Register here
          </Link>
        </p>

        {/* Footer */}
        <div
          className="text-center mt-2"
          style={{ fontSize: 10, color: 'var(--text-muted)' }}
        >
          JWT Authentication · bcrypt Hashing · Role-Based Access
        </div>

      </div>
    </div>
  );
}