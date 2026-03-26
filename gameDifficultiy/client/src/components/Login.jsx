import React, { useState } from 'react';
import { authService } from '../services/authService';
import { RiRobot2Fill } from 'react-icons/ri';
import { FaBolt, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';

const inputStyle = (focused) => ({
  width: '100%',
  padding: '13px 16px 13px 42px',
  border: `1px solid ${focused ? 'rgba(0,255,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: 12,
  background: focused ? 'rgba(0,255,247,0.04)' : 'rgba(255,255,255,0.03)',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.2s',
  boxShadow: focused ? '0 0 0 3px rgba(0,255,247,0.08)' : 'none',
});

export default function Login({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData]   = useState({ email: '', password: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [focused, setFocused]     = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.login(formData);
      onLogin(res.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      background: '#050510',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(162,89,255,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,247,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>
      {/* Scanlines */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 420,
        margin: '0 24px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '40px 36px',
        boxShadow: '0 0 0 1px rgba(0,255,247,0.04), 0 32px 80px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Top shimmer */}
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,255,247,0.5), transparent)' }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'rgba(0,255,247,0.08)', border: '1px solid rgba(0,255,247,0.15)', marginBottom: 20 }}>
            <RiRobot2Fill size={26} color="#00fff7" style={{ filter: 'drop-shadow(0 0 8px #00fff7)' }} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 6px', letterSpacing: -0.5, background: 'linear-gradient(135deg, #fff 0%, #00fff7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            WELCOME BACK
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, margin: 0 }}>Sign in to continue your run</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <FaEnvelope size={13} color={focused === 'email' ? '#00fff7' : 'rgba(255,255,255,0.25)'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s' }} />
            <input
              type="email" name="email" placeholder="Email address"
              value={formData.email} onChange={handleChange} required
              onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
              style={inputStyle(focused === 'email')}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <FaLock size={13} color={focused === 'password' ? '#00fff7' : 'rgba(255,255,255,0.25)'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s' }} />
            <input
              type="password" name="password" placeholder="Password"
              value={formData.password} onChange={handleChange} required
              onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
              style={inputStyle(focused === 'password')}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff6b6b', fontSize: 12, marginBottom: 16, padding: '10px 14px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff6b6b', flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00fff7, #a259ff)',
              color: loading ? 'rgba(255,255,255,0.3)' : '#050510',
              border: loading ? '1px solid rgba(255,255,255,0.08)' : 'none',
              borderRadius: 12, fontSize: 13, fontWeight: 800,
              letterSpacing: 2, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 0 30px rgba(0,255,247,0.2)',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 0 50px rgba(0,255,247,0.4)'; e.currentTarget.style.transform = 'scale(1.02)'; }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,247,0.2)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {loading ? <><MdSpeed size={14} style={{ animation: 'spin 1s linear infinite' }} /> SIGNING IN...</> : <><FaSignInAlt size={13} /> SIGN IN</>}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Switch */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No account? </span>
          <button onClick={onSwitchToRegister} style={{ background: 'none', border: 'none', color: '#a259ff', cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: 0.5, padding: 0 }}>
            Create one <FaBolt size={10} style={{ verticalAlign: 'middle' }} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
