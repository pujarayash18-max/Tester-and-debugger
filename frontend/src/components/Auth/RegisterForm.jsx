// ============================================================
// components/Auth/RegisterForm.jsx
// Unit 2: Forms & validation with React controlled components
// ============================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Tester' });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2)    e.name            = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email       = 'Valid email is required';
    if (!form.password || form.password.length < 6)   e.password        = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)        e.confirmPassword = 'Passwords do not match';
    if (!form.role)                                    e.role            = 'Select a role';
    return e;
  };

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="text-center mb-4">
          <div className="logo-box mx-auto mb-3" style={{ width: 52, height: 52, fontSize: 18 }}>BT</div>
          <h4 className="fw-bold" style={{ color: 'var(--text-main)' }}>Create Account</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>BugTracker Pro · MERN Stack</p>
        </div>

        {apiError && <div className="alert alert-danger py-2 mb-3">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange}
              className={`form-control ${errors.name ? 'is-invalid' : ''}`} placeholder="John Doe" />
            <div className="invalid-feedback">{errors.name}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="your@email.com" />
            <div className="invalid-feedback">{errors.email}</div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`} placeholder="Min 6 chars" />
              <div className="invalid-feedback">{errors.password}</div>
            </div>
            <div className="col">
              <label className="form-label">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} placeholder="Repeat" />
              <div className="invalid-feedback">{errors.confirmPassword}</div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Role</label>
            <select name="role" value={form.role} onChange={handleChange}
              className={`form-select ${errors.role ? 'is-invalid' : ''}`}>
              <option value="Tester">Tester</option>
              <option value="Developer">Developer</option>
              <option value="Admin">Admin</option>
            </select>
            <div className="invalid-feedback">{errors.role}</div>
          </div>

          <button type="submit" className="btn btn-accent w-100 py-2" disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
              : 'Create Account →'}
          </button>
        </form>

        <p className="text-center mt-3" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
