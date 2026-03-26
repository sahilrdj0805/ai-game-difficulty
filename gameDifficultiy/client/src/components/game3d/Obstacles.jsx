import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const LANE_POSITIONS = [-2.5, 0, 2.5];
const toZ = (y) => -30 + (y + 300) * (32 / 900);

/* ── BARRIER ── */
function Barrier({ position }) {
  const lightRef = useRef();
  useFrame((state) => {
    if (lightRef.current) {
      const flash = Math.sin(state.clock.elapsedTime * 8) > 0;
      lightRef.current.material.color.set(flash ? '#ff1744' : '#ff8a80');
      lightRef.current.material.emissive.set(flash ? '#ff1744' : '#880000');
    }
  });

  return (
    <group position={position}>
      {/* Base plate */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[2.1, 0.13, 0.6]} />
        <meshLambertMaterial color="#0d0d2e" emissive="#1a1a3e" emissiveIntensity={0.3} />
      </mesh>
      {/* Base bolts */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.13, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.04, 6]} />
          <meshBasicMaterial color="#00fff7" />
        </mesh>
      ))}
      {/* Left leg */}
      <mesh position={[-0.75, 0.32, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshLambertMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.6} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.75, 0.32, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshLambertMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.6} />
      </mesh>
      {/* Main bar */}
      <mesh position={[0, 0.56, 0]}>
        <boxGeometry args={[2.0, 0.24, 0.24]} />
        <meshLambertMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.5} />
      </mesh>
      {/* Neon diagonal stripes */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.56, 0.13]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.07, 0.3, 0.01]} />
          <meshBasicMaterial color="#00fff7" opacity={0.9} transparent />
        </mesh>
      ))}
      {/* Top bar */}
      <mesh position={[0, 0.82, 0]}>
        <boxGeometry args={[2.0, 0.13, 0.13]} />
        <meshLambertMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.4} />
      </mesh>
      {/* Neon end caps */}
      {[-1.02, 1.02].map((x, i) => (
        <mesh key={i} position={[x, 0.56, 0]}>
          <boxGeometry args={[0.07, 0.58, 0.22]} />
          <meshBasicMaterial color="#00fff7" opacity={0.6} transparent />
        </mesh>
      ))}
      {/* Flashing warning light */}
      <mesh ref={lightRef} position={[0, 1.06, 0]}>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshLambertMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={1.8} />
      </mesh>
      {/* Glow halo */}
      <mesh position={[0, 1.06, 0]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshBasicMaterial color="#ff1744" opacity={0.2} transparent />
      </mesh>
      {/* Side warning panels */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x, 0.56, 0.13]}>
          <boxGeometry args={[0.18, 0.22, 0.01]} />
          <meshBasicMaterial color={i === 0 ? '#00fff7' : '#ff1744'} opacity={0.8} transparent />
        </mesh>
      ))}
    </group>
  );
}


/* ── TRAIN ── */
function TrainCar({ position, tilt = 0 }) {
  const lightRef1 = useRef();
  const lightRef2 = useRef();

  useFrame((state) => {
    const flicker = 0.88 + Math.sin(state.clock.elapsedTime * 14) * 0.12;
    if (lightRef1.current) lightRef1.current.material.opacity = flicker;
    if (lightRef2.current) lightRef2.current.material.opacity = flicker;
  });

  return (
    <group position={position} rotation={[tilt, 0, 0]}>
      {/* Undercarriage */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[2.1, 0.22, 3.2]} />
        <meshLambertMaterial color="#1a1a2e" />
      </mesh>
      {/* Wheels — static */}
      {[[-0.95, -0.9], [0.95, -0.9], [-0.95, 0.9], [0.95, 0.9]].map(([x, z], i) => (
        <group key={i} position={[x, 0.22, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.15, 10]} />
            <meshLambertMaterial color="#1c1c1c" />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.22, 0.04, 5, 10]} />
            <meshLambertMaterial color="#111" />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? 0.09 : -0.09, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.02, 7]} />
            <meshBasicMaterial color="#78909c" />
          </mesh>
        </group>
      ))}
      {/* Lower body */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[2.02, 0.48, 3.05]} />
        <meshLambertMaterial color="#0d2137" />
      </mesh>
      {/* Upper body */}
      <mesh position={[0, 1.08, 0]}>
        <boxGeometry args={[1.98, 0.82, 2.98]} />
        <meshLambertMaterial color="#0d0d2e" emissive="#a259ff" emissiveIntensity={0.15} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[1.96, 0.16, 2.96]} />
        <meshLambertMaterial color="#050510" />
      </mesh>
      {/* Roof raised center */}
      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[1.1, 0.12, 2.5]} />
        <meshLambertMaterial color="#0d0d2e" />
      </mesh>
      {/* Neon accent stripes */}
      {[-1.0, 1.0].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.76, 0]}><boxGeometry args={[0.03, 0.07, 2.98]} /><meshBasicMaterial color="#00fff7" /></mesh>
          <mesh position={[x, 0.42, 0]}><boxGeometry args={[0.03, 0.05, 2.98]} /><meshBasicMaterial color="#a259ff" opacity={0.6} transparent /></mesh>
          {[-0.8, 0, 0.8].map((z, j) => (
            <mesh key={j} position={[x, 1.0, z]}><boxGeometry args={[0.02, 0.88, 0.02]} /><meshBasicMaterial color="#050510" /></mesh>
          ))}
        </group>
      ))}
      {/* Front nose */}
      <mesh position={[0, 0.68, 1.5]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[1.98, 1.05, 0.1]} />
        <meshLambertMaterial color="#1976d2" emissive="#1565c0" emissiveIntensity={0.3} />
      </mesh>
      {/* Yellow hazard stripe */}
      <mesh position={[0, 0.14, 1.5]}>
        <boxGeometry args={[1.98, 0.1, 0.06]} />
        <meshBasicMaterial color="#ffeb3b" />
      </mesh>
      {/* Hazard diagonals */}
      {[-0.65, -0.2, 0.25, 0.7].map((x, i) => (
        <mesh key={i} position={[x, 0.14, 1.52]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.05, 0.12, 0.02]} />
          <meshBasicMaterial color="#212121" />
        </mesh>
      ))}
      {/* Windshield panes */}
      {[-0.46, 0.46].map((x, i) => (
        <mesh key={i} position={[x, 1.06, 1.5]}>
          <boxGeometry args={[0.7, 0.4, 0.03]} />
          <meshBasicMaterial color="#b3e5fc" opacity={0.88} transparent />
        </mesh>
      ))}
      <mesh position={[0, 1.06, 1.505]}><boxGeometry args={[0.05, 0.42, 0.02]} /><meshLambertMaterial color="#0a2744" /></mesh>
      {/* Headlights */}
      <mesh ref={lightRef1} position={[-0.68, 0.46, 1.52]}>
        <boxGeometry args={[0.3, 0.14, 0.03]} />
        <meshBasicMaterial color="#fffde7" opacity={0.95} transparent />
      </mesh>
      <mesh ref={lightRef2} position={[0.68, 0.46, 1.52]}>
        <boxGeometry args={[0.3, 0.14, 0.03]} />
        <meshBasicMaterial color="#fffde7" opacity={0.95} transparent />
      </mesh>
      {[-0.68, 0.68].map((x, i) => (
        <mesh key={i} position={[x, 0.46, 1.51]}><boxGeometry args={[0.36, 0.22, 0.04]} /><meshLambertMaterial color="#0a2744" /></mesh>
      ))}
      {[-0.68, 0.68].map((x, i) => (
        <mesh key={i} position={[x, 0.36, 1.52]}><boxGeometry args={[0.3, 0.04, 0.02]} /><meshBasicMaterial color="#e3f2fd" opacity={0.85} transparent /></mesh>
      ))}
      {[-0.88, 0.88].map((x, i) => (
        <mesh key={i} position={[x, 0.54, 1.52]}><boxGeometry args={[0.09, 0.09, 0.02]} /><meshBasicMaterial color="#ff1744" /></mesh>
      ))}
      {/* Pantograph — static */}
      <mesh position={[0, 1.66, 0.4]}><boxGeometry args={[0.45, 0.05, 0.16]} /><meshLambertMaterial color="#37474f" /></mesh>
      <mesh position={[0, 1.88, 0.4]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.05, 0.34, 0.03]} /><meshLambertMaterial color="#546e7a" /></mesh>
      <mesh position={[0, 2.06, 0.46]}><boxGeometry args={[0.03, 0.05, 0.22]} /><meshBasicMaterial color="#90a4ae" /></mesh>
      {/* Roof vents */}
      {[-0.7, 0, 0.7].map((z, i) => (
        <mesh key={i} position={[0, 1.66, z]}><boxGeometry args={[0.2, 0.07, 0.12]} /><meshLambertMaterial color="#263238" /></mesh>
      ))}
      {/* Front coupling */}
      <mesh position={[0, 0.3, 1.6]}><boxGeometry args={[0.24, 0.16, 0.12]} /><meshLambertMaterial color="#37474f" /></mesh>
      {/* Number plate */}
      <mesh position={[0, 1.38, 1.51]}>
        <boxGeometry args={[0.5, 0.14, 0.02]} />
        <meshBasicMaterial color="#0d47a1" />
      </mesh>
      {/* Side number decals */}
      {[-1.0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 1.3, 0]}>
          <boxGeometry args={[0.02, 0.22, 0.7]} />
          <meshBasicMaterial color="#e3f2fd" opacity={0.35} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ── CONE ── */
function Cone({ position }) {
  const coneRef = useRef();
  useFrame((state) => {
    if (coneRef.current)
      coneRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.06;
  });

  return (
    <group position={position} ref={coneRef}>
      {/* Base plate */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.08, 10]} />
        <meshLambertMaterial color="#e0e0e0" />
      </mesh>
      {/* Base rim */}
      <mesh position={[0, 0.09, 0]}>
        <torusGeometry args={[0.44, 0.03, 5, 12]} />
        <meshBasicMaterial color="#bdbdbd" />
      </mesh>
      {/* Main cone — neon orange */}
      <mesh position={[0, 0.54, 0]}>
        <coneGeometry args={[0.35, 1.02, 10]} />
        <meshLambertMaterial color="#ff6d00" emissive="#ff6d00" emissiveIntensity={0.7} />
      </mesh>
      {/* Neon cyan band 1 */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.11, 10]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>
      {/* Neon cyan band 2 */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.09, 10]} />
        <meshBasicMaterial color="#00fff7" />
      </mesh>
      {/* Glow strip on band */}
      <mesh position={[0, 0.28, 0.31]}>
        <boxGeometry args={[0.08, 0.09, 0.01]} />
        <meshBasicMaterial color="#00fff7" opacity={0.9} transparent />
      </mesh>
      {/* Tip glow */}
      <mesh position={[0, 1.06, 0]}>
        <sphereGeometry args={[0.06, 7, 7]} />
        <meshBasicMaterial color="#ff6d00" />
      </mesh>
    </group>
  );
}

/* ── TRUCK ── */
function Truck({ position, tilt = 0 }) {
  return (
    <group position={position} rotation={[tilt, 0, 0]}>
      {/* Chassis */}
      <mesh position={[0, 0.18, 0]}><boxGeometry args={[2.02, 0.2, 4.1]} /><meshLambertMaterial color="#0d0d0d" /></mesh>
      {[-0.68, 0.68].map((x, i) => (
        <mesh key={i} position={[x, 0.22, 0]}><boxGeometry args={[0.1, 0.12, 4.0]} /><meshLambertMaterial color="#1a1a1a" /></mesh>
      ))}
      {/* Wheels — static */}
      {[[-0.9, 1.4], [0.9, 1.4], [-0.9, 0.2], [0.9, 0.2], [-0.9, -1.0], [0.9, -1.0]].map(([x, z], i) => (
        <group key={i} position={[x, 0.3, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.3, 0.18, 12]} /><meshLambertMaterial color="#1a1a1a" /></mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.3, 0.06, 5, 12]} /><meshLambertMaterial color="#111" /></mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? 0.1 : -0.1, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.03, 7]} /><meshBasicMaterial color="#b0bec5" /></mesh>
        </group>
      ))}
      {/* Cargo box — dark with neon */}
      <mesh position={[0, 1.0, -0.5]}><boxGeometry args={[1.92, 1.58, 2.75]} /><meshLambertMaterial color="#0d0d2e" emissive="#a259ff" emissiveIntensity={0.1} /></mesh>
      <mesh position={[0, 1.8, -0.5]}><boxGeometry args={[1.92, 0.1, 2.75]} /><meshLambertMaterial color="#050510" /></mesh>
      {/* Neon cargo ribs */}
      {[-0.75, -0.1, 0.55].map((z, i) => (
        <group key={i}>
          <mesh position={[-0.97, 1.0, z]}><boxGeometry args={[0.02, 1.55, 0.06]} /><meshBasicMaterial color="#a259ff" opacity={0.5} transparent /></mesh>
          <mesh position={[0.97, 1.0, z]}><boxGeometry args={[0.02, 1.55, 0.06]} /><meshBasicMaterial color="#a259ff" opacity={0.5} transparent /></mesh>
        </group>
      ))}
      {/* Neon company stripe */}
      <mesh position={[0, 1.0, -1.9]}><boxGeometry args={[1.92, 0.26, 0.02]} /><meshBasicMaterial color="#00fff7" opacity={0.7} transparent /></mesh>
      {/* Rear doors */}
      {[-0.46, 0.46].map((x, i) => (
        <mesh key={i} position={[x, 1.0, -1.9]}><boxGeometry args={[0.9, 1.52, 0.025]} /><meshLambertMaterial color="#b71c1c" /></mesh>
      ))}
      <mesh position={[0, 1.0, -1.91]}><boxGeometry args={[0.04, 1.52, 0.01]} /><meshBasicMaterial color="#7f0000" /></mesh>
      {/* Rear lights */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.52, -1.92]}><boxGeometry args={[0.2, 0.16, 0.02]} /><meshBasicMaterial color="#ff1744" /></mesh>
      ))}
      {/* Rear bumper */}
      <mesh position={[0, 0.3, -1.92]}><boxGeometry args={[1.98, 0.13, 0.1]} /><meshLambertMaterial color="#9e9e9e" /></mesh>
      {/* Cab */}
      <mesh position={[0, 0.94, 1.35]}><boxGeometry args={[1.92, 1.28, 1.08]} /><meshLambertMaterial color="#0d0d2e" emissive="#a259ff" emissiveIntensity={0.15} /></mesh>
      <mesh position={[0, 1.6, 1.35]}><boxGeometry args={[1.92, 0.12, 1.08]} /><meshLambertMaterial color="#050510" /></mesh>
      {/* Roof visor */}
      <mesh position={[0, 1.62, 1.92]}><boxGeometry args={[1.92, 0.06, 0.2]} /><meshLambertMaterial color="#050510" /></mesh>
      {/* Cab-cargo join */}
      <mesh position={[0, 1.0, 0.8]}><boxGeometry args={[1.88, 1.28, 0.07]} /><meshLambertMaterial color="#1a1a3e" /></mesh>
      {/* Windshield */}
      {[-0.44, 0.44].map((x, i) => (
        <mesh key={i} position={[x, 1.06, 1.92]}><boxGeometry args={[0.72, 0.48, 0.03]} /><meshBasicMaterial color="#b3e5fc" opacity={0.85} transparent /></mesh>
      ))}
      <mesh position={[0, 1.06, 1.925]}><boxGeometry args={[0.05, 0.5, 0.02]} /><meshLambertMaterial color="#4a0000" /></mesh>
      {/* Side windows */}
      {[-0.98, 0.98].map((x, i) => (
        <mesh key={i} position={[x, 1.08, 1.48]}><boxGeometry args={[0.025, 0.36, 0.52]} /><meshBasicMaterial color="#b3e5fc" opacity={0.78} transparent /></mesh>
      ))}
      {/* Headlights */}
      {[-0.62, 0.62].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.62, 1.94]}><boxGeometry args={[0.36, 0.18, 0.03]} /><meshBasicMaterial color="#fffde7" /></mesh>
          <mesh position={[x, 0.62, 1.93]}><boxGeometry args={[0.42, 0.24, 0.04]} /><meshLambertMaterial color="#1a0000" /></mesh>
          <mesh position={[x, 0.5, 1.94]}><boxGeometry args={[0.36, 0.04, 0.02]} /><meshBasicMaterial color="#e3f2fd" opacity={0.88} transparent /></mesh>
        </group>
      ))}
      {/* Fog lights */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.38, 1.94]}><cylinderGeometry args={[0.06, 0.06, 0.03, 7]} /><meshBasicMaterial color="#fff9c4" /></mesh>
      ))}
      {/* Chrome bumper */}
      <mesh position={[0, 0.28, 1.94]}><boxGeometry args={[1.92, 0.18, 0.13]} /><meshLambertMaterial color="#b0bec5" emissive="#78909c" emissiveIntensity={0.25} /></mesh>
      <mesh position={[0, 0.32, 1.955]}><boxGeometry args={[1.88, 0.05, 0.02]} /><meshBasicMaterial color="#eceff1" /></mesh>
      {/* Grille */}
      <mesh position={[0, 0.5, 1.94]}><boxGeometry args={[1.45, 0.2, 0.04]} /><meshLambertMaterial color="#1a0000" /></mesh>
      {[-0.52, -0.17, 0.17, 0.52].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 1.955]}><boxGeometry args={[0.05, 0.18, 0.02]} /><meshBasicMaterial color="#37474f" /></mesh>
      ))}
      {/* Exhaust stacks — static */}
      {[-0.85, 0.85].map((x, i) => (
        <group key={i} position={[x, 0, 0.55]}>
          <mesh><cylinderGeometry args={[0.05, 0.06, 1.75, 7]} /><meshLambertMaterial color="#546e7a" /></mesh>
          <mesh position={[0, 0.92, 0]}><cylinderGeometry args={[0.065, 0.05, 0.1, 7]} /><meshBasicMaterial color="#b0bec5" /></mesh>
        </group>
      ))}
      {/* Side mirrors */}
      {[-1.04, 1.04].map((x, i) => (
        <group key={i} position={[x, 1.28, 1.68]}>
          <mesh position={[x > 0 ? 0.07 : -0.07, 0, 0]}><boxGeometry args={[0.14, 0.09, 0.06]} /><meshLambertMaterial color="#880000" /></mesh>
          <mesh position={[x > 0 ? 0.15 : -0.15, 0, 0]}><boxGeometry args={[0.03, 0.09, 0.07]} /><meshBasicMaterial color="#b3e5fc" opacity={0.7} transparent /></mesh>
        </group>
      ))}
      {/* Mud flaps */}
      {[-0.85, 0.85].map((x, i) => (
        <mesh key={i} position={[x, 0.26, -1.05]}><boxGeometry args={[0.12, 0.35, 0.04]} /><meshLambertMaterial color="#212121" /></mesh>
      ))}
      {/* Fuel tank */}
      <mesh position={[-0.86, 0.42, 0.48]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.18, 0.18, 0.5, 9]} /><meshLambertMaterial color="#37474f" /></mesh>
    </group>
  );
}

export default function Obstacles({ obstacles, speed = 1 }) {
  return (
    <group>
      {obstacles.map((obs) => {
        const x = LANE_POSITIONS[obs.x];
        const z = toZ(obs.y);
        const pos = [x, 0, z];
        // At high speed tilt obstacles slightly toward player for rush feel
        const tilt = Math.min(0.18, (speed - 1) * 0.045);
        if (obs.type === 'cone')  return <Cone     key={obs.id} position={pos} />;
        if (obs.type === 'train') return <TrainCar key={obs.id} position={pos} tilt={tilt} />;
        if (obs.type === 'truck') return <Truck    key={obs.id} position={pos} tilt={tilt} />;
        return                           <Barrier  key={obs.id} position={pos} />;
      })}
    </group>
  );
}
