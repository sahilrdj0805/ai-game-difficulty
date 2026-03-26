import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const LANE_POSITIONS = [-2.5, 0, 2.5];
const toZ = (y) => -30 + (y + 300) * (32 / 900);

// Single shared useFrame drives ALL coins — no per-coin useFrame overhead
export default function Coins({ coins }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const base = child.userData.baseY ?? 0.78;
      const offset = child.userData.offset ?? 0;
      child.rotation.y += 0.06;
      child.position.y = base + Math.sin(t * 2.4 + offset) * 0.1;
    });
  });

  return (
    <group ref={groupRef}>
      {coins.map((coin) => {
        const x = LANE_POSITIONS[coin.x];
        const z = toZ(coin.y);
        const color = coin.type === 'diamond' ? '#ea80fc' : coin.type === 'golden' ? '#ffd740' : '#ffca28';
        const emissive = coin.type === 'diamond' ? '#aa00ff' : coin.type === 'golden' ? '#ff6f00' : '#f57f17';
        const size = coin.type === 'diamond' ? 0.28 : coin.type === 'golden' ? 0.30 : 0.26;
        return (
          <group
            key={coin.id}
            position={[x, 0.78, z]}
            userData={{ baseY: 0.78, offset: z * 0.5 }}
          >
            {/* Main coin body */}
            <mesh scale={[1, 1, 0.35]}>
              <sphereGeometry args={[size, 12, 8]} />
              <meshLambertMaterial color={color} emissive={emissive} emissiveIntensity={0.7} />
            </mesh>
            {/* Rim */}
            <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.35]}>
              <torusGeometry args={[size, size * 0.18, 5, 16]} />
              <meshLambertMaterial color={emissive} emissiveIntensity={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
