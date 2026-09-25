'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: '⚡',
    label: '0% Core Gap',
    description: 'Strong & stable bonding ensuring zero void for uniform load distribution.',
  },
  {
    icon: '📐',
    label: 'Uniform Thickness',
    description: 'Precision engineering for exact thickness, crucial for accurate concrete formwork.',
  },
  {
    icon: '🏗️',
    label: 'High Load Bearing',
    description: 'Exceptional capacity to withstand heavy concrete pours without bending or warping.',
  },
  {
    icon: '💧',
    label: 'Weather Resistance',
    description: 'Excellent water and weather resistance for longevity in harsh outdoor environments.',
  },
  {
    icon: '🛡️',
    label: 'Termite Resistant',
    description: 'Chemically treated to be termite and borer resistant, maintaining structural integrity.',
  },
  {
    icon: '🔄',
    label: 'Max Repetition',
    description: 'Smooth finish for concrete casting and a maximum repetition guarantee under proper use.',
  },
];

interface FeatureCardProps {
  icon: string;
  label: string;
  description: string;
  index: number;
}

function FeatureCard({ icon, label, description, index }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.set(cardRef.current, { opacity: 0, y: 40 });
    const ctx = gsap.context(() => {
      gsap.to(cardRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: index * 0.1,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });
    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group flex flex-col gap-4 p-8 border border-stone-800 hover:border-red-900/50 bg-[#0a0a0a] hover:bg-[#110505] transition-all duration-500 cursor-default"
    >
      <span className="text-red-600 text-3xl leading-none drop-shadow-md">{icon}</span>
      <h3 className="text-white font-serif text-xl md:text-2xl uppercase tracking-tight">{label}</h3>
      <p className="text-stone-400 font-mono text-xs md:text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function Features() {
  const headingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headingRef.current || !statsRef.current) return;
    
    gsap.set(headingRef.current, { opacity: 0, y: 30 });
    gsap.set(statsRef.current.children, { opacity: 0, y: 30 });

    const ctx = gsap.context(() => {
      // Header animation
      gsap.to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // Stats animation
      gsap.to(statsRef.current!.children, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full bg-[#030303] px-6 md:px-16 lg:px-24 py-32 border-t border-stone-900">

      {/* Section Header */}
      <div ref={headingRef} className="mb-16 max-w-2xl">
        <p className="text-red-600 font-mono text-sm tracking-[0.3em] uppercase mb-4 opacity-80">
          Crafted for Excellence
        </p>
        <h2 className="text-white text-5xl md:text-6xl lg:text-7xl font-serif uppercase tracking-tight leading-[0.9]">
          Key Features & <br /> <span className="text-stone-500">Performance</span>
        </h2>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-900 shadow-2xl">
        {features.map((f, i) => (
          <FeatureCard key={f.label} {...f} index={i} />
        ))}
      </div>

      {/* Bottom stats bar */}
      <div ref={statsRef} className="mt-16 pt-8 border-t border-stone-900 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { stat: '100%', unit: '', label: 'Recyclable' },
          { stat: '0%', unit: '', label: 'Core Gap' },
          { stat: 'Max', unit: '', label: 'Repetitions' },
          { stat: 'MUF/MR', unit: '& PF', label: 'Grades Available' },
        ].map(({ stat, unit, label }) => (
          <div key={label} className="flex flex-col items-start">
            <p className="text-white font-serif text-3xl md:text-5xl tracking-tight">
              {stat}<span className="text-red-600 text-xl ml-1">{unit}</span>
            </p>
            <p className="text-stone-500 font-mono text-[10px] uppercase tracking-widest mt-2">{label}</p>
          </div>
        ))}
      </div>

    </section>
  );
}
