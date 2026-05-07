import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../features/authSlice';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'jobseeker', company: '' });

  useEffect(() => { if (user) navigate('/'); return () => dispatch(clearError()); }, [user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Fill all required fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.role === 'employer' && !form.company) { toast.error('Company name is required for employers'); return; }
    dispatch(registerUser(form));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">HireNow</div>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Join thousands of job seekers and employers.</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full Name</label><input type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Email</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
          <div className="form-group">
            <label>I am a</label>
            <div className="role-picker">
              <label className={`role-option ${form.role === 'jobseeker' ? 'selected' : ''}`}>
                <input type="radio" name="role" value="jobseeker" checked={form.role === 'jobseeker'} onChange={() => setForm({ ...form, role: 'jobseeker', company: '' })} />
                <span>🔍 Job Seeker</span>
              </label>
              <label className={`role-option ${form.role === 'employer' ? 'selected' : ''}`}>
                <input type="radio" name="role" value="employer" checked={form.role === 'employer'} onChange={() => setForm({ ...form, role: 'employer' })} />
                <span>🏢 Employer</span>
              </label>
            </div>
          </div>
          {form.role === 'employer' && (
            <div className="form-group"><label>Company Name *</label><input type="text" placeholder="Your company name" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
          )}
          <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
