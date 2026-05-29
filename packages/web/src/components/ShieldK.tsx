'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ShieldK() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Luzes
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x4488ff, 1.5);
    rimLight.position.set(-5, -3, -5);
    scene.add(rimLight);
    const topLight = new THREE.PointLight(0xffd700, 2, 20);
    topLight.position.set(0, 5, 3);
    scene.add(topLight);

    // Forma do escudo
    const shape = new THREE.Shape();
    shape.moveTo(0, 2.2);
    shape.bezierCurveTo(1.5, 2.2, 2.2, 1.5, 2.2, 0.5);
    shape.bezierCurveTo(2.2, -0.5, 1.8, -1.4, 0, -2.4);
    shape.bezierCurveTo(-1.8, -1.4, -2.2, -0.5, -2.2, 0.5);
    shape.bezierCurveTo(-2.2, 1.5, -1.5, 2.2, 0, 2.2);

    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 5,
    };

    const shieldGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    shieldGeo.center();
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0xc8a000,
      metalness: 0.95,
      roughness: 0.15,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    scene.add(shieldMesh);

    // Letra K via canvas texture
    const size = 512;
    const cv = document.createElement('canvas');
    cv.width = size; cv.height = size;
    const ctx = cv.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 80, 0, size - 80);
    grad.addColorStop(0, '#fff9c4');
    grad.addColorStop(0.3, '#ffd700');
    grad.addColorStop(0.7, '#b8860b');
    grad.addColorStop(1, '#ffd700');
    ctx.fillStyle = grad;
    ctx.font = `bold ${size * 0.75}px Arial Black, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillText('K', size / 2, size / 2);
    const kTex = new THREE.CanvasTexture(cv);
    const kMat = new THREE.MeshStandardMaterial({
      map: kTex,
      transparent: true,
      metalness: 0.8,
      roughness: 0.1,
      emissive: new THREE.Color(0xffd700),
      emissiveIntensity: 0.15,
      emissiveMap: kTex,
    });
    const kMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), kMat);
    kMesh.position.z = 0.22;
    shieldMesh.add(kMesh);

    // Partículas
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(120 * 3);
    for (let i = 0; i < 120 * 3; i++) positions[i] = (Math.random() - 0.5) * 12;
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffd700, size: 0.04, transparent: true, opacity: 0.6 }));
    scene.add(stars);

    // Interatividade
    let isDragging = false;
    let prevX = 0, prevY = 0, velX = 0, velY = 0;
    const el = renderer.domElement;

    const onDown = (x: number, y: number) => { isDragging = true; prevX = x; prevY = y; };
    const onMove = (x: number, y: number) => {
      if (!isDragging) return;
      velY = (x - prevX) * 0.01;
      velX = (y - prevY) * 0.01;
      prevX = x; prevY = y;
    };
    const onUp = () => { isDragging = false; };

    const onMouseMove  = (e: MouseEvent)      => onMove(e.clientX, e.clientY);
    const onTouchMove  = (e: TouchEvent)      => onMove(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchStart = (e: TouchEvent)      => onDown(e.touches[0].clientX, e.touches[0].clientY);

    el.addEventListener('mousedown',  (e) => onDown(e.clientX, e.clientY));
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseup',    onUp);
    el.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove',  onTouchMove);
    window.addEventListener('touchend',   onUp);

    // Resize
    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    // Animação
    const clock = new THREE.Clock();
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (isDragging) {
        shieldMesh.rotation.y += velY;
        shieldMesh.rotation.x += velX;
        velX *= 0.9; velY *= 0.9;
      } else {
        shieldMesh.rotation.y += 0.008 + velY;
        shieldMesh.rotation.x += velX * 0.1;
        velX *= 0.95; velY *= 0.95;
      }
      shieldMesh.position.y = Math.sin(t * 1.2) * 0.12;
      topLight.intensity = 1.5 + Math.sin(t * 2) * 0.5;
      topLight.position.x = Math.sin(t) * 3;
      topLight.position.z = Math.cos(t) * 3;
      stars.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseup',    onUp);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend',   onUp);
      window.removeEventListener('resize',     onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '500px', cursor: 'grab' }} />;
}
