'use client';
import { useRef, useEffect, useState, MutableRefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Dynamic import to avoid SSR issues with Three.js
const FactoryScene = dynamic(() => import('./FactoryScene'), { ssr: false });

const STAGES = [
  { from: 0.00, to: 0.08, label: 'RAW MATERIAL', sub: 'Silver Oak Timber', step: '01' },
  { from: 0.09, to: 0.21, label: 'VENEER', sub: 'Rotary Peeling', step: '02' },
  { from: 0.22, to: 0.33, label: 'ASSEMBLY', sub: 'Cross-Grain Layering', step: '03' },
  { from: 0.34, to: 0.46, label: 'BONDING', sub: 'Phenol Formaldehyde Resin', step: '04' },
  { from: 0.47, to: 0.62, label: 'PRESSING', sub: 'Hydraulic Compression', step: '05' },
  { from: 0.63, to: 0.70, label: 'CUTTING', sub: 'Precision Sizing', step: '06' },
  { from: 0.71, to: 0.77, label: 'FINISHING', sub: 'Surface Sanding', step: '07' },
  { from: 0.78, to: 0.83, label: 'QUALITY', sub: 'Inspection & Grading', step: '08' },
  { from: 0.84, to: 0.90, label: 'PACKAGING', sub: 'Ready for Dispatch', step: '09' },
  { from: 0.91, to: 0.95, label: 'DISPATCH', sub: 'Ecolush Delivery Fleet', step: '10' },
  { from: 0.96, to: 1.00, label: 'DESTINATION', sub: 'Premium Interiors', step: '11' },
] as const;

type Stage = (typeof STAGES)[number];

export default function ManufacturingJourney() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState<Stage>(STAGES[0]);
  const [stageVisible, setStageVisible] = useState(false);
  const [dpr, setDpr] = useState(1.0);             // starts at 1, adapts live
  const stageTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let rafId: number;

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const scrolled = -rect.top;
        const total = Math.max(1, rect.height - window.innerHeight);
        const p = Math.max(0, Math.min(1, scrolled / total));
        scrollProgress.current = p;

        // Update progress bar directly (no re-render)
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${p * 100}%`;
        }

        // Update stage label (limited state updates)
        const found = STAGES.find(s => p >= s.from && p <= s.to);
        if (found) {
          setActiveStage(found);
          setStageVisible(true);
        } else {
          clearTimeout(stageTimeout.current);
          stageTimeout.current = setTimeout(() => setStageVisible(false), 200);
        }
      });
    };

    // Use Lenis-aware scroll (works alongside existing SmoothScroll)
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initialize

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
      clearTimeout(stageTimeout.current);
    };
  }, []);

  return (
    <section className="w-full bg-[#030303]">

      {/* ── Section intro header ─────────────────────────────────────── */}
      <div className="w-full px-6 md:px-16 lg:px-24 pt-28 pb-16 border-t border-stone-900">
        <p className="text-red-600 font-mono text-xs tracking-[0.45em] uppercase mb-5">
          From Forest to Structure
        </p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2 className="text-white font-serif text-5xl md:text-7xl lg:text-[6rem] uppercase tracking-tighter leading-[0.85]">
            The Ecolush<br />
            <span className="text-stone-600">Journey</span>
          </h2>
          <p className="text-stone-500 font-mono text-sm leading-relaxed max-w-sm pb-2">
            Scroll through every stage of manufacturing — from raw Silver Oak timber
            to the premium finished plywood in your space.
          </p>
        </div>
        {/* Stage breadcrumb bar */}
        <div className="flex flex-wrap gap-2 mt-10">
          {STAGES.map(s => (
            <span
              key={s.step}
              className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 border transition-all duration-300 ${
                activeStage?.step === s.step
                  ? 'border-red-700 text-red-500 bg-red-950/30'
                  : 'border-stone-900 text-stone-700'
              }`}
            >
              {s.step} {s.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Scroll container ─────────────────────────────────────────── */}
      <div ref={sectionRef} className="relative w-full" style={{ height: '600vh' }}>

        {/* Sticky viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0C0907]">

          {/* 3D Canvas — optimised */}
          <Canvas
            camera={{ position: [0, 14, 62], fov: 52 }}
            dpr={dpr}
            gl={{
              antialias: dpr >= 1,
              powerPreference: 'high-performance',
              alpha: false,
              stencil: false,
              depth: true,
            }}
            style={{ background: '#0C0907' }}
          >
            {/* Adaptive quality: drop DPR when GPU falls below 50fps, raise when above 60 */}
            <PerformanceMonitor
              onDecline={() => setDpr(d => Math.max(0.5, d - 0.25))}
              onIncline={() => setDpr(d => Math.min(window.devicePixelRatio, d + 0.25))}
            />
            <FactoryScene scrollProgress={scrollProgress} />
          </Canvas>

          {/* ── Stage label overlay ───────────────────────────────── */}
          <div
            className="absolute top-1/2 left-6 md:left-14 -translate-y-1/2 pointer-events-none select-none"
            style={{
              opacity: stageVisible ? 1 : 0,
              transform: `translateY(-50%) translateX(${stageVisible ? '0px' : '-16px'})`,
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-red-600" />
              <span className="text-red-600 font-mono text-[9px] tracking-[0.5em] uppercase">
                Stage {activeStage.step}
              </span>
            </div>
            <p className="text-white font-serif text-4xl md:text-6xl uppercase tracking-tight leading-none drop-shadow-2xl">
              {activeStage.label}
            </p>
            <p className="text-stone-500 font-mono text-xs uppercase tracking-[0.25em] mt-3">
              {activeStage.sub}
            </p>
          </div>

          {/* ── Top right: Ecolush brand mark ────────────────────── */}
          <div className="absolute top-6 right-6 md:right-10 pointer-events-none select-none">
            <p className="text-white/20 font-serif text-sm tracking-widest uppercase">Ecolush Ply</p>
          </div>

          {/* ── Bottom progress bar ───────────────────────────────── */}
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-stone-900/80">
            <div
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-400"
              style={{ width: '0%', transition: 'width 0.1s linear' }}
            />
          </div>

          {/* ── Scroll hint (fades after user starts scrolling) ───── */}
          <div
            className="absolute bottom-8 right-6 md:right-14 flex items-center gap-3 pointer-events-none select-none"
            style={{
              opacity: stageVisible ? 0 : 0.5,
              transition: 'opacity 0.6s ease',
            }}
          >
            <span className="text-stone-600 font-mono text-[9px] uppercase tracking-[0.3em]">
              Scroll to explore
            </span>
            <div className="flex flex-col gap-0.5">
              <div className="w-4 h-px bg-stone-700" />
              <div className="w-3 h-px bg-stone-800 ml-1" />
            </div>
          </div>

          {/* ── Step counter ──────────────────────────────────────── */}
          <div className="absolute top-6 left-6 md:left-14 pointer-events-none select-none">
            <span className="text-stone-700 font-mono text-[9px] uppercase tracking-widest">
              {activeStage.step} / {STAGES.length}
            </span>
          </div>

        </div>
      </div>

      {/* ── Post-section callout ─────────────────────────────────────── */}
      <div className="w-full px-6 md:px-16 lg:px-24 py-16 border-t border-stone-900 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <p className="text-stone-600 font-mono text-[10px] uppercase tracking-widest mb-2">
            Every panel, precisely made
          </p>
          <p className="text-white font-serif text-2xl">
            Zero core gap. Maximum repetitions.
          </p>
        </div>
        <div className="flex gap-10">
          {[
            { val: 'MUF/MR', unit: '', label: 'Kerala Grade' },
            { val: 'Pure PF', unit: '', label: 'Hariyana Grade' },
            { val: '0%', unit: '', label: 'Core Void' },
          ].map(({ val, unit, label }) => (
            <div key={label} className="text-center">
              <p className="text-white font-serif text-2xl md:text-3xl">
                {val}<span className="text-red-600 text-sm ml-1">{unit}</span>
              </p>
              <p className="text-stone-600 font-mono text-[9px] uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
