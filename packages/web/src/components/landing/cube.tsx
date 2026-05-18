'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function RotatingCube() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 0.4;
    meshRef.current.rotation.x += delta * 0.15;
  });

  return (
    <mesh ref={meshRef} scale={1.8}>
      <boxGeometry args={[1, 1, 1]} />
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={0.5}
        roughness={0.05}
        transmissionSampler
        chromaticAberration={0.06}
        anisotropy={0.1}
        distortion={0.1}
        distortionScale={0.1}
        temporalDistortion={0.2}
        color="#9281f7"
        attenuationDistance={0.5}
        attenuationColor="#9281f7"
      />
    </mesh>
  );
}

export default function HeroCube() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#9281f7" />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#6366f1" />
        <pointLight position={[0, 3, 0]} intensity={2} color="#ffffff" />
        <RotatingCube />
      </Canvas>
    </div>
  );
}
