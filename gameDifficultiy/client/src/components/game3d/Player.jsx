import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const LANE_POSITIONS = [-2.5, 0, 2.5];

export default function Player({ lane, jumpHeight, isJumping, isInvulnerable, shieldActive, isPlaying, isPaused }) {
  const groupRef     = useRef();
  const bodyRef      = useRef();
  const headRef      = useRef();
  const leftArmRef   = useRef();
  const rightArmRef  = useRef();
  const leftLegRef   = useRef();
  const rightLegRef  = useRef();
  const leftForeRef  = useRef();
  const rightForeRef = useRef();
  const shieldRef    = useRef();
  const shadowRef    = useRef();
  const dustRef      = useRef();

  const targetX    = useRef(LANE_POSITIONS[lane]);
  const currentX   = useRef(LANE_POSITIONS[lane]);
  const leanAngle  = useRef(0);
  const runCycle   = useRef(0);
  const wasJumping = useRef(false);
  const dustTimer  = useRef(0);

  const labelTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 128);
    ctx.font = 'bold 88px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ff6f00';
    ctx.shadowBlur = 28;
    ctx.fillStyle = '#ff8f00';
    ctx.fillText('MODIJI', 256, 64);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeText('MODIJI', 256, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const { camera } = useThree();

  useEffect(() => { targetX.current = LANE_POSITIONS[lane]; }, [lane]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth lane transition
    currentX.current += (targetX.current - currentX.current) * 0.18;
    groupRef.current.position.x = currentX.current;
    groupRef.current.position.y = jumpHeight * 0.018;

    // Body lean on lane switch
    const movingDir = targetX.current - currentX.current;
    leanAngle.current += (movingDir * 0.5 - leanAngle.current) * 0.12;
    groupRef.current.rotation.z = -leanAngle.current * 0.3;

    // Landing dust
    if (wasJumping.current && !isJumping && jumpHeight <= 0) dustTimer.current = 0.4;
    wasJumping.current = isJumping;
    if (dustTimer.current > 0) {
      dustTimer.current -= delta;
      if (dustRef.current) {
        dustRef.current.visible = true;
        const s = (dustTimer.current / 0.4) * 1.6;
        dustRef.current.scale.set(s, s, s);
        dustRef.current.material.opacity = (dustTimer.current / 0.4) * 0.45;
      }
    } else if (dustRef.current) dustRef.current.visible = false;

    // Dynamic shadow
    if (shadowRef.current) {
      const h = jumpHeight * 0.018;
      const s = Math.max(0.25, 1 - h * 0.15);
      shadowRef.current.scale.set(s, s, s);
      shadowRef.current.material.opacity = s * 0.3;
    }

    // Camera follows player X subtly
    camera.position.x += (currentX.current * 0.25 - camera.position.x) * 0.05;

    if (!isPlaying || isPaused) return;

    runCycle.current += delta * 10;
    const t     = runCycle.current;
    const swing = Math.sin(t) * 0.65;
    const bob   = Math.abs(Math.sin(t)) * 0.05;
    const sway  = Math.sin(t * 0.5) * 0.025;

    if (bodyRef.current) {
      bodyRef.current.position.y = 0.76 + bob;
      bodyRef.current.rotation.x = 0.1;
      bodyRef.current.rotation.z = sway;
    }
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 0.5) * 0.06;
      headRef.current.rotation.z = -sway * 0.4;
    }

    if (isJumping) {
      if (leftLegRef.current)   leftLegRef.current.rotation.x   =  0.7;
      if (rightLegRef.current)  rightLegRef.current.rotation.x  =  0.5;
      if (leftArmRef.current)   leftArmRef.current.rotation.x   = -1.0;
      if (rightArmRef.current)  rightArmRef.current.rotation.x  = -1.0;
      if (leftForeRef.current)  leftForeRef.current.rotation.x  = -0.4;
      if (rightForeRef.current) rightForeRef.current.rotation.x = -0.4;
      if (bodyRef.current)      bodyRef.current.rotation.x      = -0.1;
    } else {
      if (leftArmRef.current)   leftArmRef.current.rotation.x   =  swing * 0.75;
      if (rightArmRef.current)  rightArmRef.current.rotation.x  = -swing * 0.75;
      if (leftForeRef.current)  leftForeRef.current.rotation.x  =  Math.max(0, swing) * 0.5;
      if (rightForeRef.current) rightForeRef.current.rotation.x =  Math.max(0, -swing) * 0.5;
      if (leftLegRef.current)   leftLegRef.current.rotation.x   =  swing;
      if (rightLegRef.current)  rightLegRef.current.rotation.x  = -swing;
    }

    if (shieldRef.current) {
      shieldRef.current.rotation.y += delta * 1.5;
      shieldRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.05);
    }
  });

  const skin        = isInvulnerable ? '#00fff7' : '#d4956a';
  const jacket      = isInvulnerable ? '#00fff7' : '#f5f5f5';
  const jacketDark  = isInvulnerable ? '#00b8d4' : '#e0e0e0';
  const pants       = isInvulnerable ? '#00b8d4' : '#f5f5f5';
  const pantsDark   = isInvulnerable ? '#007c91' : '#e0e0e0';
  const shoeCol     = isInvulnerable ? '#00fff7' : '#ff6f00';  // bright orange — contrasts dark road
  const sole        = isInvulnerable ? '#00b8d4' : '#e65100';  // deep orange sole
  const hairCol     = isInvulnerable ? '#00fff7' : '#f0f0f0';
  const beardCol    = isInvulnerable ? '#00fff7' : '#f0f0f0';
  const emissive    = isInvulnerable ? '#00fff7' : shieldActive ? '#00e5ff' : '#ff9800';
  const emInt       = isInvulnerable ? 0.8 : shieldActive ? 0.6 : 0.1;

  return (
    // rotation.y = Math.PI → character faces AWAY from camera = forward direction
    <group ref={groupRef} position={[LANE_POSITIONS[lane], 0, 2]} rotation={[0, Math.PI, 0]}>

      {/* ── MODIJI label — memoized texture, no per-frame allocation ── */}
      <mesh position={[0, 1.35, -0.85]}>
        <planeGeometry args={[2.2, 0.55]} />
        <meshBasicMaterial map={labelTex} transparent depthWrite={false} />
      </mesh>

      {/* Shadow */}
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.52, 18]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent depthWrite={false} />
      </mesh>

      {/* Landing dust */}
      <mesh ref={dustRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} visible={false}>
        <ringGeometry args={[0.35, 0.75, 20]} />
        <meshBasicMaterial color="#d7ccc8" opacity={0.45} transparent depthWrite={false} />
      </mesh>

      {/* ── LEFT LEG ── */}
      <group ref={leftLegRef} position={[-0.15, 0.44, 0]}>
        {/* Thigh */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.21, 0.36, 0.21]} />
          <meshLambertMaterial color={pants} emissive={emissive} emissiveIntensity={emInt} />
        </mesh>
        {/* Knee pad */}
        <mesh position={[0, -0.08, 0.11]}>
          <boxGeometry args={[0.16, 0.1, 0.04]} />
          <meshLambertMaterial color={pantsDark} />
        </mesh>
        {/* Shin */}
        <mesh position={[0, -0.26, 0]}>
          <boxGeometry args={[0.19, 0.3, 0.19]} />
          <meshLambertMaterial color={pants} emissive={emissive} emissiveIntensity={emInt} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.5, 0.05]}>
          <boxGeometry args={[0.23, 0.13, 0.35]} />
          <meshLambertMaterial color={shoeCol} />
        </mesh>
        {/* Sole */}
        <mesh position={[0, -0.575, 0.05]}>
          <boxGeometry args={[0.25, 0.055, 0.37]} />
          <meshLambertMaterial color={sole} />
        </mesh>
        {/* Toe */}
        <mesh position={[0, -0.51, 0.22]}>
          <boxGeometry args={[0.21, 0.09, 0.06]} />
          <meshLambertMaterial color="#424242" />
        </mesh>
        {/* Shoe lace stripe */}
        <mesh position={[0, -0.47, 0.12]}>
          <boxGeometry args={[0.2, 0.02, 0.18]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* ── RIGHT LEG ── */}
      <group ref={rightLegRef} position={[0.15, 0.44, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.21, 0.36, 0.21]} />
          <meshLambertMaterial color={pants} emissive={emissive} emissiveIntensity={emInt} />
        </mesh>
        <mesh position={[0, -0.08, 0.11]}>
          <boxGeometry args={[0.16, 0.1, 0.04]} />
          <meshLambertMaterial color={pantsDark} />
        </mesh>
        <mesh position={[0, -0.26, 0]}>
          <boxGeometry args={[0.19, 0.3, 0.19]} />
          <meshLambertMaterial color={pants} emissive={emissive} emissiveIntensity={emInt} />
        </mesh>
        <mesh position={[0, -0.5, 0.05]}>
          <boxGeometry args={[0.23, 0.13, 0.35]} />
          <meshLambertMaterial color={shoeCol} />
        </mesh>
        <mesh position={[0, -0.575, 0.05]}>
          <boxGeometry args={[0.25, 0.055, 0.37]} />
          <meshLambertMaterial color={sole} />
        </mesh>
        <mesh position={[0, -0.51, 0.22]}>
          <boxGeometry args={[0.21, 0.09, 0.06]} />
          <meshLambertMaterial color="#424242" />
        </mesh>
        <mesh position={[0, -0.47, 0.12]}>
          <boxGeometry args={[0.2, 0.02, 0.18]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* ── TORSO ── */}
      <group ref={bodyRef} position={[0, 0.76, 0]}>

        {/* Kurta/Sherwani body */}
        <mesh>
          <boxGeometry args={[0.58, 0.65, 0.32]} />
          <meshLambertMaterial color={jacket} emissive={emissive} emissiveIntensity={emInt} />
        </mesh>
        {/* Kurta side seams */}
        <mesh position={[-0.29, 0, 0]}>
          <boxGeometry args={[0.02, 0.65, 0.32]} />
          <meshLambertMaterial color={jacketDark} />
        </mesh>
        <mesh position={[0.29, 0, 0]}>
          <boxGeometry args={[0.02, 0.65, 0.32]} />
          <meshLambertMaterial color={jacketDark} />
        </mesh>
        {/* Kurta center button line */}
        <mesh position={[0, 0, 0.162]}>
          <boxGeometry args={[0.025, 0.6, 0.01]} />
          <meshBasicMaterial color="#bdbdbd" />
        </mesh>
        {/* Mandarin collar */}
        <mesh position={[0, 0.35, 0.04]}>
          <boxGeometry args={[0.38, 0.12, 0.22]} />
          <meshLambertMaterial color={jacket} />
        </mesh>
        {/* Collar border */}
        <mesh position={[0, 0.35, 0.155]}>
          <boxGeometry args={[0.36, 0.1, 0.01]} />
          <meshBasicMaterial color="#bdbdbd" />
        </mesh>
        {/* Nehru jacket over kurta */}
        <mesh position={[0, 0.05, 0.163]}>
          <boxGeometry args={[0.5, 0.5, 0.01]} />
          <meshLambertMaterial color="#eeeeee" />
        </mesh>

        {/* ── LEFT ARM ── */}
        <group ref={leftArmRef} position={[-0.37, 0.1, 0]}>
          <mesh>
            <boxGeometry args={[0.19, 0.32, 0.19]} />
            <meshLambertMaterial color={jacket} emissive={emissive} emissiveIntensity={emInt} />
          </mesh>
          <group ref={leftForeRef} position={[0, -0.27, 0]}>
            <mesh>
              <boxGeometry args={[0.17, 0.27, 0.17]} />
              <meshLambertMaterial color={skin} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.19, 0.02]}>
              <boxGeometry args={[0.15, 0.13, 0.15]} />
              <meshLambertMaterial color={skin} />
            </mesh>
          </group>
        </group>

        {/* ── RIGHT ARM ── */}
        <group ref={rightArmRef} position={[0.37, 0.1, 0]}>
          <mesh>
            <boxGeometry args={[0.19, 0.32, 0.19]} />
            <meshLambertMaterial color={jacket} emissive={emissive} emissiveIntensity={emInt} />
          </mesh>
          <group ref={rightForeRef} position={[0, -0.27, 0]}>
            <mesh>
              <boxGeometry args={[0.17, 0.27, 0.17]} />
              <meshLambertMaterial color={skin} />
            </mesh>
            <mesh position={[0, -0.19, 0.02]}>
              <boxGeometry args={[0.15, 0.13, 0.15]} />
              <meshLambertMaterial color={skin} />
            </mesh>
          </group>
        </group>

        {/* ── HEAD ── */}
        <group ref={headRef} position={[0, 0.58, 0]}>
          {/* Neck */}
          <mesh position={[0, -0.26, 0]}>
            <boxGeometry args={[0.18, 0.1, 0.18]} />
            <meshLambertMaterial color={skin} />
          </mesh>
          {/* Head */}
          <mesh>
            <boxGeometry args={[0.42, 0.44, 0.38]} />
            <meshLambertMaterial color={skin} emissive={emissive} emissiveIntensity={emInt} />
          </mesh>
          {/* White hair top */}
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[0.44, 0.14, 0.4]} />
            <meshLambertMaterial color={hairCol} />
          </mesh>
          {/* Hair back */}
          <mesh position={[0, 0.12, -0.2]}>
            <boxGeometry args={[0.42, 0.3, 0.04]} />
            <meshLambertMaterial color={hairCol} />
          </mesh>
          {/* Hair sides */}
          <mesh position={[-0.22, 0.1, 0]}>
            <boxGeometry args={[0.04, 0.26, 0.36]} />
            <meshLambertMaterial color={hairCol} />
          </mesh>
          <mesh position={[0.22, 0.1, 0]}>
            <boxGeometry args={[0.04, 0.26, 0.36]} />
            <meshLambertMaterial color={hairCol} />
          </mesh>
          {/* Hair fringe front */}
          <mesh position={[0, 0.2, 0.2]}>
            <boxGeometry args={[0.38, 0.1, 0.04]} />
            <meshLambertMaterial color={hairCol} />
          </mesh>
          {/* Eyebrows */}
          <mesh position={[-0.11, 0.1, 0.2]}>
            <boxGeometry args={[0.11, 0.025, 0.01]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          <mesh position={[0.11, 0.1, 0.2]}>
            <boxGeometry args={[0.11, 0.025, 0.01]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          {/* Eye whites */}
          <mesh position={[-0.11, 0.04, 0.2]}>
            <boxGeometry args={[0.1, 0.07, 0.01]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.11, 0.04, 0.2]}>
            <boxGeometry args={[0.1, 0.07, 0.01]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Pupils */}
          <mesh position={[-0.11, 0.04, 0.205]}>
            <boxGeometry args={[0.05, 0.05, 0.01]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          <mesh position={[0.11, 0.04, 0.205]}>
            <boxGeometry args={[0.05, 0.05, 0.01]} />
            <meshBasicMaterial color="#111111" />
          </mesh>
          {/* Prominent Modi nose — wider bridge */}
          <mesh position={[0, 0.0, 0.215]}>
            <boxGeometry args={[0.09, 0.06, 0.04]} />
            <meshLambertMaterial color={skin} />
          </mesh>
          <mesh position={[0, -0.04, 0.225]}>
            <boxGeometry args={[0.1, 0.07, 0.06]} />
            <meshLambertMaterial color={skin} />
          </mesh>
          {/* Nose tip bulb */}
          <mesh position={[0, -0.07, 0.235]}>
            <boxGeometry args={[0.08, 0.04, 0.04]} />
            <meshLambertMaterial color={skin} />
          </mesh>
          {/* Cheek fullness */}
          <mesh position={[-0.18, -0.02, 0.17]}>
            <boxGeometry args={[0.06, 0.1, 0.06]} />
            <meshLambertMaterial color={skin} />
          </mesh>
          <mesh position={[0.18, -0.02, 0.17]}>
            <boxGeometry args={[0.06, 0.1, 0.06]} />
            <meshLambertMaterial color={skin} />
          </mesh>
          {/* Thick white Modi moustache */}
          <mesh position={[-0.06, -0.065, 0.205]}>
            <boxGeometry args={[0.1, 0.055, 0.025]} />
            <meshLambertMaterial color={beardCol} />
          </mesh>
          <mesh position={[0.06, -0.065, 0.205]}>
            <boxGeometry args={[0.1, 0.055, 0.025]} />
            <meshLambertMaterial color={beardCol} />
          </mesh>
          {/* Moustache center dip */}
          <mesh position={[0, -0.055, 0.205]}>
            <boxGeometry args={[0.04, 0.03, 0.025]} />
            <meshLambertMaterial color={skin} />
          </mesh>
          {/* Full white beard */}
          <mesh position={[0, -0.13, 0.185]}>
            <boxGeometry args={[0.36, 0.08, 0.05]} />
            <meshLambertMaterial color={beardCol} />
          </mesh>
          <mesh position={[0, -0.19, 0.175]}>
            <boxGeometry args={[0.32, 0.08, 0.07]} />
            <meshLambertMaterial color={beardCol} />
          </mesh>
          {/* Beard chin taper */}
          <mesh position={[0, -0.24, 0.155]}>
            <boxGeometry args={[0.22, 0.07, 0.08]} />
            <meshLambertMaterial color={beardCol} />
          </mesh>
          {/* Beard side volume */}
          <mesh position={[-0.17, -0.17, 0.13]}>
            <boxGeometry args={[0.05, 0.14, 0.08]} />
            <meshLambertMaterial color={beardCol} />
          </mesh>
          <mesh position={[0.17, -0.17, 0.13]}>
            <boxGeometry args={[0.05, 0.14, 0.08]} />
            <meshLambertMaterial color={beardCol} />
          </mesh>
          {/* Ears */}
          <mesh position={[-0.22, 0.02, 0]}>
            <boxGeometry args={[0.04, 0.09, 0.09]} />
            <meshLambertMaterial color={skin} />
          </mesh>
          <mesh position={[0.22, 0.02, 0]}>
            <boxGeometry args={[0.04, 0.09, 0.09]} />
            <meshLambertMaterial color={skin} />
          </mesh>
          {/* Modi topi — wider, more realistic Gandhi cap */}
          <mesh position={[0, 0.265, 0.04]}>
            <boxGeometry args={[0.48, 0.1, 0.44]} />
            <meshLambertMaterial color="#fafafa" />
          </mesh>
          {/* Topi front curved brim */}
          <mesh position={[0, 0.255, 0.26]}>
            <boxGeometry args={[0.44, 0.06, 0.06]} />
            <meshLambertMaterial color="#eeeeee" />
          </mesh>
          {/* Topi back brim */}
          <mesh position={[0, 0.255, -0.24]}>
            <boxGeometry args={[0.44, 0.06, 0.06]} />
            <meshLambertMaterial color="#eeeeee" />
          </mesh>
          {/* Topi center crease line */}
          <mesh position={[0, 0.32, 0.04]}>
            <boxGeometry args={[0.02, 0.02, 0.42]} />
            <meshBasicMaterial color="#cccccc" />
          </mesh>
        </group>
      </group>

      {/* ── SHIELD ── */}
      {shieldActive && (
        <group ref={shieldRef}>
          <mesh>
            <sphereGeometry args={[1.15, 16, 16]} />
            <meshBasicMaterial color="#00fff7" opacity={0.07} transparent side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.15, 0.025, 6, 28]} />
            <meshBasicMaterial color="#00fff7" opacity={0.6} transparent />
          </mesh>
          <mesh rotation={[0.5, 0, 0]}>
            <torusGeometry args={[1.15, 0.015, 6, 28]} />
            <meshBasicMaterial color="#a259ff" opacity={0.4} transparent />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.18, 10, 10]} />
            <meshBasicMaterial color="#00fff7" opacity={0.03} transparent wireframe />
          </mesh>
        </group>
      )}

      {/* ── INVULNERABLE ── */}
      {isInvulnerable && !shieldActive && (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
            <ringGeometry args={[0.55, 0.72, 32]} />
            <meshBasicMaterial color="#00fff7" opacity={0.75} transparent />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
            <ringGeometry args={[0.82, 0.92, 32]} />
            <meshBasicMaterial color="#a259ff" opacity={0.35} transparent />
          </mesh>
        </group>
      )}
    </group>
  );
}
