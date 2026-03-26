import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LANE_WIDTH  = 2.5;
const TRACK_LENGTH = 100;

// Neon window texture
function makeWinTex(cols, rows, seed) {
  const W = 128, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#05051a';
  ctx.fillRect(0, 0, W, H);
  const neons = ['#00fff7', '#a259ff', '#ff6d00', '#536dfe', '#ea80fc'];
  const cw = W / cols, ch = H / rows, pad = 3;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v   = Math.sin(seed * 127.1 + r * 31.7 + c * 17.3);
      const lit = v > 0;
      const dim = v > -0.3 && v <= 0;
      if (lit) {
        const neon = neons[Math.floor(Math.abs(Math.sin(seed + r + c) * 5))];
        ctx.fillStyle = neon;
        ctx.globalAlpha = 0.7 + Math.random() * 0.3;
      } else if (dim) {
        ctx.fillStyle = '#1a1a4e';
        ctx.globalAlpha = 0.5;
      } else {
        ctx.fillStyle = '#0a0a1e';
        ctx.globalAlpha = 0.8;
      }
      ctx.fillRect(c * cw + pad, r * ch + pad, cw - pad * 2, ch - pad * 2);
    }
  }
  ctx.globalAlpha = 1;
  return new THREE.CanvasTexture(canvas);
}

function Building({ b }) {
  const frontTex = useMemo(() => makeWinTex(3, b.winRows, b.id),      []);
  const sideTex  = useMemo(() => makeWinTex(2, b.winRows, b.id + 50), []);

  return (
    <group position={[b.x, 0, b.z]}>
      {/* Main body */}
      <mesh position={[0, b.h / 2, 0]}>
        <boxGeometry args={[b.w, b.h, b.d]} />
        <meshLambertMaterial color={b.color} />
      </mesh>
      {/* Base band */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[b.w + 0.12, 0.6, b.d + 0.12]} />
        <meshLambertMaterial color="#030308" />
      </mesh>
      {/* Mid floor band */}
      <mesh position={[0, b.h * 0.45, b.d / 2 + 0.04]}>
        <boxGeometry args={[b.w + 0.06, 0.1, 0.06]} />
        <meshBasicMaterial color={b.neonColor} opacity={0.35} transparent />
      </mesh>
      {/* Neon roof line */}
      <mesh position={[0, b.h + 0.14, b.d / 2 + 0.06]}>
        <boxGeometry args={[b.w + 0.14, 0.14, 0.1]} />
        <meshBasicMaterial color={b.neonColor} />
      </mesh>
      {/* Neon roof side */}
      <mesh position={[0, b.h + 0.14, -(b.d / 2 + 0.06)]}>
        <boxGeometry args={[b.w + 0.14, 0.14, 0.1]} />
        <meshBasicMaterial color={b.neonColor} opacity={0.4} transparent />
      </mesh>
      {/* Neon vertical edge strip — front */}
      <mesh position={[b.side * (b.w / 2), b.h * 0.5, b.d / 2 + 0.06]}>
        <boxGeometry args={[0.08, b.h * 0.75, 0.07]} />
        <meshBasicMaterial color={b.neonColor} opacity={0.65} transparent />
      </mesh>
      {/* Neon sign panel */}
      <mesh position={[0, b.h * 0.6, b.d / 2 + 0.08]}>
        <planeGeometry args={[b.w * 0.55, 0.38]} />
        <meshBasicMaterial color={b.neonColor} opacity={0.85} transparent />
      </mesh>
      {/* Window texture front */}
      <mesh position={[0, b.h * 0.5, b.d / 2 + 0.05]}>
        <planeGeometry args={[b.w - 0.3, b.h - 0.8]} />
        <meshBasicMaterial map={frontTex} transparent opacity={0.95} />
      </mesh>
      {/* Window texture side */}
      <mesh position={[b.side * (b.w / 2 + 0.05), b.h * 0.5, 0]} rotation={[0, b.side * Math.PI / 2, 0]}>
        <planeGeometry args={[b.d - 0.3, b.h - 0.8]} />
        <meshBasicMaterial map={sideTex} transparent opacity={0.85} />
      </mesh>
      {/* Rooftop antenna */}
      {b.hasTower && (
        <group position={[b.w * 0.2, b.h, 0]}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.025, 0.045, 1.4, 5]} />
            <meshLambertMaterial color="#1a1a3e" />
          </mesh>
          <mesh position={[0, 1.45, 0]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshBasicMaterial color={b.neonColor} />
          </mesh>
          <pointLight position={[0, 1.45, 0]} color={b.neonColor} intensity={0.4} distance={6} decay={2} />
        </group>
      )}
      {/* Rooftop AC unit */}
      {b.id % 2 === 0 && (
        <mesh position={[-b.w * 0.25, b.h + 0.2, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.35]} />
          <meshLambertMaterial color="#0a0a1e" />
        </mesh>
      )}
      <pointLight position={[0, 0.5, b.d / 2 + 0.5]} color={b.neonColor} intensity={0.3} distance={5} decay={2} />
    </group>
  );
}

// Slim tower building
function SlimTower({ b }) {
  const frontTex = useMemo(() => makeWinTex(2, b.winRows, b.id), []);
  return (
    <group position={[b.x, 0, b.z]}>
      <mesh position={[0, b.h / 2, 0]}>
        <boxGeometry args={[b.w * 0.55, b.h, b.d * 0.55]} />
        <meshLambertMaterial color={b.color} />
      </mesh>
      {/* Wider base podium */}
      <mesh position={[0, b.h * 0.15, 0]}>
        <boxGeometry args={[b.w, b.h * 0.3, b.d]} />
        <meshLambertMaterial color={b.color} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[b.w + 0.1, 0.6, b.d + 0.1]} />
        <meshLambertMaterial color="#030308" />
      </mesh>
      {/* Neon roof */}
      <mesh position={[0, b.h + 0.12, b.d * 0.28 + 0.05]}>
        <boxGeometry args={[b.w * 0.55 + 0.1, 0.12, 0.08]} />
        <meshBasicMaterial color={b.neonColor} />
      </mesh>
      {/* Spire */}
      <mesh position={[0, b.h + 1.2, 0]}>
        <cylinderGeometry args={[0.04, 0.12, 2.4, 5]} />
        <meshLambertMaterial color="#1a1a3e" />
      </mesh>
      <mesh position={[0, b.h + 2.5, 0]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshBasicMaterial color={b.neonColor} />
      </mesh>
      <pointLight position={[0, b.h + 2.5, 0]} color={b.neonColor} intensity={0.5} distance={8} decay={2} />
      {/* Windows */}
      <mesh position={[0, b.h * 0.55, b.d * 0.28 + 0.04]}>
        <planeGeometry args={[b.w * 0.5, b.h * 0.65]} />
        <meshBasicMaterial map={frontTex} transparent opacity={0.95} />
      </mesh>
      {/* Neon vertical strips */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} position={[s * b.w * 0.27, b.h * 0.5, b.d * 0.28 + 0.05]}>
          <boxGeometry args={[0.06, b.h * 0.8, 0.06]} />
          <meshBasicMaterial color={b.neonColor} opacity={0.5} transparent />
        </mesh>
      ))}
      <pointLight position={[0, 0.5, b.d * 0.28 + 0.5]} color={b.neonColor} intensity={0.3} distance={5} decay={2} />
    </group>
  );
}

// Wide flat building
function WideFlat({ b }) {
  const frontTex = useMemo(() => makeWinTex(5, b.winRows, b.id), []);
  const h = b.h * 0.55;
  return (
    <group position={[b.x, 0, b.z]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[b.w * 1.6, h, b.d]} />
        <meshLambertMaterial color={b.color} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[b.w * 1.6 + 0.1, 0.6, b.d + 0.1]} />
        <meshLambertMaterial color="#030308" />
      </mesh>
      {/* Neon roof full width */}
      <mesh position={[0, h + 0.12, b.d / 2 + 0.05]}>
        <boxGeometry args={[b.w * 1.6 + 0.1, 0.14, 0.1]} />
        <meshBasicMaterial color={b.neonColor} />
      </mesh>
      {/* Horizontal neon bands */}
      {[0.3, 0.6].map((t, i) => (
        <mesh key={i} position={[0, h * t, b.d / 2 + 0.04]}>
          <boxGeometry args={[b.w * 1.6, 0.08, 0.06]} />
          <meshBasicMaterial color={b.neonColor} opacity={0.3} transparent />
        </mesh>
      ))}
      {/* Rooftop structures */}
      {[-b.w * 0.5, 0, b.w * 0.5].map((x, i) => (
        <mesh key={i} position={[x, h + 0.3, 0]}>
          <boxGeometry args={[0.4, 0.5, 0.4]} />
          <meshLambertMaterial color="#0a0a1e" />
        </mesh>
      ))}
      <mesh position={[0, h * 0.5, b.d / 2 + 0.04]}>
        <planeGeometry args={[b.w * 1.55, h - 0.8]} />
        <meshBasicMaterial map={frontTex} transparent opacity={0.95} />
      </mesh>
      <pointLight position={[0, 0.5, b.d / 2 + 0.5]} color={b.neonColor} intensity={0.3} distance={6} decay={2} />
    </group>
  );
}

// Stepped pyramid building
function SteppedBuilding({ b }) {
  const frontTex = useMemo(() => makeWinTex(3, b.winRows, b.id), []);
  const steps = 3;
  return (
    <group position={[b.x, 0, b.z]}>
      {Array.from({ length: steps }, (_, i) => {
        const ratio = 1 - i * 0.28;
        const yOff  = i === 0 ? b.h * 0.28 / 2 : b.h * 0.28 * i + b.h * 0.28 / 2;
        return (
          <group key={i}>
            <mesh position={[0, yOff, 0]}>
              <boxGeometry args={[b.w * ratio, b.h * 0.28, b.d * ratio]} />
              <meshLambertMaterial color={b.color} />
            </mesh>
            {/* Neon step edge */}
            <mesh position={[0, yOff + b.h * 0.14, b.d * ratio / 2 + 0.04]}>
              <boxGeometry args={[b.w * ratio + 0.1, 0.08, 0.07]} />
              <meshBasicMaterial color={b.neonColor} opacity={0.6} transparent />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[b.w + 0.1, 0.6, b.d + 0.1]} />
        <meshLambertMaterial color="#030308" />
      </mesh>
      {/* Top antenna */}
      <mesh position={[0, b.h * 0.84 + 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.06, 1.6, 5]} />
        <meshLambertMaterial color="#1a1a3e" />
      </mesh>
      <mesh position={[0, b.h * 0.84 + 1.7, 0]}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshBasicMaterial color={b.neonColor} />
      </mesh>
      <pointLight position={[0, b.h * 0.84 + 1.7, 0]} color={b.neonColor} intensity={0.5} distance={7} decay={2} />
      <mesh position={[0, b.h * 0.42, b.d * 0.36 + 0.04]}>
        <planeGeometry args={[b.w * 0.68, b.h * 0.55]} />
        <meshBasicMaterial map={frontTex} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 0.5, b.d / 2 + 0.5]} color={b.neonColor} intensity={0.3} distance={5} decay={2} />
    </group>
  );
}

// Render correct building type based on b.type
function BuildingVariant({ b }) {
  if (b.type === 'slim')    return <SlimTower       b={b} />;
  if (b.type === 'wide')    return <WideFlat         b={b} />;
  if (b.type === 'stepped') return <SteppedBuilding  b={b} />;
  return <Building b={b} />;
}

// Neon glowing tree
function NeonTree({ position, color = '#00fff7', scale = 1 }) {
  const canopyRef = useRef();
  const glowRef   = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (canopyRef.current) {
      canopyRef.current.rotation.y = t * 0.3;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.08 + Math.sin(t * 1.8 + position[2]) * 0.04;
    }
  });
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.07, 0.11, 1.4, 6]} />
        <meshLambertMaterial color="#0a0a1e" />
      </mesh>
      {/* Trunk neon strip */}
      <mesh position={[0, 0.7, 0.12]}>
        <boxGeometry args={[0.03, 1.3, 0.02]} />
        <meshBasicMaterial color={color} opacity={0.5} transparent />
      </mesh>
      {/* Bottom canopy layer */}
      <mesh position={[0, 1.7, 0]}>
        <coneGeometry args={[0.75, 1.1, 7]} />
        <meshLambertMaterial color="#050518" />
      </mesh>
      {/* Bottom canopy neon edge */}
      <mesh position={[0, 1.18, 0]}>
        <torusGeometry args={[0.72, 0.04, 5, 14]} />
        <meshBasicMaterial color={color} opacity={0.7} transparent />
      </mesh>
      {/* Mid canopy layer */}
      <mesh position={[0, 2.4, 0]}>
        <coneGeometry args={[0.55, 0.95, 7]} />
        <meshLambertMaterial color="#060618" />
      </mesh>
      {/* Mid canopy neon edge */}
      <mesh position={[0, 1.95, 0]}>
        <torusGeometry args={[0.52, 0.035, 5, 12]} />
        <meshBasicMaterial color={color} opacity={0.65} transparent />
      </mesh>
      {/* Top canopy */}
      <mesh ref={canopyRef} position={[0, 3.0, 0]}>
        <coneGeometry args={[0.35, 0.75, 6]} />
        <meshLambertMaterial color="#070720" />
      </mesh>
      {/* Top neon edge */}
      <mesh position={[0, 2.65, 0]}>
        <torusGeometry args={[0.33, 0.03, 5, 10]} />
        <meshBasicMaterial color={color} opacity={0.6} transparent />
      </mesh>
      {/* Tip glow orb */}
      <mesh position={[0, 3.42, 0]}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Outer glow sphere */}
      <mesh ref={glowRef} position={[0, 2.2, 0]}>
        <sphereGeometry args={[1.1, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      {/* Point light from canopy */}
      <pointLight position={[0, 2.2, 0]} color={color} intensity={0.6} distance={7} decay={2} />
    </group>
  );
}

// Animated neon dash texture
function makeDashTex() {
  const canvas = document.createElement('canvas');
  canvas.width = 16; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 16, 256);
  const grad = ctx.createLinearGradient(0, 0, 16, 0);
  grad.addColorStop(0,   'rgba(0,255,247,0.9)');
  grad.addColorStop(0.5, 'rgba(162,89,255,0.9)');
  grad.addColorStop(1,   'rgba(0,255,247,0.9)');
  ctx.fillStyle = grad;
  for (let i = 0; i < 8; i++) ctx.fillRect(0, i * 32, 16, 18);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 20);
  return tex;
}

// Dark grid sidewalk texture
function makeSidewalkTex() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0d0d1e';
  ctx.fillRect(0, 0, 64, 256);
  ctx.strokeStyle = '#1a1a3e';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * 32); ctx.lineTo(64, i * 32); ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(i * 16, 0); ctx.lineTo(i * 16, 256); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 10);
  return tex;
}

function TrackSegment() {
  const buildings = useMemo(() => {
    const palette = [
      { color: '#0d0d2e', neon: '#00fff7',  type: 'normal'  },
      { color: '#0a0a22', neon: '#a259ff',  type: 'slim'    },
      { color: '#0e0e30', neon: '#ff6d00',  type: 'wide'    },
      { color: '#0a0a22', neon: '#536dfe',  type: 'stepped' },
      { color: '#0d0d2e', neon: '#ea80fc',  type: 'slim'    },
      { color: '#0e0e30', neon: '#00fff7',  type: 'normal'  },
      { color: '#0a0a22', neon: '#ff6d00',  type: 'stepped' },
      { color: '#0d0d2e', neon: '#a259ff',  type: 'wide'    },
    ];
    return Array.from({ length: 8 }, (_, i) => {
      const h = 8 + (i % 6) * 3.2;
      const p = palette[i % palette.length];
      return {
        id: i, side: i % 2 === 0 ? -1 : 1,
        x: (i % 2 === 0 ? -1 : 1) * (11 + (i % 4) * 2.4),
        z: -TRACK_LENGTH / 2 + i * 8.5,
        w: 4.8 + (i % 3) * 0.9, h,
        d: 4.2 + (i % 3) * 0.7,
        color: p.color, neonColor: p.neon, type: p.type,
        winRows: Math.max(3, Math.floor(h / 2.0)),
        hasTower: i % 3 === 0,
      };
    });
  }, []);

  const dashTex     = useMemo(() => makeDashTex(),     []);
  const sidewalkTex = useMemo(() => makeSidewalkTex(), []);

  // Animated neon road glow texture
  const roadGlowRef = useRef();
  useFrame((state) => {
    if (roadGlowRef.current) {
      roadGlowRef.current.opacity = 0.06 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    }
  });

  return (
    <group>
      {/* ── Road — dark asphalt ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[LANE_WIDTH * 3, TRACK_LENGTH]} />
        <meshLambertMaterial color="#0a0a14" />
      </mesh>

      {/* Road neon underglow — animated */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[LANE_WIDTH * 3, TRACK_LENGTH]} />
        <meshBasicMaterial ref={roadGlowRef} color="#00fff7" transparent opacity={0.06} />
      </mesh>

      {/* Road edge neon strips */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-LANE_WIDTH * 1.48, 0.003, 0]}>
        <planeGeometry args={[0.06, TRACK_LENGTH]} />
        <meshBasicMaterial color="#00fff7" opacity={0.8} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[LANE_WIDTH * 1.48, 0.003, 0]}>
        <planeGeometry args={[0.06, TRACK_LENGTH]} />
        <meshBasicMaterial color="#00fff7" opacity={0.8} transparent />
      </mesh>

      {/* ── Sidewalks — dark grid ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-LANE_WIDTH * 1.85, 0.01, 0]}>
        <planeGeometry args={[2.4, TRACK_LENGTH]} />
        <meshBasicMaterial map={sidewalkTex} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[LANE_WIDTH * 1.85, 0.01, 0]}>
        <planeGeometry args={[2.4, TRACK_LENGTH]} />
        <meshBasicMaterial map={sidewalkTex} />
      </mesh>

      {/* ── Curbs — neon lit ── */}
      <mesh position={[-LANE_WIDTH * 1.5, 0.13, 0]}>
        <boxGeometry args={[0.18, 0.26, TRACK_LENGTH]} />
        <meshLambertMaterial color="#0d0d2e" />
      </mesh>
      <mesh position={[LANE_WIDTH * 1.5, 0.13, 0]}>
        <boxGeometry args={[0.18, 0.26, TRACK_LENGTH]} />
        <meshLambertMaterial color="#0d0d2e" />
      </mesh>
      {/* Curb neon top */}
      <mesh position={[-LANE_WIDTH * 1.5, 0.265, 0]}>
        <boxGeometry args={[0.18, 0.025, TRACK_LENGTH]} />
        <meshBasicMaterial color="#a259ff" opacity={0.7} transparent />
      </mesh>
      <mesh position={[LANE_WIDTH * 1.5, 0.265, 0]}>
        <boxGeometry args={[0.18, 0.025, TRACK_LENGTH]} />
        <meshBasicMaterial color="#a259ff" opacity={0.7} transparent />
      </mesh>

      {/* ── Lane dividers — neon purple ── */}
      {[-LANE_WIDTH / 2, LANE_WIDTH / 2].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 0]}>
          <planeGeometry args={[0.07, TRACK_LENGTH]} />
          <meshBasicMaterial color="#a259ff" opacity={0.35} transparent />
        </mesh>
      ))}

      {/* ── Center dashed line — cyan/purple gradient ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[0.1, TRACK_LENGTH]} />
        <meshBasicMaterial map={dashTex} transparent opacity={0.85} />
      </mesh>

      {/* ── Dark ground beyond sidewalk ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-LANE_WIDTH * 2.9, 0, 0]}>
        <planeGeometry args={[2.2, TRACK_LENGTH]} />
        <meshLambertMaterial color="#080812" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[LANE_WIDTH * 2.9, 0, 0]}>
        <planeGeometry args={[2.2, TRACK_LENGTH]} />
        <meshLambertMaterial color="#080812" />
      </mesh>

      {/* ── Neon street lights — cyan ── */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`sl${i}`} position={[-LANE_WIDTH * 1.65, 0, -TRACK_LENGTH / 2 + i * 26 + 6]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
            <meshLambertMaterial color="#0d0d2e" />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 3.8, 7]} />
            <meshLambertMaterial color="#1a1a3e" />
          </mesh>
          <mesh position={[0.5, 4.05, 0]} rotation={[0, 0, -0.15]}>
            <cylinderGeometry args={[0.025, 0.025, 1.05, 6]} />
            <meshLambertMaterial color="#1a1a3e" />
          </mesh>
          {/* Neon lamp housing */}
          <mesh position={[0.52, 3.82, 0]}>
            <boxGeometry args={[0.26, 0.12, 0.16]} />
            <meshLambertMaterial color="#0d0d2e" />
          </mesh>
          {/* Cyan bulb */}
          <mesh position={[0.52, 3.72, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#00fff7" />
          </mesh>
          {/* Neon pole strip */}
          <mesh position={[0, 2.1, 0.07]}>
            <boxGeometry args={[0.03, 3.6, 0.02]} />
            <meshBasicMaterial color="#00fff7" opacity={0.4} transparent />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <group key={`sr${i}`} position={[LANE_WIDTH * 1.65, 0, -TRACK_LENGTH / 2 + i * 26 + 19]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
            <meshLambertMaterial color="#0d0d2e" />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 3.8, 7]} />
            <meshLambertMaterial color="#1a1a3e" />
          </mesh>
          <mesh position={[-0.5, 4.05, 0]} rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.025, 0.025, 1.05, 6]} />
            <meshLambertMaterial color="#1a1a3e" />
          </mesh>
          <mesh position={[-0.52, 3.82, 0]}>
            <boxGeometry args={[0.26, 0.12, 0.16]} />
            <meshLambertMaterial color="#0d0d2e" />
          </mesh>
          {/* Purple bulb on right side */}
          <mesh position={[-0.52, 3.72, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#a259ff" />
          </mesh>
          <mesh position={[0, 2.1, 0.07]}>
            <boxGeometry args={[0.03, 3.6, 0.02]} />
            <meshBasicMaterial color="#a259ff" opacity={0.4} transparent />
          </mesh>
        </group>
      ))}

      {/* ── Neon barrier pillars at road edge ── */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`bp${i}`}>
          <mesh position={[-LANE_WIDTH * 1.5, 0.4, -TRACK_LENGTH / 2 + i * 17 + 4]}>
            <boxGeometry args={[0.12, 0.8, 0.12]} />
            <meshLambertMaterial color="#0d0d2e" />
          </mesh>
          <mesh position={[-LANE_WIDTH * 1.5, 0.82, -TRACK_LENGTH / 2 + i * 17 + 4]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshBasicMaterial color="#00fff7" />
          </mesh>
          <mesh position={[LANE_WIDTH * 1.5, 0.4, -TRACK_LENGTH / 2 + i * 17 + 12]}>
            <boxGeometry args={[0.12, 0.8, 0.12]} />
            <meshLambertMaterial color="#0d0d2e" />
          </mesh>
          <mesh position={[LANE_WIDTH * 1.5, 0.82, -TRACK_LENGTH / 2 + i * 17 + 12]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshBasicMaterial color="#a259ff" />
          </mesh>
        </group>
      ))}

      {/* ── Neon Trees — left side ── */}
      {[
        { z: -TRACK_LENGTH/2 + 5,  color: '#00fff7', s: 1.0 },
        { z: -TRACK_LENGTH/2 + 22, color: '#a259ff', s: 0.85 },
        { z: -TRACK_LENGTH/2 + 38, color: '#00fff7', s: 1.1 },
        { z: -TRACK_LENGTH/2 + 55, color: '#536dfe', s: 0.9 },
        { z: -TRACK_LENGTH/2 + 72, color: '#a259ff', s: 1.0 },
        { z: -TRACK_LENGTH/2 + 88, color: '#00fff7', s: 0.8 },
      ].map((t, i) => (
        <NeonTree key={`tl${i}`} position={[-LANE_WIDTH * 2.6, 0, t.z]} color={t.color} scale={t.s} />
      ))}

      {/* ── Neon Trees — right side ── */}
      {[
        { z: -TRACK_LENGTH/2 + 13, color: '#ff6d00', s: 0.9 },
        { z: -TRACK_LENGTH/2 + 30, color: '#00fff7', s: 1.05 },
        { z: -TRACK_LENGTH/2 + 46, color: '#ea80fc', s: 0.85 },
        { z: -TRACK_LENGTH/2 + 63, color: '#00fff7', s: 1.0 },
        { z: -TRACK_LENGTH/2 + 79, color: '#ff6d00', s: 0.9 },
        { z: -TRACK_LENGTH/2 + 95, color: '#a259ff', s: 1.1 },
      ].map((t, i) => (
        <NeonTree key={`tr${i}`} position={[LANE_WIDTH * 2.6, 0, t.z]} color={t.color} scale={t.s} />
      ))}

      {/* ── Buildings ── */}
      {buildings.map(b => <BuildingVariant key={b.id} b={b} />)}
    </group>
  );
}

export default function Track({ speed }) {
  const seg1 = useRef();
  const seg2 = useRef();

  useFrame(() => {
    if (!seg1.current || !seg2.current) return;
    const delta = speed * 0.18;
    seg1.current.position.z += delta;
    seg2.current.position.z += delta;
    if (seg1.current.position.z > TRACK_LENGTH)  seg1.current.position.z -= TRACK_LENGTH * 2;
    if (seg2.current.position.z > TRACK_LENGTH)  seg2.current.position.z -= TRACK_LENGTH * 2;
  });

  return (
    <>
      <group ref={seg1} position={[0, 0, 0]}><TrackSegment /></group>
      <group ref={seg2} position={[0, 0, -TRACK_LENGTH]}><TrackSegment /></group>
    </>
  );
}
