"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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

const OUTER_EXT: THREE.ExtrudeGeometryOptions = {
  depth: 0.6, bevelEnabled: true,
  bevelThickness: 0.15, bevelSize: 0.10,
  bevelSegments: 20, curveSegments: 48,
};
const INNER_EXT: THREE.ExtrudeGeometryOptions = {
  depth: 0.07, bevelEnabled: false, curveSegments: 32,
};

function KairosMark() {
  const ref     = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current)     ref.current.scale.setScalar(1 + Math.sin(t * 2.0) * 0.022);
    if (ringRef.current) (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.55 + Math.sin(t * 1.4) * 0.25;
  });

  return (
    <group ref={ref} position={[0, -0.12, 0.72]}>
      {/* soft halo */}
      <mesh>
        <circleGeometry args={[0.88, 64]} />
        <meshBasicMaterial color="#2563eb" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* glow ring */}
      <mesh>
        <torusGeometry args={[0.68, 0.09, 16, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* solid ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.68, 0.024, 16, 64]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.7} />
      </mesh>
      {/* K vertical stem */}
      <mesh position={[-0.20, 0, 0.01]}>
        <boxGeometry args={[0.10, 0.82, 0.06]} />
        <meshBasicMaterial color="#93c5fd" />
      </mesh>
      {/* K upper arm */}
      <mesh position={[0.11, 0.24, 0.01]} rotation={[0, 0, -0.48]}>
        <boxGeometry args={[0.10, 0.50, 0.06]} />
        <meshBasicMaterial color="#93c5fd" />
      </mesh>
      {/* K lower arm */}
      <mesh position={[0.11, -0.24, 0.01]} rotation={[0, 0, 0.48]}>
        <boxGeometry args={[0.10, 0.50, 0.06]} />
        <meshBasicMaterial color="#93c5fd" />
      </mesh>
      {/* centre glow */}
      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[0.07, 24]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function ShieldMesh({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const scanRef  = useRef<THREE.Mesh>(null!);
  const scanY    = useRef(-2.8);
  const rot      = useRef({ x: 0, y: 0 });

  const outerShape = useMemo(() => makeShieldShape(1),    []);
  const innerShape = useMemo(() => makeShieldShape(0.80), []);

  const outerMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#061428"),
    metalness: 1.0, roughness: 0.04,
    clearcoat: 1.0, clearcoatRoughness: 0.02,
    reflectivity: 1.0, envMapIntensity: 2.2,
    emissive: new THREE.Color("#0d2f6e"), emissiveIntensity: 0.6,
  }), []);

  const innerMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#0a1e50"),
    metalness: 0.85, roughness: 0.12,
    clearcoat: 0.7, envMapIntensity: 1.2,
    emissive: new THREE.Color("#1a4090"), emissiveIntensity: 0.45,
  }), []);

  const auraMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color("#1d4ed8"),
    transparent: true, opacity: 0.06,
    side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
  }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    rot.current.x += (mouseY * 0.40 - rot.current.x) * 0.06;
    rot.current.y += (mouseX * 0.60 - rot.current.y) * 0.06;

    if (groupRef.current) {
      groupRef.current.rotation.x = rot.current.x;
      groupRef.current.rotation.y = rot.current.y;
      groupRef.current.position.y = Math.sin(t * 0.65) * 0.11;
    }

    outerMat.emissiveIntensity = 0.50 + Math.sin(t * 1.3)      * 0.18;
    innerMat.emissiveIntensity = 0.35 + Math.sin(t * 1.3 + 1.0) * 0.14;

    if (scanRef.current) {
      scanY.current += 0.024;
      if (scanY.current > 2.9) scanY.current = -2.9;
      scanRef.current.position.y = scanY.current;
      const fade = Math.sin(((scanY.current + 2.9) / 5.8) * Math.PI);
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity = fade * 0.22;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh scale={[1.14, 1.14, 1.04]} material={auraMat}>
        <extrudeGeometry args={[outerShape, OUTER_EXT]} />
      </mesh>
      <mesh material={outerMat} castShadow receiveShadow>
        <extrudeGeometry args={[outerShape, OUTER_EXT]} />
      </mesh>
      <mesh position={[0, 0, 0.50]} material={innerMat}>
        <extrudeGeometry args={[innerShape, INNER_EXT]} />
      </mesh>
      <mesh ref={scanRef} position={[0, 0, 0.75]}>
        <planeGeometry args={[4.8, 0.20]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.65, 0.62]}>
        <torusGeometry args={[1.12, 0.011, 8, 80, Math.PI]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.55} />
      </mesh>
      <KairosMark />
    </group>
  );
}
