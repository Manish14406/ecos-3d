'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function FooterCTA() {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom bottom',
        toggleActions: 'play none none reverse'
      }
    });

    tl.fromTo(textRef.current, 
      { y: 100, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    )
    .fromTo(lineRef.current, 
      { scaleX: 0 }, 
      { scaleX: 1, duration: 1, ease: 'power3.inOut' }, 
      '-=0.5'
    );

    return () => { tl.kill(); };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full min-h-screen bg-[#020202] flex flex-col items-center justify-center z-20 px-6 py-24">
      
      {/* Subtle Background Grain/Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        <h2 
          ref={textRef} 
          className="text-white text-4xl md:text-7xl lg:text-8xl font-serif uppercase tracking-tighter leading-none mb-12"
        >
          Built for what<br />comes next.
        </h2>
        
        <div ref={lineRef} className="w-full h-px bg-stone-800 mb-12 origin-left" />

        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
          <div className="text-left">
            <h3 className="text-white text-2xl font-serif tracking-widest mb-2">ECOLUSH PLY</h3>
            <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">
              High-Densified Shuttering Plywood
            </p>
          </div>

          <button className="group relative px-8 py-4 bg-white text-black overflow-hidden rounded-sm transition-transform hover:scale-105 duration-300">
            <span className="relative z-10 font-mono text-sm uppercase font-bold tracking-widest">
              Contact Engineering
            </span>
            <div className="absolute inset-0 bg-red-600 scale-y-0 origin-bottom transition-transform duration-300 ease-out group-hover:scale-y-100" />
            <span className="absolute inset-0 z-10 flex items-center justify-center font-mono text-sm uppercase font-bold tracking-widest text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Contact Engineering
            </span>
          </button>
        </div>
      </div>

    </section>
  );
}
