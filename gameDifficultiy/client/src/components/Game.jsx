import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { updatePlayerStats } from '../services/api';
import { authService } from '../services/authService';
import Track from './game3d/Track';
import Player from './game3d/Player';
import Obstacles from './game3d/Obstacles';
import Coins from './game3d/Coins';
import PowerUps from './game3d/PowerUps';
import Environment from './game3d/Environment';
import { MdShield, MdFavorite, MdFavoriteBorder, MdAutoAwesome } from 'react-icons/md';
import { GiRun } from 'react-icons/gi';
import { FaTrophy, FaSkull, FaFire, FaPause, FaPlay, FaHome, FaRedo } from 'react-icons/fa';
import { RiRobot2Fill } from 'react-icons/ri';

const INITIAL_STATE = {
  isPlaying: false,
  isPaused: false,
  score: 0,
  speed: 1,
  speedPenalty: 0,       // active speed reduction after a hit, recovers over time
  playerPosition: 1,
  obstacles: [],
  coins: [],
  powerUps: [],
  distance: 0,
  reactionTime: 0,
  mistakes: 0,
  lastMoveTime: Date.now(),
  combo: 0,
  isInvulnerable: false,
  shieldActive: false,
  jumpHeight: 0,
  jumpVelocity: 0,
  isJumping: false,
  gravity: 0.62,
  jumpPower: 12,
};

export default function Game({ onNavigate }) {
  const [gs, setGs] = useState({
    ...INITIAL_STATE,
    maxCombo: Number(localStorage.getItem('maxCombo')) || 0,
    highScore: Number(localStorage.getItem('highScore')) || 0,
  });
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [message, setMessage] = useState('');
  const [hitFlash, setHitFlash] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [invincibleTimer, setInvincibleTimer] = useState(0);
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState([]);
  const [ghostLane, setGhostLane] = useState(null);
  const [brokenHeart, setBrokenHeart] = useState(false);
  const prevLaneRef = useRef(gs.playerPosition);
  const gameStartTime = useRef(null);
  const audioCtx = useRef(null);
  const bgMusicRef = useRef(null);
  const gsRef = useRef(gs);
  useEffect(() => { gsRef.current = gs; }, [gs]);
  // AI engine spawn settings — updated every 5s from server
  const aiSettings = useRef({ obstacleChance: 0.03, coinChance: 0.015, doubleLane: false, performanceScore: 0, tier: 'BEGINNER', reactionAdjustment: 0, targetLane: null, fatigueEase: 0, lastInsight: null, wasFatigued: false, lastReactionTrend: 'STABLE', lastDominantLane: null });
  // Reaction time history — last 10 moves for trend detection
  const reactionHistory = useRef([]);
  // Behavior tracking for pattern + fatigue detection
  const behaviorLog = useRef({ lanes: [], jumps: 0, mistakeTimes: [], moveCount: 0, lastLane: 1, laneEnteredAt: Date.now() });
  const [aiInsight, setAiInsight] = useState(null);
  const [sessionComparison, setSessionComparison] = useState(null);

  // ── Audio ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    try { audioCtx.current = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (_) {}
  }, []);

  const playSound = (freq, dur, type = 'sine') => {
    if (!audioCtx.current) return;
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.connect(gain); gain.connect(audioCtx.current.destination);
    osc.frequency.value = freq; osc.type = type;
    gain.gain.setValueAtTime(0.1, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + dur);
    osc.start(audioCtx.current.currentTime);
    osc.stop(audioCtx.current.currentTime + dur);
  };

  const playBgMusic = () => {
    if (bgMusicRef.current) return;
    const audio = new Audio('/bg-music.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(() => {});
    bgMusicRef.current = audio;
  };

  const stopBgMusic = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current = null;
    }
  };

  const pauseBgMusic = () => { if (bgMusicRef.current) bgMusicRef.current.pause(); };
  const resumeBgMusic = () => { if (bgMusicRef.current) bgMusicRef.current.play().catch(() => {}); };

  useEffect(() => {
    if (gs.isPlaying && !gs.isPaused) playBgMusic();
    else if (gs.isPlaying && gs.isPaused) pauseBgMusic();
    else stopBgMusic();
    return stopBgMusic;
  }, [gs.isPlaying, gs.isPaused]);

  // ── Floating text ──────────────────────────────────────────────────────────
  const addFloat = (text, color = '#00ff00') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(p => [...p, { id, text, color }]);
    setTimeout(() => setFloatingTexts(p => p.filter(x => x.id !== id)), 2000);
  };

  // ── Coin particles ─────────────────────────────────────────────────────────
  const spawnParticles = (color = '#ffd700') => {
    const id = Date.now() + Math.random();
    const pts = Array.from({ length: 8 }, (_, i) => ({
      id: id + i,
      angle: (i / 8) * 360,
      color,
    }));
    setParticles(p => [...p, ...pts]);
    setTimeout(() => setParticles(p => p.filter(x => !pts.some(pt => pt.id === x.id))), 600);
  };

  // ── Lane ghost trail ───────────────────────────────────────────────────────
  useEffect(() => {
    if (prevLaneRef.current !== gs.playerPosition) {
      setGhostLane(prevLaneRef.current);
      setTimeout(() => setGhostLane(null), 180);
      prevLaneRef.current = gs.playerPosition;
    }
  }, [gs.playerPosition]);

  // ── Keyboard controls ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const cur = gsRef.current;
      if (!cur.isPlaying || cur.isPaused) return;
      const now = Date.now();

      switch (e.key.toLowerCase()) {
        case 'arrowleft': case 'a':
          if (cur.playerPosition > 0) {
            const rt1 = now - cur.lastMoveTime;
            reactionHistory.current = [...reactionHistory.current.slice(-9), rt1];
            behaviorLog.current.lanes.push(cur.playerPosition - 1);
            behaviorLog.current.moveCount++;
            setGs(p => ({ ...p, playerPosition: p.playerPosition - 1, reactionTime: rt1, lastMoveTime: now }));
            playSound(200, 0.1);
          }
          break;
        case 'arrowright': case 'd':
          if (cur.playerPosition < 2) {
            const rt2 = now - cur.lastMoveTime;
            reactionHistory.current = [...reactionHistory.current.slice(-9), rt2];
            behaviorLog.current.lanes.push(cur.playerPosition + 1);
            behaviorLog.current.moveCount++;
            setGs(p => ({ ...p, playerPosition: p.playerPosition + 1, reactionTime: rt2, lastMoveTime: now }));
            playSound(200, 0.1);
          }
          break;
        case ' ': case 'arrowup': case 'w':
          e.preventDefault();
          if (!cur.isJumping && cur.jumpHeight <= 0) {
            behaviorLog.current.jumps++;
            setGs(p => ({ ...p, isJumping: true, jumpVelocity: p.jumpPower, jumpHeight: 1 }));
            playSound(350, 0.15, 'square');
          }
          break;
        case 'p': case 'escape':
          setGs(p => ({ ...p, isPaused: !p.isPaused }));
          break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Game loop ──────────────────────────────────────────────────────────────
  const lastTickRef = useRef(0);
  useEffect(() => {
    if (!gs.isPlaying || gs.isPaused) return;
    let rafId;
    const loop = (now) => {
      if (now - lastTickRef.current >= 16) {
        lastTickRef.current = now;
        tick();
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [gs.isPlaying, gs.isPaused]);

  const tick = () => {
    setGs(prev => {
      const s = { ...prev };

      // Subway Surfers jump physics:
      // Fast launch, floaty arc at top, snappy landing
      if (s.isJumping || s.jumpHeight > 0) {
        // Apply stronger gravity when falling (snappier landing like SS)
        const grav = s.jumpVelocity < 0 ? s.gravity * 1.6 : s.gravity;
        s.jumpHeight += s.jumpVelocity;
        s.jumpVelocity -= grav;
        if (s.jumpHeight <= 0) {
          s.jumpHeight = 0; s.jumpVelocity = 0; s.isJumping = false;
        }
      }

      // Move objects
      s.obstacles = prev.obstacles.map(o => ({ ...o, y: o.y + prev.speed * 4 })).filter(o => o.y < 700);
      s.coins = prev.coins.map(c => ({ ...c, y: c.y + prev.speed * 2.5 })).filter(c => c.y < 700);
      s.powerUps = prev.powerUps.map(p => ({ ...p, y: p.y + prev.speed * 4 })).filter(p => p.y < 700);

      const { coinChance = 0.015, doubleLane, reactionAdjustment = 0, targetLane = null, fatigueEase = 0 } = aiSettings.current;
      const distanceChance = 0.025 + Math.sqrt(s.distance * 0.0000008);
      const reactionBoost = reactionAdjustment > 0 ? reactionAdjustment * 3 : reactionAdjustment * 2;
      const fatigueBoost = fatigueEase !== 0 ? fatigueEase * 3 : 0;
      const obstacleChance = aiSettings.current.obstacleChance > 0
        ? Math.max(0.01, aiSettings.current.obstacleChance + reactionBoost + fatigueBoost)
        : distanceChance;
      if (Math.random() < obstacleChance) {
        const free = [0,1,2].filter(l => !prev.obstacles.some(o => o.x === l && o.y > -300 && o.y < 150));
        if (free.length) {
          const types = [
            { type:'train' },
            { type:'barrier' },
            { type:'truck' },
            { type:'cone' },
          ];
          const t = types[Math.floor(Math.random() * types.length)];
          const blockTwo = doubleLane && Math.random() < 0.25 && free.length >= 2;
          if (blockTwo) {
            const pick = free.sort(() => Math.random() - 0.5).slice(0, 2);
            pick.forEach(lane => s.obstacles.push({ id: Date.now() + Math.random(), x: lane, y: -300, ...t }));
          } else {
            // Option 3: Pattern AI — bias obstacle toward player's preferred lane
            const biasedLane = targetLane !== null && free.includes(targetLane) && Math.random() < 0.200
              ? targetLane
              : free[Math.floor(Math.random() * free.length)];
            s.obstacles.push({ id: Date.now() + Math.random(), x: biasedLane, y: -300, ...t });
          }
        }
      }

      if (Math.random() < coinChance) {
        const patterns = [
          [[1,0],[1,1],[1,2]],           // straight line center
          [[0,0],[1,1],[2,2]],           // diagonal
          [[0,2],[1,1],[2,0]],           // reverse diagonal
          [[0,0],[0,1],[0,2]],           // left lane line
          [[2,0],[2,1],[2,2]],           // right lane line
          [[1,0],[0,1],[1,2],[2,1]],     // zigzag
          [[0,0],[1,0],[2,0]],           // all lanes same row
          [[1,0],[1,1],[1,2],[1,3]],     // long center line
        ];
        const pat = patterns[Math.floor(Math.random() * patterns.length)];
        pat.forEach(([lane, offset]) => {
          s.coins.push({
            id: Date.now() + Math.random(), x: lane, y: -280 - offset * 60,
            value: prev.combo > 10 ? 25 : prev.combo > 5 ? 15 : 10,
            type: prev.combo > 15 ? 'diamond' : prev.combo > 10 ? 'golden' : 'normal',
          });
        });
      }

      // Spawn power-ups
      if (Math.random() < 0.004 && prev.score > 20) {
        const types = ['shield','multiplier','invincible'];
        s.powerUps.push({ id: Date.now() + Math.random(), x: Math.floor(Math.random() * 3), y: -300, type: types[Math.floor(Math.random() * types.length)] });
      }

      // Collision — obstacle
      const hit = s.obstacles.find(o => o.x === prev.playerPosition && o.y > 560 && o.y < 650 && prev.jumpHeight < 45);
      if (hit && prev.shieldActive) {
        s.obstacles = s.obstacles.filter(o => o.id !== hit.id);
        s.shieldActive = false;
        setTimeout(() => { playSound(400, 0.2); addFloat('SHIELD ABSORBED!', '#00ffff'); }, 0);
      } else if (hit && !prev.isInvulnerable) {
        s.obstacles = s.obstacles.filter(o => o.id !== hit.id);
        s.mistakes += 1; s.combo = 0; s.isInvulnerable = true;
        behaviorLog.current.mistakeTimes.push(Date.now());
        setTimeout(() => { playSound(100, 0.5, 'sawtooth'); addFloat(`MISTAKE ${s.mistakes}/5`, '#ff0000'); }, 0);
        if (s.mistakes >= 5) {
          s.isPlaying = false;
          s.speed = 0;
          setTimeout(() => {
            updateHighScore(s.score);
            addFloat('GAME OVER!', '#ff0000');
            setMessage('💀 Game Over! Press Start to play again');
            setLastRun({ score: s.score, distance: Math.floor(s.distance), combo: s.maxCombo });
            const prevBest = Number(localStorage.getItem('highScore')) || 0;
            const prevDist = Number(localStorage.getItem('bestDistance')) || 0;
            if (prevBest > 0) {
              setSessionComparison({
                scoreDiff: s.score - prevBest,
                distDiff: Math.floor(s.distance) - prevDist,
              });
            }
            setHitFlash(true); setShake(true);
            setTimeout(() => { setHitFlash(false); setShake(false); }, 500);
          }, 0);
        } else {
          const gained = prev.speed - 1;
          const penalty = gained * 0.6;
          s.speedPenalty = penalty;
          s.speed = Math.max(1, prev.speed - penalty);
          setHitFlash(true); setShake(true); setBrokenHeart(true);
          setTimeout(() => { setHitFlash(false); setShake(false); }, 400);
          setTimeout(() => setBrokenHeart(false), 600);
          setTimeout(() => setGs(p => ({ ...p, isInvulnerable: false })), 2000);
          setTimeout(() => setMessage(`💥 Mistake ${s.mistakes}! ${5 - s.mistakes} chance(s) left`), 0);
        }
      }

      // Collision — coin
      const coin = s.coins.find(c => c.x === prev.playerPosition && c.y > 560 && c.y < 650 && prev.jumpHeight < 55);
      if (coin) {
        s.coins = s.coins.filter(c => c.id !== coin.id);
        s.combo += 1;
        const mult = Math.floor(s.combo / 5) + 1;
        const pts = coin.value * mult;
        s.score += pts;
        if (s.combo > s.maxCombo) { s.maxCombo = s.combo; localStorage.setItem('maxCombo', s.maxCombo); }
        const pColor = coin.type === 'diamond' ? '#ea80fc' : coin.type === 'golden' ? '#ff8f00' : '#ffd700';
        setTimeout(() => { playSound(400 + s.combo * 20, 0.15); addFloat(`+${pts}`, pColor); spawnParticles(pColor); }, 0);
      }

      // Collision — power-up
      const pu = s.powerUps.find(p => p.x === prev.playerPosition && p.y > 560 && p.y < 650);
      if (pu) {
        s.powerUps = s.powerUps.filter(p => p.id !== pu.id);
        setTimeout(() => playSound(500, 0.3, 'square'), 0);
        if (pu.type === 'shield') { s.shieldActive = true; setTimeout(() => addFloat('🛡️ SHIELD!', '#00ffff'), 0); }
        if (pu.type === 'multiplier') { s.score += 100; setTimeout(() => addFloat('⭐ +100!', '#ffff00'), 0); }
        if (pu.type === 'invincible') {
          s.isInvulnerable = true;
          setTimeout(() => {
            addFloat('✨ INVINCIBLE!', '#ff69b4');
            setInvincibleTimer(3);
            const iv = setInterval(() => setInvincibleTimer(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; }), 1000);
            setTimeout(() => setGs(p => ({ ...p, isInvulnerable: false })), 3000);
          }, 0);
        }
      }

      if (!hit || prev.isInvulnerable || prev.shieldActive) {
        s.speedPenalty = Math.max(0, (prev.speedPenalty || 0) - 0.004);
      }
      s.distance += prev.speed * 1.5;
      const baseSpeed = 1 + Math.sqrt(s.distance * 0.0009);
      s.speed = Math.max(1, baseSpeed - s.speedPenalty);

      return s;
    });
  };

  useEffect(() => {
    if (!gs.isPlaying || gs.score === 0) return;
    const id = setInterval(async () => {
      const history = reactionHistory.current;
      const blog = behaviorLog.current;
      const avgReactionTime = history.length
        ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
        : gs.reactionTime || 800;
      let reactionTrend = 'STABLE';
      if (history.length >= 4) {
        const half = Math.floor(history.length / 2);
        const older = history.slice(0, half).reduce((a, b) => a + b, 0) / half;
        const newer = history.slice(half).reduce((a, b) => a + b, 0) / (history.length - half);
        if (newer < older * 0.88)      reactionTrend = 'IMPROVING';
        else if (newer > older * 1.08) reactionTrend = 'STRUGGLING';
      }
      // Fatigue: 3+ mistakes in last 30s
      const now = Date.now();
      const recentMistakes = blog.mistakeTimes.filter(t => now - t < 30000).length;
      // Clean up old mistake times beyond 30s window
      behaviorLog.current.mistakeTimes = blog.mistakeTimes.filter(t => now - t < 30000);
      // Real-time dominant lane: only report if stayed on same lane for 1.5s
      if (gsRef.current.playerPosition !== behaviorLog.current.lastLane) {
        behaviorLog.current.lastLane = gsRef.current.playerPosition;
        behaviorLog.current.laneEnteredAt = now;
      }
      const timeOnLane = now - (behaviorLog.current.laneEnteredAt || now);
      const dominantLane = timeOnLane >= 10000 ? gsRef.current.playerPosition : null;
      try {
        const res = await updatePlayerStats({
          score: gs.score, reactionTime: avgReactionTime, reactionTrend,
          mistakes: gs.mistakes, speed: gs.speed,
          distance: Math.floor(gs.distance), combo: gs.combo,
          dominantLane, jumpCount: blog.jumps, moveCount: blog.moveCount,
          recentMistakes
        });
        if (res?.settings) {
          aiSettings.current = {
            obstacleChance:     res.settings.obstacleSpawnChance,
            coinChance:         res.settings.coinSpawnChance,
            doubleLane:         res.settings.doubleLaneBlocking,
            reactionAdjustment: res.settings.reactionAdjustment ?? 0,
            targetLane:         res.settings.targetLane ?? null,
            fatigueEase:        res.settings.fatigueEase ?? 0,
            performanceScore:   res.performanceScore ?? 0,
            tier:               res.difficulty ?? 'BEGINNER',
          };
          if (res.aiInsight && res.aiInsight !== 'STABLE') {
            const isFatigueMsg = res.aiInsight.includes('FATIGUE');
            const isPatternMsg = res.aiInsight.includes('DETECTED') || res.aiInsight.includes('HUGGER') || res.aiInsight.includes('JUMPER');
            const isReactionMsg = res.aiInsight.includes('IMPROVING') || res.aiInsight.includes('SLOWING');

            // Fatigue: only show on transition from not-fatigued → fatigued
            if (isFatigueMsg && !aiSettings.current.wasFatigued) {
              aiSettings.current.wasFatigued = true;
              setAiInsight(res.aiInsight);
              setTimeout(() => setAiInsight(null), 3000);
            }
            // Clear fatigue state when server stops sending fatigue
            if (!isFatigueMsg) aiSettings.current.wasFatigued = false;

            // Pattern (lane hugger): only show when lane changes
            if (isPatternMsg && res.settings.targetLane !== aiSettings.current.lastDominantLane) {
              aiSettings.current.lastDominantLane = res.settings.targetLane;
              setAiInsight(res.aiInsight);
              setTimeout(() => setAiInsight(null), 3000);
            }

            // Reaction trend: only show on trend change
            if (isReactionMsg && res.aiInsight !== aiSettings.current.lastReactionTrend) {
              aiSettings.current.lastReactionTrend = res.aiInsight;
              setAiInsight(res.aiInsight);
              setTimeout(() => setAiInsight(null), 3000);
            }
          } else {
            // Reset reaction trend tracking when stable
            aiSettings.current.lastReactionTrend = 'STABLE';
          }
        }
      } catch (_) {
        const spd = gsRef.current.speed;
        aiSettings.current = {
          obstacleChance: +(0.03 + spd * 0.012).toFixed(4),
          coinChance:     +(0.015 + spd * 0.002).toFixed(4),
          doubleLane:     spd > 3,
          reactionAdjustment: 0, targetLane: null, fatigueEase: 0,
          performanceScore: 0, tier: 'BEGINNER',
        };
      }
    }, 2000);
    return () => clearInterval(id);
  }, [gs.isPlaying, gs.score]);

  // ── High score / stats ─────────────────────────────────────────────────────
  const updateHighScore = async (score) => {
    const playTime = gameStartTime.current ? Date.now() - gameStartTime.current : 0;
    const hs = Math.max(score, gsRef.current.highScore);
    if (score > gsRef.current.highScore) { localStorage.setItem('highScore', score); setGs(p => ({ ...p, highScore: score })); addFloat('🏆 NEW HIGH SCORE!', '#ffd700'); }
    const ng = (Number(localStorage.getItem('totalGames')) || 0) + 1;
    const nc = (Number(localStorage.getItem('totalCoins')) || 0) + score;
    const bd = Math.max(Number(localStorage.getItem('bestDistance')) || 0, Math.floor(gsRef.current.distance));
    const pt = (Number(localStorage.getItem('totalPlayTime')) || 0) + Math.floor(playTime / 1000);
    localStorage.setItem('totalGames', ng); localStorage.setItem('totalCoins', nc);
    localStorage.setItem('bestDistance', bd); localStorage.setItem('totalPlayTime', pt);
    localStorage.setItem('lastGameScore', score);
    localStorage.setItem('lastGameDistance', Math.floor(gsRef.current.distance));
    localStorage.setItem('lastGameMistakes', gsRef.current.mistakes);
    localStorage.setItem('lastGameCombo', Math.max(gsRef.current.combo, gsRef.current.maxCombo));
    try { await authService.updateGameStats({ gamesPlayed: ng, highScore: hs, totalCoins: nc, bestDistance: bd, totalPlayTime: pt, lastGameScore: score, lastGameDistance: Math.floor(gsRef.current.distance), lastGameMistakes: gsRef.current.mistakes, maxCombo: Math.max(gsRef.current.combo, gsRef.current.maxCombo) }); } catch (_) {}
  };

  // ── Start / Stop ───────────────────────────────────────────────────────────
  const startGame = async () => {
    // Resume AudioContext on user gesture (required on mobile)
    if (audioCtx.current && audioCtx.current.state === 'suspended') {
      await audioCtx.current.resume();
    }
    setLastRun(null);
    let cd = 3;
    setMessage(`🚀 Starting in ${cd}...`);
    const iv = setInterval(() => {
      cd--;
      if (cd > 0) { setMessage(`🚀 Starting in ${cd}...`); playSound(400, 0.1); }
      else {
        clearInterval(iv);
        gameStartTime.current = Date.now();
        reactionHistory.current = [];
        behaviorLog.current = { lanes: [], jumps: 0, mistakeTimes: [], moveCount: 0, lastLane: 1, laneEnteredAt: Date.now() };
        aiSettings.current = { obstacleChance: 0.03, coinChance: 0.015, doubleLane: false, performanceScore: 0, tier: 'BEGINNER', reactionAdjustment: 0, targetLane: null, fatigueEase: 0, lastInsight: null, wasFatigued: false, lastReactionTrend: 'STABLE', lastDominantLane: null };
        setGs(p => ({ ...INITIAL_STATE, maxCombo: p.maxCombo, highScore: p.highScore, isPlaying: true, lastMoveTime: Date.now(), gravity: 0.62, jumpPower: 12 }));
        setMessage('');
        playSound(600, 0.3);
      }
    }, 1000);
  };

  const stopGame = async () => {
    stopBgMusic();
    if (gsRef.current.score > 0) await updateHighScore(gsRef.current.score);
    setGs(p => ({ ...p, isPlaying: false, isPaused: false }));
    setMessage('⏹️ Game stopped!');
  };

  // ── Mobile button handlers ─────────────────────────────────────────────────
  const moveLeft = () => {
    const cur = gsRef.current;
    if (!cur.isPlaying || cur.isPaused || cur.playerPosition <= 0) return;
    const now = Date.now();
    const rt = now - cur.lastMoveTime;
    reactionHistory.current = [...reactionHistory.current.slice(-9), rt];
    behaviorLog.current.lanes.push(cur.playerPosition - 1);
    behaviorLog.current.moveCount++;
    setGs(p => ({ ...p, playerPosition: p.playerPosition - 1, reactionTime: rt, lastMoveTime: now }));
    playSound(200, 0.1);
  };
  const moveRight = () => {
    const cur = gsRef.current;
    if (!cur.isPlaying || cur.isPaused || cur.playerPosition >= 2) return;
    const now = Date.now();
    const rt = now - cur.lastMoveTime;
    reactionHistory.current = [...reactionHistory.current.slice(-9), rt];
    behaviorLog.current.lanes.push(cur.playerPosition + 1);
    behaviorLog.current.moveCount++;
    setGs(p => ({ ...p, playerPosition: p.playerPosition + 1, reactionTime: rt, lastMoveTime: now }));
    playSound(200, 0.1);
  };
  const doJump = () => {
    const cur = gsRef.current;
    if (!cur.isPlaying || cur.isPaused || cur.isJumping || cur.jumpHeight > 0) return;
    behaviorLog.current.jumps++;
    setGs(p => ({ ...p, isJumping: true, jumpVelocity: p.jumpPower, jumpHeight: 1 }));
    playSound(350, 0.15, 'square');
  };

  // ── Swipe controls (mobile) ────────────────────────────────────────────────
  const touchStart = useRef(null);
  const onTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e) => {
    e.preventDefault();
  };
  const onTouchEnd = (e) => {
    if (!touchStart.current || !gsRef.current.isPlaying || gsRef.current.isPaused) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -30) moveLeft();
      if (dx > 30) moveRight();
    } else if (dy < -30) {
      doJump();
    }
    touchStart.current = null;
  };

  const gameContainerRef = useRef(null);
  useEffect(() => {
    const el = gameContainerRef.current;
    if (!el) return;
    const handleTouchMove = (e) => e.preventDefault();
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMove);
  }, []);

  return (
    <div ref={gameContainerRef} style={{ width:'100vw', height:'100vh', background:'#0a0a1a', position:'fixed', top:0, left:0, overflow:'hidden', fontFamily:'Arial, sans-serif',
      userSelect:'none',
      animation: shake ? 'screenShake 0.35s ease-out' : 'none' }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* ── 3D Canvas ── */}
      <Canvas
        camera={{ position: [0, 3.8, 9], fov: 68, near: 0.1, far: 100 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0 }}
        onCreated={({ gl }) => { gl.setClearColor('#05051a'); gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); }}
      >
        <Environment />
        <Track speed={gs.isPlaying && !gs.isPaused ? gs.speed : 0} />
        <Player
          lane={gs.playerPosition}
          jumpHeight={gs.jumpHeight}
          isJumping={gs.isJumping}
          isInvulnerable={gs.isInvulnerable}
          shieldActive={gs.shieldActive}
          isPlaying={gs.isPlaying}
          isPaused={gs.isPaused}
        />
        <Obstacles obstacles={gs.obstacles} speed={gs.speed} />
        <Coins coins={gs.coins} />
        <PowerUps powerUps={gs.powerUps} />
      </Canvas>

      {/* ── HUD ── */}
      {gs.isPlaying && (
        <>
          {/* Score - top center */}
          <div style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)', zIndex:10, textAlign:'center', pointerEvents:'none' }}>
            <div style={{ fontSize:36, fontWeight:900, color:'#fff', textShadow:'0 2px 12px rgba(0,0,0,0.7)', letterSpacing:2, lineHeight:1 }}>{gs.score.toLocaleString()}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', letterSpacing:3, textTransform:'uppercase', marginTop:2 }}>SCORE</div>
          </div>

          {/* ── Left HUD — lives + distance meter ── */}
          <div style={{ position:'absolute', top:14, left:16, zIndex:10, pointerEvents:'none' }}>
            {/* Lives */}
            <div style={{ display:'flex', gap:6, marginBottom:10 }}>
              {[0,1,2,3,4].map(i => {
                const alive = i < (5 - gs.mistakes);
                const justLost = brokenHeart && i === (4 - gs.mistakes);
                return (
                  <div key={i} style={{
                    width:26, height:26, borderRadius:'50%',
                    background: alive ? 'radial-gradient(circle at 35% 35%, #ff6b6b, #c62828)' : 'rgba(255,255,255,0.07)',
                    border: alive ? '1.5px solid rgba(255,120,120,0.6)' : '1.5px solid rgba(255,255,255,0.12)',
                    boxShadow: alive ? '0 0 14px rgba(255,50,50,0.7), 0 0 28px rgba(255,50,50,0.3), inset 0 1px 0 rgba(255,255,255,0.25)' : 'none',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    animation: justLost ? 'heartBreak 0.5s ease-out forwards' : 'none',
                    transition:'box-shadow 0.4s, background 0.4s'
                  }}>
                    {alive ? <MdFavorite size={15} color="#ffcdd2" /> : <MdFavoriteBorder size={15} color="rgba(255,255,255,0.2)" />}
                  </div>
                );
              })}
            </div>

            {/* Premium distance meter */}
            <div style={{
              background:'linear-gradient(145deg, rgba(0,0,0,0.75) 0%, rgba(0,20,40,0.85) 100%)',
              border:'1px solid rgba(0,229,255,0.25)',
              borderRadius:16, padding:'8px 14px',
              backdropFilter:'blur(20px)',
              boxShadow:'0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
              position:'relative', overflow:'hidden', minWidth:110,
            }}>
              {/* Top shimmer */}
              <div style={{ position:'absolute', top:0, left:'15%', right:'15%', height:1, background:'linear-gradient(90deg,transparent,rgba(0,229,255,0.5),transparent)' }} />
              <div style={{ fontSize:8, color:'rgba(0,229,255,0.6)', letterSpacing:3, textTransform:'uppercase', marginBottom:4, display:'flex', alignItems:'center', gap:4 }}>
                <GiRun size={9} color="rgba(0,229,255,0.6)" /> DISTANCE
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
                <span style={{
                  fontSize:26, fontWeight:900, letterSpacing:-0.5, lineHeight:1,
                  color:'#fff',
                  textShadow:'0 0 20px rgba(0,229,255,0.8), 0 2px 4px rgba(0,0,0,0.8)',
                }}>{Math.floor(gs.distance).toLocaleString()}</span>
                <span style={{ fontSize:12, color:'#00e5ff', fontWeight:700, letterSpacing:1 }}>m</span>
              </div>
              {/* Progress bar */}
              <div style={{ marginTop:6, height:3, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                <div style={{
                  height:'100%',
                  width:`${Math.min(100,(gs.distance % 2000) / 2000 * 100)}%`,
                  background:'linear-gradient(90deg, #00b8d4, #00e5ff)',
                  borderRadius:2, transition:'width 0.1s linear',
                  boxShadow:'0 0 8px rgba(0,229,255,0.9)'
                }} />
              </div>
              {/* Next milestone */}
              <div style={{ marginTop:3, fontSize:8, color:'rgba(255,255,255,0.3)', letterSpacing:1 }}>
                next: {(Math.ceil(gs.distance / 2000) * 2000).toLocaleString()}m
              </div>
            </div>
          </div>

          {/* ── Right HUD — circular speedometer + powerups ── */}
          <div style={{ position:'absolute', top:14, right:16, zIndex:10, textAlign:'right', pointerEvents:'none' }}>
            {/* Circular arc speedometer */}
            {(() => {
              const size = 100;
              const cx = size / 2, cy = size / 2, r = 36;
              const maxSpeed = 5.0;
              const pct = Math.min(1, Math.max(0, (gs.speed - 1) / (maxSpeed - 1)));
              const startAngle = 135, totalArc = 270;
              const endAngle = startAngle + totalArc * pct;
              const toRad = deg => (deg - 90) * Math.PI / 180;
              const arcPath = (start, end) => {
                const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) };
                const e = { x: cx + r * Math.cos(toRad(end)),   y: cy + r * Math.sin(toRad(end)) };
                const large = (end - start) > 180 ? 1 : 0;
                return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
              };
              const needleAngle = startAngle + totalArc * pct;
              const nx = cx + (r - 9) * Math.cos(toRad(needleAngle));
              const ny = cy + (r - 9) * Math.sin(toRad(needleAngle));
              const speedColor = gs.speed > 4 ? '#ff5252' : gs.speed > 2.5 ? '#ffd740' : '#00e676';
              const trackColor = gs.speed > 4 ? 'rgba(255,82,82,0.12)' : gs.speed > 2.5 ? 'rgba(255,215,64,0.12)' : 'rgba(0,230,118,0.12)';
              const glowColor  = gs.speed > 4 ? 'rgba(255,82,82,0.7)' : gs.speed > 2.5 ? 'rgba(255,215,64,0.7)' : 'rgba(0,230,118,0.7)';
              return (
                <div style={{ position:'relative', width:size, height:size, marginLeft:'auto', marginBottom:6 }}>
                  {/* Card background */}
                  <div style={{
                    position:'absolute', inset:0, borderRadius:'50%',
                    background:`radial-gradient(circle at 40% 35%, ${trackColor}, rgba(0,0,0,0.82))`,
                    border:`1px solid ${speedColor}22`,
                    boxShadow:`0 0 0 1px ${speedColor}11, 0 4px 20px rgba(0,0,0,0.6), 0 0 30px ${speedColor}18`,
                    backdropFilter:'blur(16px)',
                  }} />
                  <svg width={size} height={size} style={{ position:'relative', overflow:'visible' }}>
                    <defs>
                      <filter id="spGlow2">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>
                    {/* Outer decorative ring */}
                    <circle cx={cx} cy={cy} r={r+5} fill="none" stroke={`${speedColor}18`} strokeWidth="1" />
                    {/* Track arc background */}
                    <path d={arcPath(startAngle, startAngle + totalArc)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round" />
                    {/* Active arc with glow */}
                    {pct > 0 && <path d={arcPath(startAngle, endAngle)} fill="none" stroke={speedColor} strokeWidth="6" strokeLinecap="round" filter="url(#spGlow2)" />}
                    {/* Tick marks */}
                    {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => {
                      const a = startAngle + totalArc * t;
                      const isMajor = i % 2 === 0;
                      const inner = r - (isMajor ? 11 : 8), outer = r - 4;
                      return <line key={i}
                        x1={cx + inner * Math.cos(toRad(a))} y1={cy + inner * Math.sin(toRad(a))}
                        x2={cx + outer * Math.cos(toRad(a))} y2={cy + outer * Math.sin(toRad(a))}
                        stroke={t <= pct ? speedColor : 'rgba(255,255,255,0.2)'}
                        strokeWidth={isMajor ? 2 : 1} strokeLinecap="round" />;
                    })}
                    {/* Needle dot */}
                    {pct > 0 && <circle cx={nx} cy={ny} r={3.5} fill={speedColor} filter="url(#spGlow2)" />}
                  </svg>
                  {/* Center content */}
                  <div style={{
                    position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                    textAlign:'center', lineHeight:1
                  }}>
                    <div style={{
                      fontSize:18, fontWeight:900, letterSpacing:-0.5,
                      color:'#fff',
                      textShadow:`0 0 16px ${glowColor}, 0 2px 4px rgba(0,0,0,0.8)`,
                      transition:'color 0.3s'
                    }}>{gs.speed.toFixed(1)}</div>
                    <div style={{ fontSize:7, color:speedColor, letterSpacing:2, marginTop:2, fontWeight:700, opacity:0.9 }}>SPEED</div>
                  </div>
                </div>
              );
            })()}

            {/* Powerup badges */}
            <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end' }}>
              {gs.shieldActive && (
                <div style={{ background:'linear-gradient(135deg,rgba(0,229,255,0.15),rgba(0,229,255,0.05))', border:'1px solid rgba(0,229,255,0.4)', borderRadius:10, padding:'3px 10px', fontSize:11, color:'#00e5ff', boxShadow:'0 0 12px rgba(0,229,255,0.2)', letterSpacing:1, display:'flex', alignItems:'center', gap:5 }}>
                  <MdShield size={13} color="#00e5ff" /> SHIELD
                </div>
              )}
              {gs.isInvulnerable && !gs.shieldActive && (
                <div style={{ background:'linear-gradient(135deg,rgba(0,230,118,0.15),rgba(0,230,118,0.05))', border:'1px solid rgba(0,230,118,0.4)', borderRadius:10, padding:'4px 10px', fontSize:11, color:'#00e676', minWidth:80, boxShadow:'0 0 12px rgba(0,230,118,0.2)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><MdAutoAwesome size={13} color="#00e676" /> INVNC</span>
                    <span style={{ fontWeight:700 }}>{invincibleTimer}s</span>
                  </div>
                  <div style={{ height:2, background:'rgba(255,255,255,0.1)', borderRadius:2 }}>
                    <div style={{ height:'100%', width:`${(invincibleTimer/3)*100}%`, background:'linear-gradient(90deg,#69f0ae,#00e676)', borderRadius:2, transition:'width 1s linear', boxShadow:'0 0 6px rgba(0,230,118,0.6)' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Insight Notification */}
          {aiInsight && (() => {
            const isGood    = aiInsight.includes('IMPROVING');
            const isFatigue = aiInsight.includes('FATIGUE');
            const isEasing  = aiInsight.includes('EASING') || aiInsight.includes('ADAPTING') || aiInsight.includes('REDUCING') || aiInsight.includes('SLOWING');
            const isTarget  = aiInsight.includes('TARGETING') || aiInsight.includes('DETECTED') || aiInsight.includes('HUGGER') || aiInsight.includes('JUMPER');
            const accent  = isGood ? '#00e676' : isFatigue || isEasing ? '#ffd740' : isTarget ? '#ff6d00' : '#ff5252';
            const accent2 = isGood ? '#69f0ae' : isFatigue || isEasing ? '#ffab00' : isTarget ? '#ff9100' : '#ff1744';
            const bgFrom  = isGood ? 'rgba(0,230,118,0.18)' : isFatigue || isEasing ? 'rgba(255,215,64,0.18)' : isTarget ? 'rgba(255,109,0,0.18)' : 'rgba(255,23,68,0.18)';
            const icon    = isGood ? '⚡' : isFatigue ? '😴' : isEasing ? '🧠' : isTarget ? '🎯' : '⚠️';
            const parts   = aiInsight.split(' — ');
            const label   = parts[0]?.replace(/^[^a-zA-Z]+/, '') || aiInsight;
            const sub     = parts[1] || '';
            return (
              <div style={{
                position:'absolute', top:16, left:'50%', transform:'translateX(-50%)',
                zIndex:28, pointerEvents:'none',
                animation:'aiSlideIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards'
              }}>
                {/* Outer glow layer */}
                <div style={{
                  position:'absolute', inset:-4, borderRadius:22,
                  background:`radial-gradient(ellipse at 50% 0%, ${accent}22, transparent 70%)`,
                  filter:`blur(8px)`,
                }}></div>
                {/* Main card */}
                <div style={{
                  position:'relative',
                  background:`linear-gradient(135deg, rgba(8,8,20,0.96) 0%, ${bgFrom} 100%)`,
                  border:`1px solid ${accent}55`,
                  borderRadius:18,
                  padding:'10px 18px 10px 14px',
                  backdropFilter:'blur(20px)',
                  boxShadow:`0 0 0 1px ${accent}22, 0 8px 32px rgba(0,0,0,0.6), 0 0 40px ${accent}18`,
                  minWidth:240, maxWidth:360,
                  overflow:'hidden',
                }}>
                  {/* Top shimmer line */}
                  <div style={{
                    position:'absolute', top:0, left:'10%', right:'10%', height:1,
                    background:`linear-gradient(90deg, transparent, ${accent}, transparent)`,
                    opacity:0.8,
                  }} />
                  {/* Content row */}
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    {/* Icon badge */}
                    <div style={{
                      width:36, height:36, borderRadius:10, flexShrink:0,
                      background:`linear-gradient(135deg, ${accent}33, ${accent}11)`,
                      border:`1px solid ${accent}44`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:18,
                      boxShadow:`0 0 12px ${accent}33`,
                    }}>{icon}</div>
                    {/* Text */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                        <RiRobot2Fill size={10} color={accent} />
                        <span style={{ fontSize:8, color:accent, letterSpacing:3, fontWeight:700, textTransform:'uppercase', opacity:0.9 }}>AI ENGINE</span>
                        {/* Live pulse dot */}
                        <div style={{ width:5, height:5, borderRadius:'50%', background:accent, boxShadow:`0 0 8px ${accent}`, animation:'aiPulse 1.2s ease-in-out infinite', marginLeft:'auto' }} />
                      </div>
                      <div style={{ fontSize:12, fontWeight:800, color:'#fff', letterSpacing:0.3, lineHeight:1.3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</div>
                      {sub && <div style={{ fontSize:9, color:`${accent}cc`, marginTop:2, letterSpacing:0.5, fontWeight:600 }}>{sub}</div>}
                    </div>
                  </div>
                  {/* Drain bar */}
                  <div style={{ marginTop:8, height:2, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', width:'100%', borderRadius:2,
                      background:`linear-gradient(90deg, ${accent}, ${accent2})`,
                      animation:'aiDrain 3s linear forwards',
                      boxShadow:`0 0 8px ${accent}`,
                    }} />
                  </div>
                  {/* Bottom shimmer line */}
                  <div style={{
                    position:'absolute', bottom:0, left:'20%', right:'20%', height:1,
                    background:`linear-gradient(90deg, transparent, ${accent}44, transparent)`,
                  }} />
                </div>
              </div>
            );
          })()}
          {gs.combo > 4 && (
            <div style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:10, textAlign:'center', pointerEvents:'none' }}>
              <div style={{ fontSize:22, fontWeight:900, color:'#ffd740', textShadow:'0 0 20px #ff8f00', letterSpacing:1, display:'flex', alignItems:'center', gap:6, justifyContent:'center' }}><FaFire size={18} color="#ff8f00" /> COMBO x{gs.combo}</div>
              <div style={{ height:4, width:160, background:'rgba(255,255,255,0.15)', borderRadius:2, margin:'4px auto 0' }}>
                <div style={{ height:'100%', width:`${Math.min(100,(gs.combo/20)*100)}%`, background:'linear-gradient(90deg,#ff8f00,#ffd740)', borderRadius:2, transition:'width 0.3s' }} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Speed lines ── */}
      {gs.isPlaying && gs.speed > 1.5 && (
        <div style={{ position:'absolute', inset:0, zIndex:8, pointerEvents:'none', overflow:'hidden' }}>
          {Array.from({ length: Math.floor((gs.speed - 1.5) * 14) }).map((_, i) => {
            const angle = (i / Math.max(1, Math.floor((gs.speed - 1.5) * 14))) * 360;
            const len = 60 + (gs.speed - 1) * 40;
            return <div key={i} style={{ position:'absolute', top:'50%', left:'50%', width:len, height:1, background:`linear-gradient(90deg,transparent,rgba(255,255,255,${0.04 + (gs.speed-1)*0.03}))`, transform:`rotate(${angle}deg)`, transformOrigin:'0 0' }} />;
          })}
        </div>
      )}

      {/* ── Ghost trail on lane change ── */}
      {ghostLane !== null && gs.isPlaying && (
        <div style={{ position:'absolute', bottom:'28%',
          left: ghostLane === 0 ? 'calc(50% - 140px)' : ghostLane === 2 ? 'calc(50% + 90px)' : 'calc(50% - 25px)',
          width:50, height:90, zIndex:9, pointerEvents:'none',
          background:'rgba(255,255,255,0.08)', borderRadius:8,
          animation:'ghostFade 0.18s ease-out forwards' }} />
      )}

      {/* ── Coin particles ── */}
      {particles.map(pt => (
        <div key={pt.id} style={{ position:'absolute', top:'55%', left:'50%', width:6, height:6, borderRadius:'50%',
          background:pt.color, pointerEvents:'none', zIndex:22,
          animation:'particle 0.6s ease-out forwards',
          '--angle':`${pt.angle}deg` }} />
      ))}

      {/* ── Hit vignette flash ── */}
      <div style={{ position:'absolute', inset:0, zIndex:25, pointerEvents:'none', background:'radial-gradient(ellipse at center, transparent 35%, rgba(220,0,0,0.65) 100%)', opacity: hitFlash ? 1 : 0, transition: hitFlash ? 'none' : 'opacity 0.4s ease-out' }} />



      {/* ── Floating texts ── */}
      {floatingTexts.map(ft => (
        <div key={ft.id} style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)', color: ft.color, fontSize: 28, fontWeight: 'bold', pointerEvents: 'none', zIndex: 20, textShadow: '2px 2px 8px rgba(0,0,0,0.9)', animation: 'floatUp 2s ease-out forwards' }}>
          {ft.text}
        </div>
      ))}

      {/* ── Pause overlay ── */}
      {gs.isPlaying && gs.isPaused && (
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:30 }}>
          <div style={{ background:'linear-gradient(145deg,rgba(20,20,40,0.98),rgba(10,10,25,0.98))', border:'1px solid rgba(255,255,255,0.12)', borderRadius:24, padding:'40px 56px', textAlign:'center', color:'#fff', boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ fontSize:44, marginBottom:6, display:'flex', justifyContent:'center' }}><FaPause size={40} color="#fff" /></div>
            <div style={{ fontSize:26, fontWeight:800, letterSpacing:4, marginBottom:20 }}>PAUSED</div>
            {/* Live stats */}
            <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:24 }}>
              <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 16px', minWidth:80 }}>
                <div style={{ fontSize:20, fontWeight:800, color:'#ffd740' }}>{gs.score.toLocaleString()}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', letterSpacing:2, marginTop:2 }}>SCORE</div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 16px', minWidth:80 }}>
                <div style={{ fontSize:20, fontWeight:800, color:'#64b5f6' }}>{Math.floor(gs.distance)}m</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', letterSpacing:2, marginTop:2 }}>DISTANCE</div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 16px', minWidth:80 }}>
                <div style={{ fontSize:20, fontWeight:800, color:'#69f0ae' }}>{gs.combo}x</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', letterSpacing:2, marginTop:2 }}>COMBO</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:24, letterSpacing:1 }}>Press P or ESC to resume</div>
            <div style={{ display:'flex', gap:14, justifyContent:'center' }}>
              <button onClick={() => setGs(p => ({ ...p, isPaused: false }))} style={{ padding:'12px 32px', fontSize:15, fontWeight:700, background:'linear-gradient(135deg,#43a047,#2e7d32)', color:'#fff', border:'none', borderRadius:12, cursor:'pointer', letterSpacing:1, display:'flex', alignItems:'center', gap:8 }}><FaPlay size={13}/> RESUME</button>
              <button onClick={async () => { await stopGame(); onNavigate('home'); }} style={{ padding:'12px 32px', fontSize:15, fontWeight:700, background:'linear-gradient(135deg,#e53935,#b71c1c)', color:'#fff', border:'none', borderRadius:12, cursor:'pointer', letterSpacing:1, display:'flex', alignItems:'center', gap:8 }}><FaHome size={13}/> EXIT</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Start / Game-over overlay ── */}
      {!gs.isPlaying && (
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.82) 100%)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:30 }}>
          <div style={{ textAlign:'center', color:'#fff', maxWidth:440 }}>

            {lastRun ? (
              /* ── Game Over state ── */
              <>
                <div style={{ marginBottom:6, display:'flex', justifyContent:'center' }}><FaSkull size={52} color="#ff5252" style={{ filter:'drop-shadow(0 4px 16px rgba(255,50,50,0.6))' }} /></div>
                <div style={{ fontSize:32, fontWeight:900, letterSpacing:3, marginBottom:4, color:'#ff5252' }}>GAME OVER</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', letterSpacing:2, marginBottom:22 }}>BETTER LUCK NEXT TIME</div>

                {/* Last run stats */}
                <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:22 }}>
                  <div style={{ background:'rgba(255,82,82,0.12)', border:'1px solid rgba(255,82,82,0.3)', borderRadius:14, padding:'12px 18px', minWidth:90 }}>
                    <div style={{ fontSize:24, fontWeight:800, color:'#ff5252' }}>{lastRun.score.toLocaleString()}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2 }}>SCORE</div>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'12px 18px', minWidth:90 }}>
                    <div style={{ fontSize:24, fontWeight:800, color:'#64b5f6' }}>{lastRun.distance}m</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2 }}>DISTANCE</div>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'12px 18px', minWidth:90 }}>
                    <div style={{ fontSize:24, fontWeight:800, color:'#ffd740' }}>{lastRun.combo}x</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2 }}>BEST COMBO</div>
                  </div>
                </div>

                {/* Best score comparison */}
                {gs.highScore > 0 && (
                  <div style={{ fontSize:12, color: lastRun.score >= gs.highScore ? '#ffd740' : 'rgba(255,255,255,0.4)', marginBottom:12, letterSpacing:1, display:'flex', alignItems:'center', gap:5, justifyContent:'center' }}>
                    <FaTrophy size={12} color={lastRun.score >= gs.highScore ? '#ffd740' : 'rgba(255,255,255,0.4)'} />
                    {lastRun.score >= gs.highScore ? 'NEW BEST SCORE!' : `Best: ${gs.highScore.toLocaleString()}`}
                  </div>
                )}
                {sessionComparison && (
                  <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:20 }}>
                    <div style={{
                      background: sessionComparison.scoreDiff >= 0 ? 'rgba(0,230,118,0.1)' : 'rgba(255,82,82,0.1)',
                      border: `1px solid ${sessionComparison.scoreDiff >= 0 ? 'rgba(0,230,118,0.4)' : 'rgba(255,82,82,0.4)'}`,
                      borderRadius:10, padding:'6px 14px', fontSize:12,
                      color: sessionComparison.scoreDiff >= 0 ? '#00e676' : '#ff5252'
                    }}>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', letterSpacing:2, marginBottom:2 }}>VS BEST SCORE</div>
                      <div style={{ fontWeight:800 }}>{sessionComparison.scoreDiff >= 0 ? '+' : ''}{sessionComparison.scoreDiff.toLocaleString()}</div>
                    </div>
                    <div style={{
                      background: sessionComparison.distDiff >= 0 ? 'rgba(0,230,118,0.1)' : 'rgba(255,82,82,0.1)',
                      border: `1px solid ${sessionComparison.distDiff >= 0 ? 'rgba(0,230,118,0.4)' : 'rgba(255,82,82,0.4)'}`,
                      borderRadius:10, padding:'6px 14px', fontSize:12,
                      color: sessionComparison.distDiff >= 0 ? '#00e676' : '#ff5252'
                    }}>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', letterSpacing:2, marginBottom:2 }}>VS BEST DISTANCE</div>
                      <div style={{ fontWeight:800 }}>{sessionComparison.distDiff >= 0 ? '+' : ''}{sessionComparison.distDiff}m</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ── Fresh start state ── */
              <>
                <div style={{ marginBottom:4, display:'flex', justifyContent:'center', filter:'drop-shadow(0 4px 24px rgba(255,215,0,0.5))' }}><GiRun size={72} color="#ffd740" /></div>
                <div style={{ fontSize:38, fontWeight:900, letterSpacing:3, marginBottom:4, background:'linear-gradient(135deg,#fff 0%,#ffd740 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>AI RUNNER</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', letterSpacing:2, marginBottom:20 }}>POWERED BY AI DIFFICULTY ENGINE</div>

                {gs.highScore > 0 && (
                  <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:28 }}>
                    <div style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'10px 20px', minWidth:90 }}>
                      <div style={{ fontSize:22, fontWeight:800, color:'#ffd740', display:'flex', alignItems:'center', gap:5, justifyContent:'center' }}><FaTrophy size={15} color="#ffd740" />{gs.highScore.toLocaleString()}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2 }}>BEST</div>
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'10px 20px', minWidth:90 }}>
                      <div style={{ fontSize:22, fontWeight:800, color:'#69f0ae', display:'flex', alignItems:'center', gap:5, justifyContent:'center' }}><FaFire size={15} color="#ff8f00" />{gs.maxCombo}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', letterSpacing:2 }}>COMBO</div>
                    </div>
                  </div>
                )}

                {gs.highScore === 0 && (
                  <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:28, flexWrap:'wrap' }}>
                    {[['A / ←', 'Left'],['D / →', 'Right'],['Space', 'Jump'],['P', 'Pause']].map(([k,v]) => (
                      <div key={k} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'5px 12px', fontSize:11 }}>
                        <span style={{ color:'#ffd740', fontWeight:700 }}>{k}</span>
                        <span style={{ color:'rgba(255,255,255,0.5)', marginLeft:5 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
              <button onClick={startGame} style={{ padding:'16px 56px', fontSize:18, fontWeight:900, background:'linear-gradient(135deg,#43a047,#1b5e20)', color:'#fff', border:'none', borderRadius:50, cursor:'pointer', letterSpacing:2, boxShadow:'0 8px 32px rgba(67,160,71,0.5)', transition:'transform 0.15s', display:'flex', alignItems:'center', gap:10 }}
                onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                {lastRun ? <><FaRedo size={15}/> PLAY AGAIN</> : <><FaPlay size={15}/> PLAY</>}
              </button>
              {gs.highScore > 0 && (
                <button onClick={() => onNavigate('home')} style={{ padding:'12px 40px', fontSize:15, fontWeight:700, background:'linear-gradient(135deg,#1565c0,#0d47a1)', color:'#fff', border:'none', borderRadius:50, cursor:'pointer', letterSpacing:2, boxShadow:'0 6px 24px rgba(21,101,192,0.4)', transition:'transform 0.15s', display:'flex', alignItems:'center', gap:8 }}
                  onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                  <FaHome size={14}/> EXIT
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Countdown ── */}
      {message.includes('Starting') && (
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'rgba(0,0,0,0.88)', color:'#fff', padding:'28px 56px', borderRadius:24, fontSize:36, fontWeight:900, zIndex:35, border:'1px solid rgba(255,255,255,0.15)', letterSpacing:3, textAlign:'center' }}>
          {message}
        </div>
      )}



      <style>{`
        @keyframes floatUp {
          0%   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
          100% { opacity:0; transform:translateX(-50%) translateY(-100px) scale(1.3); }
        }
        @keyframes screenShake {
          0%   { transform:translateX(0); }
          20%  { transform:translateX(-8px); }
          40%  { transform:translateX(8px); }
          60%  { transform:translateX(-5px); }
          80%  { transform:translateX(4px); }
          100% { transform:translateX(0); }
        }
        @keyframes ghostFade {
          0%   { opacity:0.45; transform:scaleX(1); }
          100% { opacity:0;    transform:scaleX(1.4); }
        }
        @keyframes particle {
          0%   { opacity:1; transform:translate(-50%,-50%) rotate(var(--angle)) translateX(0px) scale(1); }
          100% { opacity:0; transform:translate(-50%,-50%) rotate(var(--angle)) translateX(38px) scale(0.3); }
        }
        @keyframes heartBreak {
          0%   { transform:scale(1);   filter:brightness(1); }
          30%  { transform:scale(1.5); filter:brightness(2) drop-shadow(0 0 6px #ff1744); }
          65%  { transform:scale(0.6) rotate(-20deg); opacity:0.4; }
          100% { transform:scale(1)   rotate(0deg); opacity:1; }
        }
        @keyframes aiSlideIn {
          0%   { opacity:0; transform:translateX(-50%) translateY(-20px) scale(0.92); }
          100% { opacity:1; transform:translateX(-50%) translateY(0px)   scale(1); }
        }
        @keyframes aiDrain {
          0%   { width:100%; }
          100% { width:0%; }
        }
        @keyframes aiPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.4; transform:scale(1.6); }
        }

      `}</style>
    </div>
  );
}

