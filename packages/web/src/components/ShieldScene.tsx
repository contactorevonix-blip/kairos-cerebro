"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────────────
   Shield path — shared between outer shell and inner recessed panel
   ───────────────────────────────────────────────────────────────────── */
function makeShieldShape(scale = 1): THREE.Shape {
  const s = new THREE.Shape();
  const k = scale;
  s.moveTo(0, 2.4 * k);
  s.bezierCurveTo( 1.2*k, 2.4*k,  2.0*k, 1.8*k,  2.0*k, 1.0*k);
  s.bezierCurveTo( 2.0*k, 0.2*k,  1.4*k,-0.6*k,  0.8*k,-1.4*k);
  s.bezierCurveTo( 0.3*k,-2.2*k,  0,    -2.6*k,  0,    -2.6*k);
  s.bezierCurveTo( 0,    -2.6*k, -0.3*k,-2.2*k, -0.8*k,-1.4*k);
  s.bezierCurveTo(-1.4*k,-0.6*k, -2.0*k, 0.2*k, -2.0*k, 1.0*k);
  s.bezierCurveTo(-2.0*k, 1.8*k, -1.2*k, 2.4*k,  0,     2.4*k);
  return s;
}

const OUTER_EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 0.6,
  bevelEnabled: true,
  bevelThickness: 0.15,
  bevelSize: 0.10,
  bevelSegments: 20,
  curveSegments: 48,
};

const INNER_EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 0.07,
  bevelEnabled: false,
  curveSegments: 32,
};

/* ─────────────────────────────────────────────────────────────────────
   KAIROS mark — K letter inside a ring, centred on the shield face
   ───────────────────────────────────────────────────────────────────── */
function KairosMark() {
  const ref = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(t * 2.0) * 0.022);
    }
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t * 1.4) * 0.25;
    }
  });

  return (
    <group ref={ref} position={[0, -0.12, 0.72]}>
      {/* Soft halo — wide low-opacity disc */}
      <mesh>
        <circleGeometry args={[0.88, 64]} />
        <meshBasicMaterial
          color="#2563eb"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh>
        <torusGeometry args={[0.68, 0.09, 16, 64]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Solid inner ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.68, 0.024, 16, 64]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.7} />
      </mesh>

      {/* K — vertical stem */}
      <mesh position={[-0.20, 0, 0.01]}>
        <boxGeometry args={[0.10, 0.82, 0.06]} />
        <meshBasicMaterial color="#93c5fd" />
      </mesh>
      {/* K — upper diagonal arm */}
      <mesh position={[0.11, 0.24, 0.01]} rotation={[0, 0, -0.48]}>
        <boxGeometry args={[0.10, 0.50, 0.06]} />
        <meshBasicMaterial color="#93c5fd" />
      </mesh>
      {/* K — lower diagonal arm */}
      <mesh position={[0.11, -0.24, 0.01]} rotation={[0, 0, 0.48]}>
        <boxGeometry args={[0.10, 0.50, 0.06]} />
        <meshBasicMaterial color="#93c5fd" />
      </mesh>

      {/* Centre junction glow */}
      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[0.07, 24]} />
        <meshBasicMaterial
          color="#93c5fd"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Shield mesh — outer shell + inner panel + scan line + emblem
   ───────────────────────────────────────────────────────────────────── */
function ShieldBody({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef  = useRef<THREE.Group>(null!);
  const scanRef   = useRef<THREE.Mesh>(null!);
  const scanY     = useRef(-2.8);
  const rot       = useRef({ x: 0, y: 0 });

  /* shapes */
  const outerShape = useMemo(() => makeShieldShape(1),    []);
  const innerShape = useMemo(() => makeShieldShape(0.80), []);

  /* materials */
  const outerMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:               new THREE.Color("#061428"),
    metalness:           1.0,
    roughness:           0.04,
    clearcoat:           1.0,
    clearcoatRoughness:  0.02,
    reflectivity:        1.0,
    emissive:            new THREE.Color("#0d2f6e"),
    emissiveIntensity:   0.6,
    envMapIntensity:     2.0,
  }), []);

  const innerMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:              new THREE.Color("#0a1e50"),
    metalness:          0.85,
    roughness:          0.12,
    clearcoat:          0.7,
    emissive:           new THREE.Color("#1a4090"),
    emissiveIntensity:  0.45,
    envMapIntensity:    1.2,
  }), []);

  const auraMat = useMemo(() => new THREE.MeshBasicMaterial({
    color:       new THREE.Color("#1d4ed8"),
    transparent: true,
    opacity:     0.06,
    side:        THREE.BackSide,
    blending:    THREE.AdditiveBlending,
    depthWrite:  false,
  }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    /* smooth spring-like mouse follow */
    rot.current.x += (mouseY * 0.40 - rot.current.x) * 0.06;
    rot.current.y += (mouseX * 0.60 - rot.current.y) * 0.06;

    if (groupRef.current) {
      groupRef.current.rotation.x = rot.current.x;
      groupRef.current.rotation.y = rot.current.y;
      groupRef.current.position.y = Math.sin(t * 0.65) * 0.11;
    }

    /* emissive breathing */
    outerMat.emissiveIntensity = 0.50 + Math.sin(t * 1.3)  * 0.18;
    innerMat.emissiveIntensity = 0.35 + Math.sin(t * 1.3 + 1.0) * 0.14;

    /* scan line sweep — bottom to top, wrap */
    if (scanRef.current) {
      scanY.current += 0.024;
      if (scanY.current > 2.9) scanY.current = -2.9;
      scanRef.current.position.y = scanY.current;
      const progress = (scanY.current + 2.9) / 5.8;
      const fade = Math.sin(progress * Math.PI);
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity = fade * 0.22;
    }
  });

  return (
    <group ref={groupRef}>
      {/* ── Outer aura glow (backface, slightly scaled up) ── */}
      <mesh scale={[1.14, 1.14, 1.04]} material={auraMat}>
        <extrudeGeometry args={[outerShape, OUTER_EXTRUDE]} />
      </mesh>

      {/* ── Main shield shell ── */}
      <mesh material={outerMat} castShadow receiveShadow>
        <extrudeGeometry args={[outerShape, OUTER_EXTRUDE]} />
      </mesh>

      {/* ── Inner recessed panel ── */}
      <mesh position={[0, 0, 0.50]} material={innerMat}>
        <extrudeGeometry args={[innerShape, INNER_EXTRUDE]} />
      </mesh>

      {/* ── Scan line ── */}
      <mesh ref={scanRef} position={[0, 0, 0.75]}>
        <planeGeometry args={[4.8, 0.20]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Rim highlight line — top arc ── */}
      <mesh position={[0, 1.65, 0.62]}>
        <torusGeometry args={[1.12, 0.011, 8, 80, Math.PI]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.55} />
      </mesh>

      {/* ── K emblem ── */}
      <KairosMark />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Orbital ring with rotating dots
   ───────────────────────────────────────────────────────────────────── */
function OrbitalRing({
  radius, speed, tilt, color, dotCount = 2,
}: {
  radius: number; speed: number; tilt: number; color: string; dotCount?: number;
}) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * speed;
  });

  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22 }), [color]);
  const dotMat  = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }), [color]);

  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={ringMat}>
          <torusGeometry args={[radius, 0.011, 8, 100]} />
        </mesh>
        {Array.from({ length: dotCount }).map((_, i) => {
          const a = (i / dotCount) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}
              material={dotMat}
            >
              <sphereGeometry args={[0.048, 14, 14]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Floating particles
   ───────────────────────────────────────────────────────────────────── */
function Particles({ count = 130 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(Math.random() * 2 - 1);
      const r     = 3.5 + Math.random() * 2.8;
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.024} color="#3b82f6" transparent opacity={0.60} sizeAttenuation />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Scene lights — pulsing key light + orbiting rim light
   ───────────────────────────────────────────────────────────────────── */
function Lights() {
  const keyRef = useRef<THREE.PointLight>(null!);
  const rimRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (keyRef.current) {
      keyRef.current.intensity = 2.8 + Math.sin(t * 1.1) * 0.6;
    }
    if (rimRef.current) {
      rimRef.current.position.x = Math.sin(t * 0.38) * 4;
      rimRef.current.position.z = Math.cos(t * 0.38) * 3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.10} />
      {/* Key light — blue-white from upper-right */}
      <pointLight ref={keyRef} position={[4, 5, 4]} intensity={3.0} color="#7ec8ff" />
      {/* Rim light — orbits the shield */}
      <pointLight ref={rimRef} position={[0, 0, 4]} intensity={1.2} color="#8b5cf6" />
      {/* Fill from lower-left */}
      <pointLight position={[-4, -3, 2]} intensity={0.8} color="#1d4ed8" />
      {/* Bottom bounce */}
      <pointLight position={[0, -4, 1]} intensity={0.5} color="#3b82f6" />
      {/* Top spot for clearcoat highlight */}
      <spotLight
        position={[0, 7, 3]}
        intensity={1.2}
        angle={0.45}
        penumbra={0.9}
        color="#ffffff"
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Exported canvas — lazy-loaded via ShieldWrapper
   ───────────────────────────────────────────────────────────────────── */
export default function ShieldScene({
  mouseX = 0,
  mouseY = 0,
}: {
  mouseX?: number;
  mouseY?: number;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 7.2], fov: 42 }}
      gl={{
        antialias:    true,
        alpha:        true,
        toneMapping:  THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.4,
      }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <Lights />
      {/* Environment map gives metallic surfaces real-world reflections */}
      <Environment preset="city" />
      <ShieldBody mouseX={mouseX} mouseY={mouseY} />
      <OrbitalRing radius={3.5}  speed={0.38}  tilt={0.28} color="#3b82f6" dotCount={2} />
      <OrbitalRing radius={4.3}  speed={-0.24} tilt={1.05} color="#8b5cf6" dotCount={3} />
      <OrbitalRing radius={5.1}  speed={0.16}  tilt={0.72} color="#06b6d4" dotCount={2} />
      <Particles count={120} />
    </Canvas>
  );
}
