"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Shield geometry — extruded from a shield-shaped 2D path              */
/* ------------------------------------------------------------------ */
function ShieldMesh({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const glowRef  = useRef<THREE.Mesh>(null!);

  const shieldShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Classic shield outline
    shape.moveTo(0, 2.4);
    shape.bezierCurveTo( 1.2, 2.4,  2.0, 1.8,  2.0, 1.0);
    shape.bezierCurveTo( 2.0, 0.2,  1.4,-0.6,  0.8,-1.4);
    shape.bezierCurveTo( 0.3,-2.2,  0,  -2.6,  0,  -2.6);
    shape.bezierCurveTo( 0,  -2.6, -0.3,-2.2, -0.8,-1.4);
    shape.bezierCurveTo(-1.4,-0.6, -2.0, 0.2, -2.0, 1.0);
    shape.bezierCurveTo(-2.0, 1.8, -1.2, 2.4,  0,   2.4);
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 8,
  }), []);

  /* Gradient material via vertex colors */
  const shieldMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0a1628),
      metalness: 0.9,
      roughness: 0.1,
      reflectivity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      emissive: new THREE.Color(0x1a3a6e),
      emissiveIntensity: 0.4,
      side: THREE.FrontSide,
    });
  }, []);

  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x3b82f6),
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
    });
  }, []);

  /* Spring-follow mouse */
  const targetRot = useRef({ x: 0, y: 0 });
  useFrame((state) => {
    targetRot.current.x += (mouseY * 0.4 - targetRot.current.x) * 0.06;
    targetRot.current.y += (mouseX * 0.6 - targetRot.current.y) * 0.06;

    if (groupRef.current) {
      groupRef.current.rotation.x = targetRot.current.x;
      groupRef.current.rotation.y = targetRot.current.y;
      /* gentle idle float */
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.08;
    }

    /* Pulse emissive on inner shield */
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshPhysicalMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 1.4) * 0.15;
    }

    /* Rotate glow shell */
    if (glowRef.current) {
      glowRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main shield */}
      <mesh ref={innerRef} material={shieldMaterial} castShadow receiveShadow>
        <extrudeGeometry args={[shieldShape, extrudeSettings]} />
      </mesh>

      {/* Glow backface */}
      <mesh ref={glowRef} scale={[1.08, 1.08, 1.08]} material={glowMaterial}>
        <extrudeGeometry args={[shieldShape, extrudeSettings]} />
      </mesh>

      {/* Center checkmark / K emblem */}
      <group position={[0, -0.1, 0.26]}>
        <mesh>
          <torusGeometry args={[0.55, 0.04, 12, 48]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
          <meshBasicMaterial color="#60a5fa" />
        </mesh>
        <mesh position={[0.22, 0.15, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshBasicMaterial color="#60a5fa" />
        </mesh>
        <mesh position={[0.22, -0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshBasicMaterial color="#60a5fa" />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Orbital ring                                                         */
/* ------------------------------------------------------------------ */
function OrbitalRing({
  radius,
  speed,
  tilt,
  color,
  dotCount = 3,
}: {
  radius: number;
  speed: number;
  tilt: number;
  color: string;
  dotCount?: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * speed;
    }
  });

  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15 }),
    [color]
  );
  const dotMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }),
    [color]
  );

  return (
    <group rotation={[tilt, 0, 0]}>
      <group ref={groupRef}>
        {/* Ring circle */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={ringMat}>
          <torusGeometry args={[radius, 0.012, 8, 80]} />
        </mesh>
        {/* Orbiting dots */}
        {Array.from({ length: dotCount }).map((_, i) => {
          const angle = (i / dotCount) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius,
              ]}
              material={dotMat}
            >
              <sphereGeometry args={[0.05, 12, 12]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene lights                                                         */
/* ------------------------------------------------------------------ */
function Lights() {
  const lightRef = useRef<THREE.PointLight>(null!);
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.8 + Math.sin(clock.elapsedTime * 1.2) * 0.4;
    }
  });
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight ref={lightRef} position={[3, 4, 4]} intensity={2} color="#6ea8fe" />
      <pointLight position={[-3, -2, 2]} intensity={0.8} color="#8b5cf6" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />
      <pointLight position={[0, -4, 0]} intensity={0.3} color="#3b82f6" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Particle field                                                       */
/* ------------------------------------------------------------------ */
function Particles({ count = 120 }: { count?: number }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(Math.random() * 2 - 1);
      const r     = 3 + Math.random() * 3;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  const ref = useRef<THREE.Points>(null!);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#3b82f6" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Main export — canvas wrapper                                         */
/* ------------------------------------------------------------------ */
export default function ShieldScene({
  mouseX = 0,
  mouseY = 0,
}: {
  mouseX?: number;
  mouseY?: number;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <Lights />
      <ShieldMesh mouseX={mouseX} mouseY={mouseY} />
      <OrbitalRing radius={3.2} speed={0.4}  tilt={0.3}  color="#3b82f6" dotCount={2} />
      <OrbitalRing radius={4.0} speed={-0.25} tilt={1.1} color="#8b5cf6" dotCount={3} />
      <OrbitalRing radius={4.8} speed={0.18}  tilt={0.7}  color="#06b6d4" dotCount={2} />
      <Particles count={100} />
    </Canvas>
  );
}
