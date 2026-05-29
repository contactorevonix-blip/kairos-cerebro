"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ShieldMesh } from "./shield-mesh";
import { ShieldParticles } from "./shield-particles";

// Mata o fundo a cada frame — garante que Environment nunca sobrescreve
function BackgroundKiller() {
  const { scene, gl } = useThree();
  useFrame(() => {
    if (scene.background !== null) scene.background = null;
  });
  useEffect(() => {
    scene.background = null;
    gl.setClearColor(0, 0, 0, 0);
    gl.setClearAlpha(0);
  }, [scene, gl]);
  return null;
}

function Lights() {
  const keyRef = useRef<THREE.PointLight>(null!);
  const rimRef = useRef<THREE.PointLight>(null!);
  const fillRef = useRef<THREE.PointLight>(null!);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (keyRef.current)  keyRef.current.intensity  = 3.5 + Math.sin(t * 1.1) * 0.8;
    if (fillRef.current) fillRef.current.intensity = 1.0 + Math.sin(t * 0.7 + 1) * 0.3;
    if (rimRef.current) {
      rimRef.current.position.x = Math.sin(t * 0.38) * 5;
      rimRef.current.position.z = Math.cos(t * 0.38) * 4;
    }
  });

  return (
    <>
      <ambientLight intensity={0.15} color="#1a2a4a" />
      {/* Key light — azul frio vindo de cima */}
      <pointLight ref={keyRef} position={[4, 6, 5]}  intensity={4.0} color="#60a5fa" />
      {/* Rim light — roxo orbitando */}
      <pointLight ref={rimRef} position={[0, 0, 5]}  intensity={1.5} color="#8b5cf6" />
      {/* Fill — azul escuro lateral */}
      <pointLight ref={fillRef} position={[-5, -2, 3]} intensity={1.2} color="#1d4ed8" />
      {/* Bounce — luz de baixo subtil */}
      <pointLight position={[0, -5, 2]}  intensity={0.6} color="#3b82f6" />
      {/* Top spot — branco frio */}
      <spotLight  position={[0, 8, 4]}   intensity={2.0} angle={0.35} penumbra={0.95} color="#e0f0ff" castShadow={false} />
      {/* Sombra projectada no chão (simulada com luz de baixo) */}
      <pointLight position={[0, -3, 0]}  intensity={0.2} color="#0a1628" />
    </>
  );
}

export function ShieldScene({ mouseX = 0, mouseY = 0 }: { mouseX?: number; mouseY?: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 7.5], fov: 40 }}
      gl={{
        antialias:           true,
        alpha:               true,
        toneMapping:         THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.6,
        powerPreference:     "high-performance",
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0, 0, 0, 0);
        gl.setClearAlpha(0);
        scene.background = null;
        scene.fog = null;
      }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      dpr={[1, 2]}
    >
      <BackgroundKiller />
      <Lights />
      <ShieldMesh mouseX={mouseX} mouseY={mouseY} />
      <ShieldParticles />
    </Canvas>
  );
}
