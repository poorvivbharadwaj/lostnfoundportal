import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminLogin } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Both username and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(form);
      if (res.data.success) {
        login(res.data.token, res.data.admin);
        toast.success('Welcome back, Admin!');
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 200);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Check credentials.';
      console.error('Admin login error:', err.response || err.message || err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: '#070711'
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, margin: '0 auto 14px',
            boxShadow: '0 0 30px rgba(99,102,241,0.4)'
          }}>
            🔐
          </div>
          <h1 style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: 24, color: '#eef0ff', marginBottom: 6
          }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: 13, color: '#7b7fa0' }}>
            Lost & Found Campus Portal
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(14,14,28,0.75)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 20, padding: 32
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex', flexDirection: 'column', gap: 18
          }}>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, fontSize: 13, color: '#f87171',
                display: 'flex', gap: 8
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 600,
                color: '#7b7fa0', marginBottom: 6,
                fontFamily: "'Syne',sans-serif"
              }}>
                Username
              </label>
              <input
                type="text"
                placeholder="admin"
                value={form.username}
                onChange={e => {
                  setForm(p => ({ ...p, username: e.target.value }));
                  setError('');
                }}
                autoFocus
                style={{
                  width: '100%',
                  background: 'rgba(14,14,28,0.8)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 10, padding: '11px 14px',
                  color: '#eef0ff', fontSize: 14, outline: 'none',
                  fontFamily: "'Outfit',sans-serif"
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 600,
                color: '#7b7fa0', marginBottom: 6,
                fontFamily: "'Syne',sans-serif"
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => {
                    setForm(p => ({ ...p, password: e.target.value }));
                    setError('');
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(14,14,28,0.8)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 10, padding: '11px 44px 11px 14px',
                    color: '#eef0ff', fontSize: 14, outline: 'none',
                    fontFamily: "'Outfit',sans-serif"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12,
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: '#4a4d6a', cursor: 'pointer', padding: 4,
                    fontSize: 16
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? '#4a4d6a' : '#6366f1',
                color: '#fff', border: 'none', borderRadius: 10,
                fontFamily: "'Syne',sans-serif", fontWeight: 600,
                fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4, transition: 'all 0.2s',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8
              }}
            >
              {loading ? 'Logging in…' : '🔐 Login to Admin Panel'}
            </button>

            <p style={{
              fontSize: 12, color: '#4a4d6a',
              textAlign: 'center', fontFamily: "'JetBrains Mono'"
            }}>
              Default: admin / admin123
            </p>

          </form>
        </div>

        {/* Back link */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <a href="/" style={{ color: '#7b7fa0', textDecoration: 'none' }}>
            ← Back to Portal
          </a>
        </p>

      </div>
    </div>
  );
}