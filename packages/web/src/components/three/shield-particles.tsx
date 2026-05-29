"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function OrbitalRing({ radius, speed, tilt, color, dotCount = 2 }: {
  radius: number; speed: number; tilt: number; color: string; dotCount?: number;
}) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * speed;
  });

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22 }), [color]);
  const dotMat  = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }), [color]);

  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={ringMat}>
          <torusGeometry args={[radius, 0.011, 8, 100]} />
        </mesh>
        {Array.from({ length: dotCount }).map((_, i) => {
          const a = (i / dotCount) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]} material={dotMat}>
              <sphereGeometry args={[0.048, 14, 14]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export function ShieldParticles() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(Math.random() * 2 - 1);
      const r     = 3.5 + Math.random() * 2.8;
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.05;
  });

  return (
    <>
      <OrbitalRing radius={3.5} speed={0.38}  tilt={0.28} color="#3b82f6" dotCount={2} />
      <OrbitalRing radius={4.3} speed={-0.24} tilt={1.05} color="#8b5cf6" dotCount={3} />
      <OrbitalRing radius={5.1} speed={0.16}  tilt={0.72} color="#06b6d4" dotCount={2} />
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.024} color="#3b82f6" transparent opacity={0.60} sizeAttenuation />
      </points>
    </>
  );
}
