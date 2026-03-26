import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Animated moon with craters
function Moon() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.015;
      ref.current.scale.setScalar(pulse);
    }
  });
  return (
    <group ref={ref} position={[-8, 20, -50]}>
      {/* Main moon */}
      <mesh>
        <sphereGeometry args={[3.5, 16, 16]} />
        <meshBasicMaterial color="#dde1f0" />
      </mesh>
      {/* Crater 1 */}
      <mesh position={[1.2, 0.8, 3.3]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial color="#c5cae9" />
      </mesh>
      {/* Crater 2 */}
      <mesh position={[-1.0, -1.2, 3.2]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshBasicMaterial color="#c5cae9" />
      </mesh>
      {/* Crater 3 */}
      <mesh position={[0.3, 1.8, 3.1]}>
        <sphereGeometry args={[0.22, 6, 6]} />
        <meshBasicMaterial color="#c5cae9" />
      </mesh>
      {/* Inner glow halo */}
      <mesh>
        <sphereGeometry args={[4.5, 10, 10]} />
        <meshBasicMaterial color="#7986cb" opacity={0.08} transparent />
      </mesh>
      {/* Outer glow halo */}
      <mesh>
        <sphereGeometry args={[6.5, 10, 10]} />
        <meshBasicMaterial color="#5c6bc0" opacity={0.04} transparent />
      </mesh>
      {/* Moon light point */}
      <pointLight color="#c5cae9" intensity={1.5} distance={120} decay={1.5} />
    </group>
  );
}

// Twinkling stars — two layers for depth
function Stars() {
  const ref1 = useRef();
  const ref2 = useRef();

  const layer1 = useMemo(() => {
    const count = 220;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 240;
      pos[i * 3 + 1] = 18 + Math.random() * 45;
      pos[i * 3 + 2] = -25 - Math.random() * 65;
    }
    return pos;
  }, []);

  const layer2 = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 180;
      pos[i * 3 + 1] = 30 + Math.random() * 30;
      pos[i * 3 + 2] = -50 - Math.random() * 40;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref1.current) ref1.current.material.opacity = 0.55 + Math.sin(t * 1.1) * 0.2;
    if (ref2.current) ref2.current.material.opacity = 0.4  + Math.sin(t * 0.7 + 1.5) * 0.15;
    // Slowly rotate star field for parallax feel
    if (ref1.current) ref1.current.rotation.y = t * 0.003;
    if (ref2.current) ref2.current.rotation.y = t * 0.005;
  });

  return (
    <>
      <points ref={ref1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layer1, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#e8eaf6" size={0.28} transparent opacity={0.65} sizeAttenuation />
      </points>
      <points ref={ref2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layer2, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#b3e5fc" size={0.18} transparent opacity={0.45} sizeAttenuation />
      </points>
    </>
  );
}

// Aurora borealis effect
function Aurora() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.06 + Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
      ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.15) * 8;
    }
  });
  return (
    <mesh ref={ref} position={[0, 38, -72]} rotation={[0.15, 0, 0]}>
      <planeGeometry args={[160, 22]} />
      <meshBasicMaterial
        color="#00fff7"
        transparent
        opacity={0.07}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Distant neon cyberpunk skyline — 3 depth layers
function CitySkyline() {
  // Back layer — tallest, most faded
  const backBuildings = useMemo(() => [
    { x: -55, w: 6,  h: 30, c: '#080820', neon: '#536dfe' },
    { x: -44, w: 5,  h: 38, c: '#080820', neon: '#a259ff' },
    { x: -34, w: 8,  h: 22, c: '#080820', neon: '#00fff7' },
    { x: -22, w: 5,  h: 34, c: '#080820', neon: '#ea80fc' },
    { x: -10, w: 7,  h: 42, c: '#080820', neon: '#a259ff' },
    { x:   2, w: 5,  h: 28, c: '#080820', neon: '#00fff7' },
    { x:  13, w: 8,  h: 36, c: '#080820', neon: '#536dfe' },
    { x:  24, w: 5,  h: 26, c: '#080820', neon: '#ff6d00' },
    { x:  35, w: 7,  h: 32, c: '#080820', neon: '#ea80fc' },
    { x:  46, w: 5,  h: 24, c: '#080820', neon: '#a259ff' },
    { x:  56, w: 6,  h: 29, c: '#080820', neon: '#00fff7' },
  ], []);

  // Mid layer
  const midBuildings = useMemo(() => [
    { x: -48, w: 5,  h: 20, c: '#0a0a28', neon: '#00fff7' },
    { x: -38, w: 4,  h: 28, c: '#0a0a28', neon: '#ea80fc' },
    { x: -28, w: 6,  h: 16, c: '#0a0a28', neon: '#ff6d00' },
    { x: -17, w: 4,  h: 24, c: '#0a0a28', neon: '#536dfe' },
    { x:  -6, w: 5,  h: 32, c: '#0a0a28', neon: '#a259ff' },
    { x:   5, w: 4,  h: 20, c: '#0a0a28', neon: '#00fff7' },
    { x:  15, w: 6,  h: 18, c: '#0a0a28', neon: '#ea80fc' },
    { x:  26, w: 4,  h: 26, c: '#0a0a28', neon: '#ff6d00' },
    { x:  37, w: 5,  h: 19, c: '#0a0a28', neon: '#536dfe' },
    { x:  47, w: 4,  h: 23, c: '#0a0a28', neon: '#a259ff' },
  ], []);

  // Front layer — closest, most visible
  const frontBuildings = useMemo(() => [
    { x: -42, w: 5,  h: 14, c: '#0d0d2e', neon: '#a259ff' },
    { x: -32, w: 4,  h: 20, c: '#0d0d2e', neon: '#00fff7' },
    { x: -22, w: 6,  h: 12, c: '#0d0d2e', neon: '#ff6d00' },
    { x: -12, w: 4,  h: 18, c: '#0d0d2e', neon: '#536dfe' },
    { x:  -2, w: 5,  h: 24, c: '#0d0d2e', neon: '#ea80fc' },
    { x:   8, w: 4,  h: 16, c: '#0d0d2e', neon: '#00fff7' },
    { x:  18, w: 6,  h: 13, c: '#0d0d2e', neon: '#a259ff' },
    { x:  28, w: 4,  h: 21, c: '#0d0d2e', neon: '#ff6d00' },
    { x:  38, w: 5,  h: 15, c: '#0d0d2e', neon: '#536dfe' },
  ], []);

  const renderLayer = (buildings, z, opacity, neonOpacity, winOpacity) =>
    buildings.map((b, i) => (
      <group key={i} position={[b.x, b.h / 2 - 2, z]}>
        <mesh>
          <boxGeometry args={[b.w, b.h, 0.6]} />
          <meshBasicMaterial color={b.c} opacity={opacity} transparent />
        </mesh>
        {/* Neon roof */}
        <mesh position={[0, b.h / 2 + 0.1, 0.35]}>
          <boxGeometry args={[b.w + 0.1, 0.15, 0.1]} />
          <meshBasicMaterial color={b.neon} opacity={neonOpacity} transparent />
        </mesh>
        {/* Neon left edge */}
        <mesh position={[-b.w / 2, 0, 0.35]}>
          <boxGeometry args={[0.07, b.h * 0.65, 0.08]} />
          <meshBasicMaterial color={b.neon} opacity={neonOpacity * 0.5} transparent />
        </mesh>
        {/* Window glow */}
        <mesh position={[0, 0, 0.4]}>
          <planeGeometry args={[b.w - 0.4, b.h - 0.8]} />
          <meshBasicMaterial color={b.neon} opacity={winOpacity} transparent />
        </mesh>
        {/* Antenna on tall buildings */}
        {b.h > 25 && (
          <group position={[0, b.h / 2, 0]}>
            <mesh position={[0, 1.0, 0]}>
              <cylinderGeometry args={[0.04, 0.06, 2.0, 5]} />
              <meshBasicMaterial color="#37474f" />
            </mesh>
            <mesh position={[0, 2.1, 0]}>
              <sphereGeometry args={[0.1, 6, 6]} />
              <meshBasicMaterial color={b.neon} />
            </mesh>
          </group>
        )}
      </group>
    ));

  return (
    <group>
      <group position={[0, 0, -85]}>{renderLayer(backBuildings,  0, 0.75, 0.6, 0.025)}</group>
      <group position={[0, 0, -76]}>{renderLayer(midBuildings,   0, 0.85, 0.8, 0.04)}</group>
      <group position={[0, 0, -68]}>{renderLayer(frontBuildings, 0, 0.92, 1.0, 0.06)}</group>
    </group>
  );
}

// Floating neon orbs
function NeonOrbs() {
  const orbs = useMemo(() => [
    { pos: [-50, 20, -55], color: '#a259ff', r: 1.4 },
    { pos: [  45, 24, -60], color: '#00fff7', r: 1.0 },
    { pos: [ -22, 32, -65], color: '#ff6d00', r: 0.8 },
    { pos: [  28, 16, -50], color: '#536dfe', r: 1.1 },
    { pos: [  -8, 28, -72], color: '#ea80fc', r: 0.7 },
  ], []);

  const refs = useRef(orbs.map(() => React.createRef()));

  useFrame((state) => {
    refs.current.forEach((r, i) => {
      if (r.current) {
        r.current.position.y = orbs[i].pos[1] + Math.sin(state.clock.elapsedTime * 0.45 + i * 1.4) * 2.0;
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.9 + i) * 0.18;
        r.current.scale.setScalar(pulse);
      }
    });
  });

  return (
    <>
      {orbs.map((o, i) => (
        <group key={i} ref={refs.current[i]} position={o.pos}>
          <mesh>
            <sphereGeometry args={[o.r, 8, 8]} />
            <meshBasicMaterial color={o.color} opacity={0.18} transparent />
          </mesh>
          <mesh>
            <sphereGeometry args={[o.r * 2.2, 8, 8]} />
            <meshBasicMaterial color={o.color} opacity={0.05} transparent />
          </mesh>
          <pointLight color={o.color} intensity={0.6} distance={18} decay={2} />
        </group>
      ))}
    </>
  );
}

export default function Environment() {
  return (
    <>
      {/* Dark night fog — start further so sky is visible */}
      <fog attach="fog" args={['#05051a', 45, 100]} />

      {/* Dark ambient */}
      <ambientLight intensity={0.4} color="#1a1a4e" />

      {/* Moonlight */}
      <directionalLight position={[-15, 30, 10]} intensity={0.7} color="#c5cae9" />

      {/* Cyan neon road fill */}
      <pointLight position={[0, 2, 5]}   intensity={1.4} color="#00fff7" distance={32} decay={2} />
      <pointLight position={[0, 2, -15]} intensity={0.9} color="#00fff7" distance={28} decay={2} />

      {/* Purple fill */}
      <pointLight position={[0, 5, -5]}  intensity={0.9} color="#a259ff" distance={28} decay={2} />

      {/* Orange accent */}
      <pointLight position={[10, 3, 0]}  intensity={0.5} color="#ff6d00" distance={22} decay={2} />

      {/* Hemisphere */}
      <hemisphereLight skyColor="#0d0d2e" groundColor="#050510" intensity={0.55} />

      <Moon />
      <Stars />
      <Aurora />
      <CitySkyline />
      <NeonOrbs />

      {/* Night sky backdrop — deep blue, not black */}
      <mesh position={[0, 30, -72]}>
        <planeGeometry args={[280, 120]} />
        <meshBasicMaterial color="#080828" side={THREE.DoubleSide} />
      </mesh>
      {/* Sky horizon glow — slightly lighter at bottom */}
      <mesh position={[0, 8, -70]}>
        <planeGeometry args={[280, 20]} />
        <meshBasicMaterial color="#0d0d3a" side={THREE.DoubleSide} />
      </mesh>

      {/* Far ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, -35]}>
        <planeGeometry args={[120, 180]} />
        <meshBasicMaterial color="#06060f" />
      </mesh>
    </>
  );
}
