'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Shared geometry + materials (module-level, never re-created) ─────────────
const sheetGeo = new THREE.BoxGeometry(1, 0.012, 0.6);
const layerGeos = [
  new THREE.BoxGeometry(0.9, 0.008, 0.55),
  new THREE.BoxGeometry(0.85, 0.008, 0.52),
];
const accentGeo = new THREE.BoxGeometry(0.9, 0.06, 0.005);

const matOuter  = new THREE.MeshStandardMaterial({ color: '#C4935A', roughness: 0.55, metalness: 0.05 });
const matVeneer = new THREE.MeshStandardMaterial({ color: '#B8864E', roughness: 0.65 });
const matCore   = new THREE.MeshStandardMaterial({ color: '#A0763C', roughness: 0.75 });
const matEdge   = new THREE.MeshStandardMaterial({ color: '#6B4226', roughness: 0.8 });
const matGlow   = new THREE.MeshStandardMaterial({ color: '#FF3030', emissive: '#FF2020', emissiveIntensity: 0.6, roughness: 1 });

// ─── A single floating plywood sheet with exploded layers ─────────────────────
function FloatingSheet({
  position, rotation, layerSpread, speed, phase,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  layerSpread: number;
  speed: number;
  phase: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const layers = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime * speed + phase;

    // Gentle float + slow rotation
    groupRef.current.position.y = position[1] + Math.sin(t) * 0.15;
    groupRef.current.position.x = position[0] + Math.sin(t * 0.7) * 0.08;
    groupRef.current.rotation.y = rotation[1] + t * 0.12;
    groupRef.current.rotation.x = rotation[0] + Math.sin(t * 0.5) * 0.04;

    // Breathing layer separation
    const breathe = Math.sin(t * 1.3) * 0.5 + 0.5; // 0→1
    const spread = layerSpread * breathe;
    for (let i = 0; i < layers.current.length; i++) {
      const m = layers.current[i];
      if (m) m.position.y = (i - 2) * spread;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* 5 layers: top face → veneer → core → veneer → bottom face */}
      {[matOuter, matVeneer, matCore, matVeneer, matOuter].map((mat, i) => (
        <mesh
          key={i}
          ref={el => { layers.current[i] = el; }}
          geometry={i === 0 || i === 4 ? sheetGeo : i === 2 ? layerGeos[0] : layerGeos[1]}
          material={mat}
          position={[0, (i - 2) * layerSpread, 0]}
        />
      ))}
      {/* Thin red accent line on the front edge (Ecolush brand) */}
      <mesh position={[0, 0, 0.31]} geometry={accentGeo} material={matGlow} />
    </group>
  );
}

// ─── Orbiting ring of small wood chips ────────────────────────────────────────
function WoodChips() {
  const groupRef = useRef<THREE.Group>(null);
  const chipGeo = new THREE.BoxGeometry(0.04, 0.005, 0.025);
  const chipMat = new THREE.MeshLambertMaterial({ color: '#B8864E' });

  // Pre-compute positions
  const chips = Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * Math.PI * 2;
    const r = 2.8 + Math.sin(i * 1.7) * 0.6;
    return {
      x: Math.cos(angle) * r,
      y: (Math.sin(i * 2.3) - 0.5) * 1.2,
      z: Math.sin(angle) * r,
      rx: i * 0.8,
      ry: i * 1.2,
    };
  });

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {chips.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation={[c.rx, c.ry, 0]} geometry={chipGeo} material={chipMat} />
      ))}
    </group>
  );
}

// ─── Main scene ───────────────────────────────────────────────────────────────
function HeroScene() {
  return (
    <>
      {/* Warm key light from upper-right */}
      <ambientLight intensity={0.25} color="#FFF0D8" />
      <directionalLight position={[4, 5, 3]} intensity={1.8} color="#FFE0B0" />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#C8D8F0" />
      {/* Red accent light from below-center (matches the hero glow) */}
      <pointLight position={[0, -2, 2]} intensity={2} color="#C0392B" distance={10} decay={2} />

      {/* Main center sheet — larger, prominent, slow */}
      <FloatingSheet
        position={[0, 0, 0]}
        rotation={[0.15, 0.3, 0]}
        layerSpread={0.06}
        speed={0.4}
        phase={0}
      />

      {/* Upper-right sheet — smaller, tilted differently */}
      <FloatingSheet
        position={[1.8, 0.9, -1.5]}
        rotation={[-0.2, -0.8, 0.1]}
        layerSpread={0.04}
        speed={0.5}
        phase={2.1}
      />

      {/* Lower-left sheet — medium, further away */}
      <FloatingSheet
        position={[-2.0, -0.6, -1.0]}
        rotation={[0.3, 1.2, -0.1]}
        layerSpread={0.05}
        speed={0.35}
        phase={4.3}
      />

      {/* Far back sheet — adds depth */}
      <FloatingSheet
        position={[0.5, -1.2, -3]}
        rotation={[0.1, 0.5, 0.15]}
        layerSpread={0.03}
        speed={0.3}
        phase={1.5}
      />

      {/* Small accent sheet — upper left */}
      <FloatingSheet
        position={[-1.3, 1.4, -2]}
        rotation={[-0.4, 2, 0.2]}
        layerSpread={0.035}
        speed={0.55}
        phase={3.8}
      />

      {/* Orbiting wood chips ring */}
      <WoodChips />
    </>
  );
}

// ─── Exported wrapper ─────────────────────────────────────────────────────────
export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      dpr={[0.75, 1.5]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: true,
        stencil: false,
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <HeroScene />
    </Canvas>
  );
}
