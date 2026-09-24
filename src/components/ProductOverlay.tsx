'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ProductOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Select the brand lists
    const keralaBrands = containerRef.current.querySelectorAll('.kerala-brand');
    const hariyanaBrands = containerRef.current.querySelectorAll('.hariyana-brand');

    // Fade in Kerala Brands when entering section 1
    ScrollTrigger.create({
      trigger: '#section-kerala',
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => gsap.to(keralaBrands, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }),
      onLeaveBack: () => gsap.to(keralaBrands, { opacity: 0, y: 20, duration: 0.3 }),
    });

    // Fade in Hariyana Brands when entering section 2
    ScrollTrigger.create({
      trigger: '#section-hariyana',
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => gsap.to(hariyanaBrands, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }),
      onLeaveBack: () => gsap.to(hariyanaBrands, { opacity: 0, y: 20, duration: 0.3 }),
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      
      {/* SECTION 1: KERALA */}
      <div id="section-kerala" className="h-screen w-full flex flex-col justify-center px-12 md:px-24">
        <p className="text-red-500 font-mono text-sm tracking-widest uppercase mb-2">Crafted in Kerala</p>
        <h2 className="text-white text-5xl md:text-7xl font-serif uppercase tracking-tight mb-8">MUF/MR Grade</h2>
        
        {/* The 3 Kerala Brands fading in */}
        <div className="flex flex-col gap-3">
          <div className="kerala-brand opacity-0 translate-y-5 text-2xl font-serif text-stone-300 border-l-2 border-red-500 pl-4">Raw Leaf</div>
          <div className="kerala-brand opacity-0 translate-y-5 text-2xl font-serif text-stone-300 border-l-2 border-red-500 pl-4">Crown Platinum</div>
          <div className="kerala-brand opacity-0 translate-y-5 text-2xl font-serif text-stone-300 border-l-2 border-red-500 pl-4">Total Line</div>
        </div>
      </div>

      {/* SECTION 2: HARIYANA */}
      <div id="section-hariyana" className="h-screen w-full flex flex-col justify-center items-end text-right px-12 md:px-24">
        <p className="text-red-500 font-mono text-sm tracking-widest uppercase mb-2">Crafted in Hariyana</p>
        <h2 className="text-white text-5xl md:text-7xl font-serif uppercase tracking-tight mb-8">Pure PF Grade</h2>
        
        {/* The 3 Hariyana Brands fading in */}
        <div className="flex flex-col gap-3 items-end">
          <div className="hariyana-brand opacity-0 translate-y-5 text-2xl font-serif text-stone-300 border-r-2 border-red-500 pr-4">K.G.F Gold</div>
          <div className="hariyana-brand opacity-0 translate-y-5 text-2xl font-serif text-stone-300 border-r-2 border-red-500 pr-4">Symbol</div>
          <div className="hariyana-brand opacity-0 translate-y-5 text-2xl font-serif text-stone-300 border-r-2 border-red-500 pr-4">Sharf Honour</div>
        </div>
      </div>

      {/* SECTION 3: CHIKMAGALUR */}
      <div id="section-chikmagalur" className="h-screen w-full flex flex-col justify-center px-12 md:px-24">
        <p className="text-red-500 font-mono text-sm tracking-widest uppercase mb-2">Sawed in Chikmagaluru</p>
        <h2 className="text-white text-5xl md:text-7xl font-serif uppercase tracking-tight mb-8">Silver Oak</h2>
        <p className="text-stone-300 max-w-md text-lg">Premium Grevillea robusta timber designed for foundational strength and heavy load bearing.</p>
      </div>

    </div>
  );
}
