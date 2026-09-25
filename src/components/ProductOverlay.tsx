'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ProductOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const sections = [
      { id: '#section-kerala', elements: '.kerala-anim' },
      { id: '#section-hariyana', elements: '.hariyana-anim' },
      { id: '#section-chikmagalur', elements: '.chik-anim' }
    ];

    sections.forEach(({ id, elements }) => {
      const els = containerRef.current!.querySelectorAll(elements);
      ScrollTrigger.create({
        trigger: id,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => gsap.fromTo(els, { opacity: 0, x: (i) => i % 2 === 0 ? -30 : 30 }, { opacity: 1, x: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out', overwrite: true }),
        onLeaveBack: () => gsap.to(els, { opacity: 0, x: -20, duration: 0.4, overwrite: true }),
        onLeave: () => gsap.to(els, { opacity: 0, y: -20, duration: 0.4, overwrite: true }),
        onEnterBack: () => gsap.fromTo(els, { opacity: 0, y: -30 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out', overwrite: true }),
      });
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      
      {/* SECTION 1: KERALA */}
      <div id="section-kerala" className="h-screen w-full flex flex-col justify-center px-8 md:px-24">
        <p className="kerala-anim text-red-600 font-mono text-sm tracking-[0.3em] uppercase mb-4">Crafted in Kerala</p>
        <h2 className="kerala-anim text-white text-5xl md:text-7xl font-serif uppercase tracking-tight mb-4 drop-shadow-lg">
          MUF/MR Grade <br/> <span className="text-3xl text-stone-400">Series</span>
        </h2>
        <div className="kerala-anim w-12 h-1 bg-red-600 mb-8" />
        
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex flex-col gap-4">
            <h3 className="kerala-anim text-stone-500 font-mono text-xs uppercase tracking-widest">Featured Brands</h3>
            <div className="kerala-anim text-2xl md:text-3xl font-serif text-white border-l-2 border-red-500 pl-4 bg-gradient-to-r from-red-900/20 to-transparent py-2">Raw Leaf</div>
            <div className="kerala-anim text-2xl md:text-3xl font-serif text-white border-l-2 border-red-500 pl-4 bg-gradient-to-r from-red-900/20 to-transparent py-2">Crown Platinum</div>
            <div className="kerala-anim text-2xl md:text-3xl font-serif text-white border-l-2 border-red-500 pl-4 bg-gradient-to-r from-red-900/20 to-transparent py-2">Total Line</div>
          </div>
          
          <div className="flex flex-col gap-6 mt-8 md:mt-0 justify-center">
             <div className="kerala-anim">
               <p className="text-stone-400 font-mono text-[10px] uppercase tracking-widest">Thickness</p>
               <p className="text-white text-xl font-serif">12mm | 15mm | 18mm</p>
             </div>
             <div className="kerala-anim">
               <p className="text-stone-400 font-mono text-[10px] uppercase tracking-widest">Density</p>
               <p className="text-white text-xl font-serif">25kg - 50kg</p>
             </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: HARIYANA */}
      <div id="section-hariyana" className="h-screen w-full flex flex-col justify-center items-end text-right px-8 md:px-24">
        <p className="hariyana-anim text-red-600 font-mono text-sm tracking-[0.3em] uppercase mb-4">Crafted in Hariyana</p>
        <h2 className="hariyana-anim text-white text-5xl md:text-7xl font-serif uppercase tracking-tight mb-4 drop-shadow-lg">
          Pure PF Grade <br/> <span className="text-3xl text-stone-400">Series</span>
        </h2>
        <div className="hariyana-anim w-12 h-1 bg-red-600 mb-8" />
        
        <div className="flex flex-col md:flex-row-reverse gap-12 text-right">
          <div className="flex flex-col gap-4 items-end">
            <h3 className="hariyana-anim text-stone-500 font-mono text-xs uppercase tracking-widest">Premium BWP Brands</h3>
            <div className="hariyana-anim text-2xl md:text-3xl font-serif text-white border-r-2 border-red-500 pr-4 bg-gradient-to-l from-red-900/20 to-transparent py-2">K.G.F Gold</div>
            <div className="hariyana-anim text-2xl md:text-3xl font-serif text-white border-r-2 border-red-500 pr-4 bg-gradient-to-l from-red-900/20 to-transparent py-2">Symbol</div>
            <div className="hariyana-anim text-2xl md:text-3xl font-serif text-white border-r-2 border-red-500 pr-4 bg-gradient-to-l from-red-900/20 to-transparent py-2">Sharf Honour</div>
          </div>
          
          <div className="flex flex-col gap-6 mt-8 md:mt-0 justify-center text-right">
             <div className="hariyana-anim">
               <p className="text-stone-400 font-mono text-[10px] uppercase tracking-widest">Emission (Glue)</p>
               <p className="text-white text-xl font-serif">E1 (Phenol Formaldehyde)</p>
             </div>
             <div className="hariyana-anim">
               <p className="text-stone-400 font-mono text-[10px] uppercase tracking-widest">Surface</p>
               <p className="text-white text-xl font-serif">Phenolic Film (Red & Brown)</p>
             </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: CHIKMAGALUR */}
      <div id="section-chikmagalur" className="h-screen w-full flex flex-col justify-center px-8 md:px-24">
        <p className="chik-anim text-red-600 font-mono text-sm tracking-[0.3em] uppercase mb-4">Sawed in Chikmagaluru</p>
        <h2 className="chik-anim text-white text-5xl md:text-7xl font-serif uppercase tracking-tight mb-4 drop-shadow-lg">
          Silver Oak <br/> <span className="text-3xl text-stone-400">Series</span>
        </h2>
        <div className="chik-anim w-12 h-1 bg-red-600 mb-8" />
        
        <div className="chik-anim max-w-xl p-8 border border-stone-800 bg-black/40 backdrop-blur-sm">
           <h3 className="text-white text-2xl font-serif mb-4">Grevillea Robusta</h3>
           <p className="text-stone-400 leading-relaxed font-mono text-sm mb-6">
             A highly durable hardwood widely used in construction, especially for centering and shuttering work. Designed for foundational strength and heavy load bearing.
           </p>
           <div className="grid grid-cols-2 gap-4">
             <div>
               <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest">Typical Use</p>
               <p className="text-white">Joists / Runners</p>
             </div>
             <div>
               <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest">Sizes</p>
               <p className="text-white">Custom lengths 6-10 ft</p>
             </div>
           </div>
        </div>
      </div>

    </div>
  );
}
