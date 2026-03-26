import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const LANE_POSITIONS = [-2.5, 0, 2.5];
const toZ = (y) => -30 + (y + 300) * (32 / 900);

/* ── SHIELD ── cyan force-field orb with hexagonal shield face ── */
function ShieldPowerUp({ position }) {
  const groupRef  = useRef();
  const outerRef  = useRef();
  const ring1Ref  = useRef();
  const ring2Ref  = useRef();
  const ring3Ref  = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + 1.1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.14;
    groupRef.current.rotation.y += delta * 0.8;
    if (outerRef.current) {
      const p = 1 + Math.sin(state.clock.elapsedTime * 3.5) * 0.14;
      outerRef.current.scale.setScalar(p);
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 2.2;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 1.8;
    if (ring3Ref.current) ring3Ref.current.rotation.y += delta * 3.0;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Outer pulse glow */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.62, 10, 10]} />
        <meshBasicMaterial color="#00e5ff" opacity={0.10} transparent />
      </mesh>
      {/* Mid glow */}
      <mesh>
        <sphereGeometry args={[0.50, 10, 10]} />
        <meshBasicMaterial color="#00b0ff" opacity={0.14} transparent />
      </mesh>
      {/* Core orb */}
      <mesh>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshLambertMaterial color="#0091ea" emissive="#00b0ff" emissiveIntensity={1.4} />
      </mesh>
      {/* Inner bright core */}
      <mesh>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshBasicMaterial color="#e1f5fe" opacity={0.95} transparent />
      </mesh>
      {/* Shield face — hexagon */}
      <mesh position={[0, 0, 0.33]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 6]} />
        <meshBasicMaterial color="#ffffff" opacity={0.92} transparent />
      </mesh>
      {/* Shield inner detail */}
      <mesh position={[0, 0, 0.36]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.13, 0.13, 0.02, 6]} />
        <meshBasicMaterial color="#00e5ff" opacity={0.8} transparent />
      </mesh>
      {/* Vertical line on shield */}
      <mesh position={[0, 0, 0.37]}>
        <boxGeometry args={[0.03, 0.18, 0.01]} />
        <meshBasicMaterial color="#00e5ff" />
      </mesh>
      {/* Spinning rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.50, 0.025, 6, 28]} />
        <meshBasicMaterial color="#00e5ff" opacity={0.85} transparent />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.50, 0.018, 5, 24]} />
        <meshBasicMaterial color="#80d8ff" opacity={0.55} transparent />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[0.44, 0.012, 4, 20]} />
        <meshBasicMaterial color="#e1f5fe" opacity={0.45} transparent />
      </mesh>
      {/* Floating label */}
      <Text position={[0, 0.72, 0]} fontSize={0.18} color="#00e5ff"
        outlineWidth={0.012} outlineColor="#003344" anchorX="center" anchorY="middle">
        SHIELD
      </Text>
    </group>
  );
}

/* ── MULTIPLIER ── gold star coin with ×2 label ── */
function MultiplierPowerUp({ position }) {
  const groupRef = useRef();
  const outerRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + 1.1 + Math.sin(state.clock.elapsedTime * 2.8) * 0.13;
    groupRef.current.rotation.y += delta * 2.2;
    if (outerRef.current) {
      const p = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.16;
      outerRef.current.scale.setScalar(p);
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 3.0;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 2.2;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Outer glow */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.60, 9, 9]} />
        <meshBasicMaterial color="#ffd740" opacity={0.12} transparent />
      </mesh>
      {/* Mid glow */}
      <mesh>
        <sphereGeometry args={[0.46, 9, 9]} />
        <meshBasicMaterial color="#ffab00" opacity={0.16} transparent />
      </mesh>

      {/* Main coin body — oblate */}
      <mesh scale={[1, 1, 0.38]}>
        <sphereGeometry args={[0.34, 18, 14]} />
        <meshLambertMaterial color="#ffd740" emissive="#ff8f00" emissiveIntensity={1.0} />
      </mesh>
      {/* Inner darker layer */}
      <mesh scale={[0.82, 0.82, 0.32]}>
        <sphereGeometry args={[0.34, 14, 10]} />
        <meshLambertMaterial color="#ff8f00" emissive="#e65100" emissiveIntensity={0.6} />
      </mesh>
      {/* Rim torus */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.38]}>
        <torusGeometry args={[0.34, 0.055, 7, 22]} />
        <meshLambertMaterial color="#ff6d00" emissive="#bf360c" emissiveIntensity={0.5} />
      </mesh>
      {/* Front face */}
      <mesh position={[0, 0, 0.14]} scale={[0.65, 0.65, 1]}>
        <circleGeometry args={[0.34, 16]} />
        <meshBasicMaterial color="#fff9c4" opacity={0.92} transparent />
      </mesh>
      {/* ×2 text on face */}
      <Text position={[0, 0, 0.16]} fontSize={0.22} color="#ff6d00"
        outlineWidth={0.015} outlineColor="#7f3000" anchorX="center" anchorY="middle"
        fontWeight="bold">
        ×2
      </Text>
      {/* Shimmer streak */}
      <mesh position={[0.07, 0.08, 0.14]} scale={[0.18, 0.44, 1]}>
        <circleGeometry args={[0.28, 7]} />
        <meshBasicMaterial color="#ffffff" opacity={0.45} transparent />
      </mesh>

      {/* Spinning star rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.50, 0.022, 5, 5]} />
        <meshBasicMaterial color="#ffd740" opacity={0.80} transparent />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.44, 0.015, 4, 4]} />
        <meshBasicMaterial color="#ffecb3" opacity={0.55} transparent />
      </mesh>

      {/* Floating label */}
      <Text position={[0, 0.72, 0]} fontSize={0.18} color="#ffd740"
        outlineWidth={0.012} outlineColor="#3e2000" anchorX="center" anchorY="middle">
        ×2 BONUS
      </Text>
    </group>
  );
}

/* ── INVINCIBLE ── rainbow star burst with lightning arcs ── */
function InvinciblePowerUp({ position }) {
  const groupRef  = useRef();
  const outerRef  = useRef();
  const starRef   = useRef();
  const arc1Ref   = useRef();
  const arc2Ref   = useRef();
  const arc3Ref   = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + 1.1 + Math.sin(state.clock.elapsedTime * 2.4 + 2) * 0.14;
    if (outerRef.current) {
      const p = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.20;
      outerRef.current.scale.setScalar(p);
    }
    if (starRef.current) {
      starRef.current.rotation.y += delta * 3.5;
      starRef.current.rotation.z += delta * 1.5;
    }
    if (arc1Ref.current) arc1Ref.current.rotation.z += delta * 4.0;
    if (arc2Ref.current) arc2Ref.current.rotation.x += delta * 3.2;
    if (arc3Ref.current) arc3Ref.current.rotation.y += delta * 2.6;
    // Rainbow color cycle on outer glow
    if (outerRef.current) {
      const hue = (state.clock.elapsedTime * 60) % 360;
      const r = Math.sin(hue * Math.PI / 180) * 0.5 + 0.5;
      const g = Math.sin((hue + 120) * Math.PI / 180) * 0.5 + 0.5;
      const b = Math.sin((hue + 240) * Math.PI / 180) * 0.5 + 0.5;
      outerRef.current.material.color.setRGB(r, g, b);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Rainbow outer pulse */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.65, 9, 9]} />
        <meshBasicMaterial color="#ff69b4" opacity={0.14} transparent />
      </mesh>
      {/* Pink mid glow */}
      <mesh>
        <sphereGeometry args={[0.50, 9, 9]} />
        <meshBasicMaterial color="#f06292" opacity={0.16} transparent />
      </mesh>

      {/* Star body — icosahedron for spiky look */}
      <group ref={starRef}>
        <mesh>
          <icosahedronGeometry args={[0.32, 0]} />
          <meshLambertMaterial color="#ff4081" emissive="#e91e63" emissiveIntensity={1.2} />
        </mesh>
        {/* Inner bright core */}
        <mesh>
          <icosahedronGeometry args={[0.20, 0]} />
          <meshBasicMaterial color="#fce4ec" opacity={0.92} transparent />
        </mesh>
        {/* Tiny center spark */}
        <mesh>
          <sphereGeometry args={[0.10, 8, 8]} />
          <meshBasicMaterial color="#ffffff" opacity={0.98} transparent />
        </mesh>
      </group>

      {/* Lightning arc rings */}
      <mesh ref={arc1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.025, 5, 5]} />
        <meshBasicMaterial color="#ff80ab" opacity={0.85} transparent />
      </mesh>
      <mesh ref={arc2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.46, 0.018, 4, 4]} />
        <meshBasicMaterial color="#f48fb1" opacity={0.65} transparent />
      </mesh>
      <mesh ref={arc3Ref} rotation={[0, Math.PI / 5, 0]}>
        <torusGeometry args={[0.40, 0.013, 3, 3]} />
        <meshBasicMaterial color="#fce4ec" opacity={0.50} transparent />
      </mesh>

      {/* Floating label */}
      <Text position={[0, 0.76, 0]} fontSize={0.17} color="#ff80ab"
        outlineWidth={0.012} outlineColor="#4a0020" anchorX="center" anchorY="middle">
        INVINCIBLE
      </Text>
    </group>
  );
}

export default function PowerUps({ powerUps }) {
  return (
    <group>
      {powerUps.map((pu) => {
        const pos = [LANE_POSITIONS[pu.x], 0, toZ(pu.y)];
        if (pu.type === 'shield')     return <ShieldPowerUp     key={pu.id} position={pos} />;
        if (pu.type === 'multiplier') return <MultiplierPowerUp key={pu.id} position={pos} />;
        if (pu.type === 'invincible') return <InvinciblePowerUp key={pu.id} position={pos} />;
        return null;
      })}
    </group>
  );
}
