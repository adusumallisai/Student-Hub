import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="muted">Join Student Hub to plan, share, and collaborate.</p>
        {error && <div className="alert-error">{error}</div>}
        <label>Full name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} minLength={8} required />
        <button className="btn-primary" disabled={busy}>{busy ? 'Creating account...' : 'Sign Up'}</button>
        <p className="muted">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
