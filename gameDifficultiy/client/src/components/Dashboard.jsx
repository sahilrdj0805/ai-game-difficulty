import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { FaTrophy, FaGamepad, FaCoins, FaFire, FaSyncAlt } from 'react-icons/fa';
import { MdSpeed, MdTimer } from 'react-icons/md';
import { RiRobot2Fill } from 'react-icons/ri';
import { GiRun } from 'react-icons/gi';

const STAT_CARDS = (stats, localStats, formatTime) => [
  {
    Icon: FaTrophy,
    label: 'HIGH SCORE',
    value: (stats.highScore || 0).toLocaleString(),
    accent: '#ffd740',
    glow: 'rgba(255,215,64,0.2)',
    sub: 'Personal best',
  },
  {
    Icon: FaGamepad,
    label: 'GAMES PLAYED',
    value: (stats.totalGames || 0).toLocaleString(),
    accent: '#00fff7',
    glow: 'rgba(0,255,247,0.2)',
    sub: 'Total runs',
  },
  {
    Icon: FaCoins,
    label: 'TOTAL COINS',
    value: (stats.totalCoins || 0).toLocaleString(),
    accent: '#ff9800',
    glow: 'rgba(255,152,0,0.2)',
    sub: 'All time collected',
  },
  {
    Icon: GiRun,
    label: 'BEST DISTANCE',
    value: `${(stats.bestDistance || 0).toLocaleString()}m`,
    accent: '#00e676',
    glow: 'rgba(0,230,118,0.2)',
    sub: 'Furthest run',
  },
  {
    Icon: MdTimer,
    label: 'PLAY TIME',
    value: formatTime(stats.totalPlayTime || 0),
    accent: '#a259ff',
    glow: 'rgba(162,89,255,0.2)',
    sub: 'Total time played',
  },
  {
    Icon: FaFire,
    label: 'MAX COMBO',
    value: `${stats.maxCombo || localStats.maxCombo || 0}x`,
    accent: '#ff6b6b',
    glow: 'rgba(255,107,107,0.2)',
    sub: 'Best streak',
  },
];

export default function Dashboard() {
  const [userStats, setUserStats] = useState(null);
  const [localStats] = useState({
    totalGames:       Number(localStorage.getItem('totalGames'))    || 0,
    totalCoins:       Number(localStorage.getItem('totalCoins'))    || 0,
    bestDistance:     Number(localStorage.getItem('bestDistance'))  || 0,
    totalPlayTime:    Number(localStorage.getItem('totalPlayTime')) || 0,
    highScore:        Number(localStorage.getItem('highScore'))     || 0,
    maxCombo:         Number(localStorage.getItem('maxCombo'))      || 0,
    lastGameScore:    Number(localStorage.getItem('lastGameScore'))    || 0,
    lastGameDistance: Number(localStorage.getItem('lastGameDistance')) || 0,
    lastGameMistakes: Number(localStorage.getItem('lastGameMistakes')) ?? 0,
    lastGameCombo:    Number(localStorage.getItem('lastGameCombo'))    || 0,
  });
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { fetchUserData(); setTimeout(() => setVisible(true), 100); }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const user = authService.getCurrentUser();
      if (user) {
        const profile = await authService.getProfile();
        setUserStats(profile.user.gameStats);
      }
    } catch (_) {}
    setLoading(false);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const stats = userStats
    ? { ...localStats, ...userStats }
    : localStats;
  const avgScore      = stats.totalGames > 0 ? Math.round((stats.totalCoins || 0) / stats.totalGames) : 0;
  const avgSessionSec  = stats.totalGames > 0 ? Math.round((stats.totalPlayTime || 0) / stats.totalGames) : 0;
  const avgSessionFmt  = avgSessionSec >= 60 ? `${Math.floor(avgSessionSec/60)}m ${avgSessionSec%60}s` : avgSessionSec > 0 ? `${avgSessionSec}s` : '—';
  const avgDistPerGame = stats.totalGames > 0 ? Math.round((stats.bestDistance || 0) / stats.totalGames) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050510',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Ambient blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(162,89,255,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '45vw', height: '45vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,247,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />

      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: 1100, margin: '0 auto',
        padding: '40px 24px 80px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(162,89,255,0.08)', border: '1px solid rgba(162,89,255,0.2)', borderRadius: 100, padding: '6px 18px', marginBottom: 20 }}>
            <RiRobot2Fill size={12} color="#a259ff" />
            <span style={{ fontSize: 11, color: '#a259ff', letterSpacing: 3, fontWeight: 700 }}>PERFORMANCE ANALYTICS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,6vw,56px)', fontWeight: 900, margin: '0 0 8px', letterSpacing: -1, background: 'linear-gradient(135deg, #fff 0%, #a259ff 60%, #00fff7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            YOUR DASHBOARD
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', letterSpacing: 2 }}>AI-tracked stats from every run</p>
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <MdSpeed size={40} color="#a259ff" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16, letterSpacing: 2, fontSize: 13 }}>LOADING STATS...</p>
          </div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
              {STAT_CARDS(stats, localStats, formatTime).map((card, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: 'relative',
                    background: hovered === i ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${hovered === i ? card.accent + '44' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 20,
                    padding: '28px 28px 24px',
                    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: hovered === i ? 'translateY(-6px)' : 'translateY(0)',
                    boxShadow: hovered === i ? `0 20px 50px ${card.glow}` : '0 4px 20px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                  }}
                >
                  {/* top shimmer */}
                  <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`, opacity: hovered === i ? 1 : 0, transition: 'opacity 0.3s' }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ background: `${card.accent}15`, border: `1px solid ${card.accent}30`, borderRadius: 12, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <card.Icon size={20} color={card.accent} style={{ filter: `drop-shadow(0 0 8px ${card.accent})` }} />
                    </div>
                    <span style={{ fontSize: 9, color: card.accent, letterSpacing: 3, fontWeight: 700, opacity: 0.7 }}>{card.label}</span>
                  </div>

                  <div style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 900, color: '#fff', letterSpacing: -1, lineHeight: 1, marginBottom: 6, textShadow: `0 0 30px ${card.accent}55` }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>{card.sub}</div>

                  {/* bg orb */}
                  <div style={{ position: 'absolute', bottom: '-30%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: `radial-gradient(circle, ${card.accent}18, transparent 70%)`, pointerEvents: 'none', opacity: hovered === i ? 1 : 0.5, transition: 'opacity 0.3s' }} />
                </div>
              ))}
            </div>

            {/* ── Performance Summary ── */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '36px 40px', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <RiRobot2Fill size={16} color="#00fff7" style={{ filter: 'drop-shadow(0 0 6px #00fff7)' }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 3 }}>AI PERFORMANCE SUMMARY</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { label: 'AVG SCORE / GAME',  value: avgScore > 0 ? avgScore.toLocaleString() : '—',     accent: '#ffd740' },
                  { label: 'AVG SESSION TIME',   value: avgSessionFmt,                                        accent: '#ff9800' },
                  { label: 'AVG DIST / GAME',    value: avgDistPerGame > 0 ? `${avgDistPerGame}m` : '—',     accent: '#00fff7' },
                  { label: 'LAST SCORE',         value: (stats.lastGameScore || 0).toLocaleString(),          accent: '#a259ff' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '24px 20px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: item.accent, letterSpacing: -0.5, textShadow: `0 0 20px ${item.accent}66` }}>{item.value}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 3, marginTop: 6 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Last Game ── */}
            {(stats.lastGameScore > 0 || stats.lastGameDistance > 0) && (
              <div style={{ background: 'rgba(0,255,247,0.03)', border: '1px solid rgba(0,255,247,0.1)', borderRadius: 20, padding: '28px 32px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00fff7', boxShadow: '0 0 8px #00fff7', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: '#00fff7', letterSpacing: 3, fontWeight: 700 }}>LAST RUN</span>
                </div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Score',     value: (stats.lastGameScore    || 0).toLocaleString(),       accent: '#ffd740' },
                    { label: 'Distance',  value: `${(stats.lastGameDistance || 0).toLocaleString()}m`,  accent: '#00e676' },
                    { label: 'Max Combo', value: `${stats.lastGameCombo || 0}x`,                        accent: '#a259ff' },
                  ].map((item, i) => (
                    <div key={i} style={{ flex: 1, minWidth: 100 }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: item.accent }}>{item.value}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginTop: 4 }}>{item.label.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Refresh ── */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={fetchUserData}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 36px', fontSize: 13, fontWeight: 800, letterSpacing: 2, color: '#050510', background: 'linear-gradient(135deg, #00fff7, #a259ff)', border: 'none', borderRadius: 100, cursor: 'pointer', boxShadow: '0 0 30px rgba(0,255,247,0.25)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(0,255,247,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,247,0.25)'; }}
              >
                <FaSyncAlt size={13} /> REFRESH STATS
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
