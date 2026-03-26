import React, { useState } from 'react';
import { authService } from '../services/authService';
import { RiRobot2Fill } from 'react-icons/ri';
import { FaBolt, FaEnvelope, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';

const inputStyle = (focused) => ({
  width: '100%',
  padding: '13px 16px 13px 42px',
  border: `1px solid ${focused ? 'rgba(162,89,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
  borderRadius: 12,
  background: focused ? 'rgba(162,89,255,0.04)' : 'rgba(255,255,255,0.03)',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.2s',
  boxShadow: focused ? '0 0 0 3px rgba(162,89,255,0.08)' : 'none',
});

export default function Register({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 1) { setError('Password is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await authService.register({ username: formData.username, email: formData.email, password: formData.password });
      onRegister(res.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'username',        type: 'text',     placeholder: 'Username',         Icon: FaUser,     min: 3, max: 20 },
    { name: 'email',           type: 'email',    placeholder: 'Email address',    Icon: FaEnvelope  },
    { name: 'password',        type: 'password', placeholder: 'Password',         Icon: FaLock      },
    { name: 'confirmPassword', type: 'password', placeholder: 'Confirm password', Icon: FaLock      },
  ];

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
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(162,89,255,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,247,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>
      {/* Scanlines */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 420,
        margin: '24px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '40px 36px',
        boxShadow: '0 0 0 1px rgba(162,89,255,0.04), 0 32px 80px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Top shimmer */}
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(162,89,255,0.6), transparent)' }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'rgba(162,89,255,0.08)', border: '1px solid rgba(162,89,255,0.15)', marginBottom: 20 }}>
            <FaBolt size={22} color="#a259ff" style={{ filter: 'drop-shadow(0 0 8px #a259ff)' }} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 6px', letterSpacing: -0.5, background: 'linear-gradient(135deg, #fff 0%, #a259ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            JOIN THE GAME
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, margin: 0 }}>Create your account and start running</p>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map(({ name, type, placeholder, Icon, min, max }) => (
            <div key={name} style={{ position: 'relative', marginBottom: 12 }}>
              <Icon size={13} color={focused === name ? '#a259ff' : 'rgba(255,255,255,0.25)'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.2s' }} />
              <input
                type={type} name={name} placeholder={placeholder}
                value={formData[name]} onChange={handleChange} required
                minLength={min} maxLength={max}
                onFocus={() => setFocused(name)} onBlur={() => setFocused('')}
                style={inputStyle(focused === name)}
              />
            </div>
          ))}

          {/* Password match indicator */}
          {formData.confirmPassword && (
            <div style={{ fontSize: 11, marginBottom: 12, marginTop: -4, paddingLeft: 4, color: formData.password === formData.confirmPassword ? '#00e676' : '#ff6b6b', letterSpacing: 0.5 }}>
              {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </div>
          )}

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
              background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #a259ff, #00fff7)',
              color: loading ? 'rgba(255,255,255,0.3)' : '#050510',
              border: loading ? '1px solid rgba(255,255,255,0.08)' : 'none',
              borderRadius: 12, fontSize: 13, fontWeight: 800,
              letterSpacing: 2, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', marginBottom: 24, marginTop: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 0 30px rgba(162,89,255,0.25)',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 0 50px rgba(162,89,255,0.45)'; e.currentTarget.style.transform = 'scale(1.02)'; }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(162,89,255,0.25)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {loading ? <><MdSpeed size={14} style={{ animation: 'spin 1s linear infinite' }} /> CREATING...</> : <><FaArrowRight size={13} /> CREATE ACCOUNT</>}
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
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Already have an account? </span>
          <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: '#00fff7', cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: 0.5, padding: 0 }}>
            Sign in <RiRobot2Fill size={11} style={{ verticalAlign: 'middle' }} />
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
