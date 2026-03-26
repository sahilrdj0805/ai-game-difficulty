import React, { useCallback, useEffect, useState } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { RiRobot2Fill, RiBrainFill } from 'react-icons/ri';
import { FaBolt, FaChartBar, FaTrophy, FaArrowRight, FaCrosshairs, FaBed } from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';

const STATS = [
  { label: 'AI ENGINE', value: 'LIVE', accent: '#00fff7' },
  { label: 'DIFFICULTY', value: 'ADAPTIVE', accent: '#a259ff' },
  { label: 'MODE', value: 'ENDLESS', accent: '#ff6b6b' },
];

const CARDS = [
  {
    id: 'game',
    Icon: FaBolt,
    title: 'PLAY NOW',
    desc: 'Drop into the AI-powered endless runner. The harder you go, the smarter it gets.',
    accent: '#00fff7',
    glow: 'rgba(0,255,247,0.25)',
    tag: 'LIVE',
  },
  {
    id: 'dashboard',
    Icon: FaChartBar,
    title: 'DASHBOARD',
    desc: 'Real-time stats, heatmaps, and AI performance breakdowns of your runs.',
    accent: '#a259ff',
    glow: 'rgba(162,89,255,0.25)',
    tag: 'STATS',
  },
  {
    id: 'leaderboard',
    Icon: FaTrophy,
    title: 'LEADERBOARD',
    desc: 'Global rankings. See where you stand against the best runners worldwide.',
    accent: '#ff6b6b',
    glow: 'rgba(255,107,107,0.25)',
    tag: 'GLOBAL',
  },
];

export default function Home({ user, onNavigate }) {
  const [init, setInit] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
    setInit(true);
  }, []);

  const particleOptions = {
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    particles: {
      number: { value: 80, density: { enable: true, area: 900 } },
      color: { value: ['#00fff7', '#a259ff', '#ff6b6b', '#ffffff'] },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.05, max: 0.4 },
        animation: { enable: true, speed: 0.8, minimumValue: 0.05, sync: false },
      },
      size: {
        value: { min: 1, max: 3 },
        animation: { enable: true, speed: 1.5, minimumValue: 0.5, sync: false },
      },
      links: {
        enable: true,
        distance: 130,
        color: '#a259ff',
        opacity: 0.12,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.6,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'out' },
      },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'grab' },
        onClick: { enable: true, mode: 'push' },
      },
      modes: {
        grab: { distance: 160, links: { opacity: 0.35 } },
        push: { quantity: 3 },
      },
    },
    detectRetina: true,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050510',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* Ambient blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(162,89,255,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '55vw', height: '55vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,247,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '40%',
          width: '30vw', height: '30vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,107,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Particles */}
      {init && (
        <Particles
          id="tsparticles"
          options={particleOptions}
          style={{ position: 'fixed', inset: 0, zIndex: 1 }}
        />
      )}
      {!init && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particleOptions}
          style={{ position: 'fixed', inset: 0, zIndex: 1 }}
        />
      )}

      {/* Scanline overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 24px 80px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}>

        {/* ── HERO ── */}
        <div style={{ textAlign: 'center', paddingTop: '100px', marginBottom: '64px' }}>

          {/* AI badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,255,247,0.06)',
            border: '1px solid rgba(0,255,247,0.2)',
            borderRadius: 100, padding: '6px 18px',
            marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00fff7', boxShadow: '0 0 8px #00fff7', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <RiRobot2Fill size={12} color="#00fff7" />
            <span style={{ fontSize: 11, color: '#00fff7', letterSpacing: 3, fontWeight: 700 }}>AI ENGINE ACTIVE</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(42px, 8vw, 88px)',
            fontWeight: 900,
            margin: '0 0 8px',
            lineHeight: 1.05,
            letterSpacing: -2,
            background: 'linear-gradient(135deg, #ffffff 0%, #a259ff 50%, #00fff7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            AI RUNNER
          </h1>

          <div style={{
            fontSize: 'clamp(13px, 2vw, 16px)',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: 6,
            fontWeight: 600,
            marginBottom: 28,
            textTransform: 'uppercase',
          }}>
            Difficulty Adjustment Engine
          </div>

          <p style={{
            fontSize: 'clamp(14px, 1.8vw, 18px)',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 520,
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            Welcome back, <span style={{ color: '#a259ff', fontWeight: 700 }}>{user?.username}</span>. The AI has been waiting — it learns your moves and adapts in real-time.
          </p>

          {/* CTA */}
          <button
            onClick={() => onNavigate('game')}
            style={{
              position: 'relative',
              padding: '16px 52px',
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 3,
              color: '#050510',
              background: 'linear-gradient(135deg, #00fff7, #a259ff)',
              border: 'none',
              borderRadius: 100,
              cursor: 'pointer',
              boxShadow: '0 0 40px rgba(0,255,247,0.3), 0 0 80px rgba(162,89,255,0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(0,255,247,0.5), 0 0 100px rgba(162,89,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,247,0.3), 0 0 80px rgba(162,89,255,0.2)'; }}
          >
            <FaBolt style={{ marginRight: 8 }} /> ENTER THE GAME
          </button>
        </div>

        {/* ── LIVE STATS BAR ── */}
        <div style={{
          display: 'flex', gap: 1,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 64,
          width: '100%', maxWidth: 640,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '18px 24px', textAlign: 'center',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.accent, letterSpacing: 1, textShadow: `0 0 20px ${s.accent}` }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 3, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── CARDS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          width: '100%', maxWidth: 1000,
          marginBottom: 80,
        }}>
          {CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              onMouseEnter={() => setHovered(card.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'relative',
                background: hovered === card.id
                  ? `linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`
                  : 'rgba(255,255,255,0.02)',
                border: `1px solid ${hovered === card.id ? card.accent + '55' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 24,
                padding: '36px 32px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                transform: hovered === card.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                boxShadow: hovered === card.id ? `0 24px 60px ${card.glow}, 0 0 0 1px ${card.accent}22` : '0 4px 24px rgba(0,0,0,0.3)',
                overflow: 'hidden',
              }}
            >
              {/* Top glow line */}
              <div style={{
                position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
                background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`,
                opacity: hovered === card.id ? 1 : 0,
                transition: 'opacity 0.3s',
              }} />

              {/* Tag */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: `${card.accent}15`,
                border: `1px solid ${card.accent}30`,
                borderRadius: 100, padding: '3px 12px',
                marginBottom: 20,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: card.accent, display: 'inline-block' }} />
                <span style={{ fontSize: 9, color: card.accent, letterSpacing: 3, fontWeight: 700 }}>{card.tag}</span>
              </div>

              {/* Icon */}
              <div style={{
                marginBottom: 16,
                filter: `drop-shadow(0 0 16px ${card.accent})`,
                transition: 'transform 0.3s',
                transform: hovered === card.id ? 'scale(1.15)' : 'scale(1)',
                display: 'inline-block',
                color: card.accent,
              }}>
                <card.Icon size={38} />
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: 22, fontWeight: 900, letterSpacing: 2,
                margin: '0 0 10px',
                color: hovered === card.id ? card.accent : '#fff',
                transition: 'color 0.3s',
              }}>
                {card.title}
              </h3>

              {/* Desc */}
              <p style={{
                fontSize: 14, color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.6, margin: '0 0 28px',
              }}>
                {card.desc}
              </p>

              {/* Arrow CTA */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, fontWeight: 700, color: card.accent,
                letterSpacing: 2,
                transform: hovered === card.id ? 'translateX(6px)' : 'translateX(0)',
                transition: 'transform 0.3s',
              }}>
                OPEN {card.title} <FaArrowRight size={12} />
              </div>

              {/* BG orb */}
              <div style={{
                position: 'absolute', bottom: '-40%', right: '-20%',
                width: '60%', height: '60%', borderRadius: '50%',
                background: `radial-gradient(circle, ${card.accent}18, transparent 70%)`,
                pointerEvents: 'none',
                transition: 'opacity 0.3s',
                opacity: hovered === card.id ? 1 : 0.4,
              }} />
            </div>
          ))}
        </div>

        {/* ── FEATURE STRIP ── */}
        <div style={{
          width: '100%', maxWidth: 1000,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          padding: '32px 40px',
          display: 'flex', flexWrap: 'wrap', gap: 32,
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
          {[
            { Icon: RiBrainFill,    color: '#a259ff', label: 'Adaptive AI',       sub: 'Learns your playstyle' },
            { Icon: MdSpeed,        color: '#00fff7', label: 'Real-time',          sub: 'Updates every 2 seconds' },
            { Icon: FaCrosshairs,   color: '#ff6b6b', label: 'Pattern Detection',  sub: 'Lane & jump analysis' },
            { Icon: FaBed,          color: '#ffd740', label: 'Fatigue Sensing',    sub: 'Eases when you struggle' },
          ].map((f, i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 120 }}>
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center', filter: `drop-shadow(0 0 10px ${f.color})` }}>
                <f.Icon size={28} color={f.color} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{f.sub}</div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
