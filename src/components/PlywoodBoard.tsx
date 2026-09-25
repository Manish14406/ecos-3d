'use client';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Environment, PresentationControls, useTexture } from '@react-three/drei';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PlywoodBoard() {
  const groupRef = useRef<THREE.Group>(null);
  const topLayerGroupRef = useRef<THREE.Group>(null);
  const bottomLayerRef = useRef<THREE.Mesh>(null);
  
  const keralaMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const hariyanaMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Fallback array prevents crashes if images are missing
  const [keralaTex, hariyanaTex] = useTexture([
    '/images/kerala-branding.jpg',
    '/images/hariyana-branding.jpg'
  ]);
  
  [keralaTex, hariyanaTex].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
  });

  useEffect(() => {
    if (!groupRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '300%', 
        scrub: 1.5, // slightly smoother scrub for the spins
      }
    });

    gsap.set(hariyanaMatRef.current, { opacity: 0 });

    // SCROLL 0 to 1: Kerala -> Hariyana
    // Board does a full 360 spin while changing textures
    tl.to(groupRef.current.rotation, { 
        x: Math.PI / 3, 
        y: Math.PI * 2 + Math.PI / 4, // Full spin + offset
        ease: 'power2.inOut' 
      }, 0)
      .to(topLayerGroupRef.current!.position, { y: 0.8, ease: 'power2.out' }, 0)
      .to(bottomLayerRef.current!.position, { y: -0.8, ease: 'power2.out' }, 0)
      .to(keralaMatRef.current, { opacity: 0, ease: 'power2.inOut' }, 0)
      .to(hariyanaMatRef.current, { opacity: 1, ease: 'power2.inOut' }, 0);

    // SCROLL 1 to 2: Hariyana -> Chikmagalur
    // Board spins again and reveals raw wood
    tl.to(groupRef.current.rotation, { 
        x: 0.1, 
        y: Math.PI * 4 - Math.PI / 6, // Another full spin
        ease: 'power2.inOut' 
      }, 1)
      .to(topLayerGroupRef.current!.position, { y: 0.1, ease: 'power2.in' }, 1)
      .to(bottomLayerRef.current!.position, { y: -0.1, ease: 'power2.in' }, 1)
      .to(hariyanaMatRef.current, { opacity: 0, ease: 'power2.inOut' }, 1);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      <Environment preset="warehouse" />
      <directionalLight position={[5, 10, -5]} intensity={3} />
      <ambientLight intensity={0.5} />
      
      <PresentationControls global polar={[-0.2, 0.2]} azimuth={[-0.2, 0.2]} snap>
        <group ref={groupRef} position={[0, 0, 0]} rotation={[0.5, -0.5, 0]}>
          
          <group ref={topLayerGroupRef} position={[0, 0.1, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[4, 0.1, 8]} />
              <meshStandardMaterial ref={keralaMatRef} map={keralaTex} transparent={true} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.001, 0]}>
              <boxGeometry args={[4, 0.1, 8]} />
              <meshStandardMaterial ref={hariyanaMatRef} map={hariyanaTex} transparent={true} roughness={0.2} />
            </mesh>
          </group>

          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[4, 0.1, 8]} />
            <meshStandardMaterial color="#4a3018" roughness={0.9} />
          </mesh>

          <mesh ref={bottomLayerRef} position={[0, -0.1, 0]}>
            <boxGeometry args={[4, 0.1, 8]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.3} />
          </mesh>
          
        </group>
      </PresentationControls>
    </>
  );
}
