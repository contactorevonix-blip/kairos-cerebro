'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GREEN = '#00d97e';
const GREEN_DIM = 'rgba(0,217,126,0.2)';

/* ── Distribute points on sphere surface ──────────────────── */
function randomSpherePoint(radius: number): [number, number, number] {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  ];
}

/* ── Scene ────────────────────────────────────────────────── */
function GlobeScene() {
  const groupRef = useRef<THREE.Group>(null);

  /* Node positions — fixed per mount */
  const nodes = useMemo(() => {
    return Array.from({ length: 40 }, () => randomSpherePoint(1.0));
  }, []);

  /* Active node indices (8) */
  const activeIndices = useMemo(() => {
    const set = new Set<number>();
    while (set.size < 8) set.add(Math.floor(Math.random() * 40));
    return [...set];
  }, []);

  /* Pulse offsets for active nodes */
  const pulseOffsets = useMemo(
    () => activeIndices.map(() => Math.random() * Math.PI * 2),
    [activeIndices],
  );

  /* Line segments between nearby nodes */
  const linePositions = useMemo(() => {
    const pts: number[] = [];
    const threshold = 0.9;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < threshold) {
          pts.push(...nodes[i], ...nodes[j]);
        }
      }
    }
    return new Float32Array(pts);
  }, [nodes]);

  /* Refs for active node meshes */
  const activeRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    /* Auto-rotate */
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.18;
    }
    /* Pulse active nodes */
    const t = clock.getElapsedTime();
    activeRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const s = 1 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.2 + pulseOffsets[i]));
      mesh.scale.setScalar(s);
    });
  });

  return (
    <group ref={groupRef}>
      {/* Wireframe icosahedron */}
      <mesh>
        <icosahedronGeometry args={[1.0, 2]} />
        <meshBasicMaterial color={GREEN} wireframe opacity={0.15} transparent />
      </mesh>

      {/* Connection lines */}
      {linePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={GREEN} opacity={0.2} transparent />
        </lineSegments>
      )}

      {/* All nodes */}
      {nodes.map((pos, i) => {
        const isActive = activeIndices.includes(i);
        const activeIdx = activeIndices.indexOf(i);
        return (
          <mesh
            key={i}
            position={pos}
            ref={isActive ? (el) => { activeRefs.current[activeIdx] = el; } : undefined}
          >
            <sphereGeometry args={[isActive ? 0.022 : 0.014, 6, 6]} />
            <meshBasicMaterial
              color={GREEN}
              opacity={isActive ? 0.9 : 0.55}
              transparent
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── Export ───────────────────────────────────────────────── */
export default function HeroGlobe() {
  return (
    <Canvas
      style={{ width: '100%', height: 500 }}
      camera={{ position: [0, 0, 2.8], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
    >
      <GlobeScene />
    </Canvas>
  );
}
