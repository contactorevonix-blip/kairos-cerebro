"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { ShieldMesh } from "./shield-mesh";
import { ShieldParticles } from "./shield-particles";

function SceneConfig() {
  const { scene, gl } = useThree();
  useEffect(() => {
    scene.background = null;
    gl.setClearColor(0x000000, 0);
  }, [scene, gl]);
  return null;
}

function Lights() {
  const keyRef = useRef<THREE.PointLight>(null!);
  const rimRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (keyRef.current) keyRef.current.intensity = 2.8 + Math.sin(t * 1.1) * 0.6;
    if (rimRef.current) {
      rimRef.current.position.x = Math.sin(t * 0.38) * 4;
      rimRef.current.position.z = Math.cos(t * 0.38) * 3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.10} />
      <pointLight ref={keyRef} position={[4, 5, 4]}   intensity={3.0} color="#7ec8ff" />
      <pointLight ref={rimRef} position={[0, 0, 4]}   intensity={1.2} color="#8b5cf6" />
      <pointLight            position={[-4, -3, 2]}   intensity={0.8} color="#1d4ed8" />
      <pointLight            position={[0, -4, 1]}    intensity={0.5} color="#3b82f6" />
      <spotLight             position={[0, 7, 3]} intensity={1.2} angle={0.45} penumbra={0.9} color="#ffffff" />
    </>
  );
}

export function ShieldScene({ mouseX = 0, mouseY = 0 }: { mouseX?: number; mouseY?: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 7.2], fov: 42 }}
      gl={{
        antialias:           true,
        alpha:               true,
        toneMapping:         THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.4,
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        scene.background = null;
      }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      dpr={[1, 2]}
    >
      <SceneConfig />
      <Lights />
      <Environment preset="city" background={false} />
      <ShieldMesh mouseX={mouseX} mouseY={mouseY} />
      <ShieldParticles />
    </Canvas>
  );
}
