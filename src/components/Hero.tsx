'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });

    // Fade out and move text up slightly as user scrolls down
    tl.to(textRef.current, {
      opacity: 0,
      y: -100,
      ease: 'none'
    });

    return () => tl.kill();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-screen flex items-center justify-center z-20 pointer-events-none px-6">
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/80" />
      
      <div ref={textRef} className="relative z-10 flex flex-col items-center text-center max-w-4xl">
        <p className="text-red-500 font-mono text-sm md:text-base tracking-[0.3em] uppercase mb-6">
          Every structure starts with material.
        </p>
        <h1 className="text-white text-6xl md:text-8xl lg:text-9xl font-serif uppercase tracking-tighter leading-none mb-6">
          Ecolush Ply
        </h1>
        <h2 className="text-stone-400 font-mono text-xs md:text-sm uppercase tracking-widest max-w-xl leading-relaxed">
          High-Densified Shuttering Plywood and Phenolic Sheets
        </h2>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-pulse">
        <span className="text-[10px] font-mono tracking-widest uppercase">Scroll to inspect</span>
        <div className="w-px h-12 bg-white" />
      </div>
    </section>
  );
}
