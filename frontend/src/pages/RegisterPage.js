import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      setLoading(true);
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to CodeScope.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        <div className="auth-logo"><Cpu size={20} /></div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Get started with CodeScope AI</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrap">
              <User size={15} className="auth-input-icon" />
              <input type="text" name="name" className="auth-input" placeholder="John Doe" value={form.name} onChange={onChange} autoComplete="name" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <div className="auth-input-wrap">
              <Mail size={15} className="auth-input-icon" />
              <input type="email" name="email" className="auth-input" placeholder="you@example.com" value={form.email} onChange={onChange} autoComplete="email" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" />
              <input type={show ? 'text' : 'password'} name="password" className="auth-input" placeholder="Min. 6 characters" value={form.password} onChange={onChange} />
              <button type="button" className="auth-toggle" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" />
              <input type="password" name="confirm" className="auth-input" placeholder="Repeat password" value={form.confirm} onChange={onChange} />
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
