import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { FaTrophy, FaMedal, FaGamepad, FaCoins, FaSyncAlt } from 'react-icons/fa';
import { GiRun } from 'react-icons/gi';
import { RiRobot2Fill } from 'react-icons/ri';
import { MdSpeed } from 'react-icons/md';

const RANK_CONFIG = {
  1: { color: '#ffd740', glow: 'rgba(255,215,64,0.3)',  bg: 'rgba(255,215,64,0.06)',  border: 'rgba(255,215,64,0.2)'  },
  2: { color: '#e0e0e0', glow: 'rgba(224,224,224,0.2)', bg: 'rgba(224,224,224,0.04)', border: 'rgba(224,224,224,0.15)' },
  3: { color: '#ff9800', glow: 'rgba(255,152,0,0.25)',  bg: 'rgba(255,152,0,0.05)',   border: 'rgba(255,152,0,0.2)'   },
};

const RankBadge = ({ rank }) => {
  const cfg = RANK_CONFIG[rank];
  if (rank === 1) return <FaTrophy size={18} color={cfg.color} style={{ filter: `drop-shadow(0 0 8px ${cfg.color})` }} />;
  if (rank === 2 || rank === 3) return <FaMedal size={18} color={cfg.color} style={{ filter: `drop-shadow(0 0 6px ${cfg.color})` }} />;
  return <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>#{rank}</span>;
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hovered, setHovered]         = useState(null);
  const [visible, setVisible]         = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
    setTimeout(() => setVisible(true), 100);
    intervalRef.current = setInterval(() => fetchLeaderboard(true), 30000);
    const onVisible = () => { if (!document.hidden) fetchLeaderboard(true); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(intervalRef.current); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  const fetchLeaderboard = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await authService.getLeaderboard('highScore', 10);
      setLeaderboard(res.leaderboard);
      setLastUpdated(new Date());
    } catch (_) { setError('Failed to load leaderboard'); }
    finally { if (!silent) setLoading(false); }
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const s = Math.floor((new Date() - date) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
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
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,64,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '45vw', height: '45vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(162,89,255,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />

      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: 900, margin: '0 auto',
        padding: '24px 24px 40px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,215,64,0.06)', border: '1px solid rgba(255,215,64,0.2)', borderRadius: 100, padding: '6px 18px', marginBottom: 20 }}>
            <FaTrophy size={11} color="#ffd740" style={{ filter: 'drop-shadow(0 0 6px #ffd740)' }} />
            <span style={{ fontSize: 11, color: '#ffd740', letterSpacing: 3, fontWeight: 700 }}>GLOBAL RANKINGS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,6vw,56px)', fontWeight: 900, margin: '0 0 8px', letterSpacing: -1, background: 'linear-gradient(135deg, #fff 0%, #ffd740 60%, #ff9800 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LEADERBOARD
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>
            Top 10 runners worldwide
            {lastUpdated && <span style={{ marginLeft: 12, color: 'rgba(255,255,255,0.2)' }}>· updated {timeAgo(lastUpdated)}</span>}
          </p>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <MdSpeed size={40} color="#ffd740" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16, letterSpacing: 2, fontSize: 13 }}>LOADING RANKINGS...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <RiRobot2Fill size={40} color="#ff6b6b" />
            <p style={{ color: '#ff6b6b', marginTop: 16, letterSpacing: 2, fontSize: 13 }}>{error.toUpperCase()}</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <FaTrophy size={40} color="rgba(255,255,255,0.1)" />
            <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: 16, letterSpacing: 2, fontSize: 13 }}>NO DATA YET — BE THE FIRST</p>
          </div>
        ) : (
          <>
            {/* ── Top 3 Podium ── */}
            {leaderboard.length >= 3 && (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'flex-end', marginBottom: 20 }}>
                {[leaderboard[1], leaderboard[0], leaderboard[2]].map((player, i) => {
                  const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
                  const cfg  = RANK_CONFIG[rank];
                  const heights = [130, 160, 130];
                  return (
                    <div key={rank} style={{
                      flex: 1, maxWidth: 220,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      borderRadius: 16,
                      padding: '16px 12px 14px',
                      textAlign: 'center',
                      minHeight: heights[i],
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                      boxShadow: `0 0 30px ${cfg.glow}`,
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />
                      <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}>
                        <RankBadge rank={rank} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 0.5, marginBottom: 4, wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.3 }}>{player?.username}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: cfg.color, textShadow: `0 0 16px ${cfg.color}` }}>{(player?.gameStats?.highScore || 0).toLocaleString()}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginTop: 2 }}>HIGH SCORE</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Table header ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 110px 70px 100px 90px', gap: 0, padding: '8px 16px', marginBottom: 4 }}>
              {['#', 'PLAYER', 'SCORE', 'GAMES', 'DISTANCE', 'COINS'].map((h, i) => (
                <div key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, fontWeight: 700, textAlign: i > 1 ? 'center' : i === 1 ? 'left' : 'center' }}>{h}</div>
              ))}
            </div>

            {/* ── Rows ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {leaderboard.map((player, index) => {
                const rank = player.rank;
                const cfg  = RANK_CONFIG[rank] || {};
                const isTop = rank <= 3;
                const isHov = hovered === index;
                return (
                  <div
                    key={index}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '44px 1fr 110px 70px 100px 90px',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: isHov
                        ? (isTop ? `${cfg.bg}` : 'rgba(255,255,255,0.05)')
                        : (isTop ? cfg.bg : 'rgba(255,255,255,0.02)'),
                      border: `1px solid ${isHov ? (isTop ? cfg.border : 'rgba(255,255,255,0.12)') : (isTop ? cfg.border : 'rgba(255,255,255,0.05)')}`,
                      borderRadius: 14,
                      transition: 'all 0.2s ease',
                      transform: isHov ? 'translateX(4px)' : 'translateX(0)',
                      boxShadow: isHov && isTop ? `0 0 30px ${cfg.glow}` : 'none',
                      cursor: 'default',
                    }}
                  >
                    {/* Rank */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <RankBadge rank={rank} />
                    </div>

                    {/* Player */}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: isTop ? cfg.color : '#fff', letterSpacing: 0.5 }}>{player.username}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                        Joined {new Date(player.joinedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 900, color: isTop ? cfg.color : '#fff', textShadow: isTop ? `0 0 16px ${cfg.color}66` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <FaTrophy size={11} color={isTop ? cfg.color : 'rgba(255,255,255,0.2)'} />
                      {(player.gameStats.highScore || 0).toLocaleString()}
                    </div>

                    {/* Games */}
                    <div style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <FaGamepad size={11} color="rgba(255,255,255,0.25)" />
                      {player.gameStats.totalGames || 0}
                    </div>

                    {/* Distance */}
                    <div style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <GiRun size={13} color="rgba(255,255,255,0.25)" />
                      {(player.gameStats.bestDistance || 0).toLocaleString()}m
                    </div>

                    {/* Coins */}
                    <div style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <FaCoins size={11} color="rgba(255,152,0,0.5)" />
                      {(player.gameStats.totalCoins || 0).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Refresh ── */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button
                onClick={() => fetchLeaderboard()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 36px', fontSize: 13, fontWeight: 800, letterSpacing: 2, color: '#050510', background: 'linear-gradient(135deg, #ffd740, #ff9800)', border: 'none', borderRadius: 100, cursor: 'pointer', boxShadow: '0 0 30px rgba(255,215,64,0.25)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(255,215,64,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(255,215,64,0.25)'; }}
              >
                <FaSyncAlt size={13} /> REFRESH
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
