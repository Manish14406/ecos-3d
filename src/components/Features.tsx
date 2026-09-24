'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: '⬡',
    label: 'Zero Core Gap',
    description: 'Precision bonding with 0% void ensures uniform load distribution across the entire panel surface.',
  },
  {
    icon: '◈',
    label: 'BWP Certified',
    description: 'Boiling Water Proof grade. Our phenolic film resists sustained moisture, humidity, and repeated concrete pours.',
  },
  {
    icon: '◻',
    label: '60–80× Reuse',
    description: 'High-density compression delivers industry-leading repetition cycles — lowering cost per pour significantly.',
  },
  {
    icon: '⬤',
    label: 'E1 Emission Standard',
    description: 'Phenol Formaldehyde bonding within E1 emission limits. Safe for enclosed construction environments.',
  },
  {
    icon: '▲',
    label: 'Termite Resistant',
    description: 'Full-core treatment ensures structural integrity against biological degradation throughout service life.',
  },
  {
    icon: '◯',
    label: '100% Biodegradable',
    description: 'Timber sourced from managed forests. Every panel is built to perform and designed to return to the earth.',
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
        delay: index * 0.08,
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
      className="group flex flex-col gap-4 p-6 border border-stone-800 hover:border-stone-600 bg-[#0a0a0a] hover:bg-[#111] transition-colors duration-300 cursor-default"
    >
      <span className="text-red-600 text-2xl leading-none">{icon}</span>
      <h3 className="text-white font-serif text-xl uppercase tracking-tight">{label}</h3>
      <p className="text-stone-500 font-mono text-xs leading-relaxed">{description}</p>
    </div>
  );
}

export default function Features() {
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headingRef.current) return;
    gsap.set(headingRef.current, { opacity: 0, y: 30 });
    const ctx = gsap.context(() => {
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
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full bg-[#050505] px-6 md:px-16 lg:px-24 py-32 border-t border-stone-900">

      {/* Section Header */}
      <div ref={headingRef} className="mb-16 max-w-xl">
        <p className="text-red-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-4">
          Engineering Advantages
        </p>
        <h2 className="text-white text-4xl md:text-5xl font-serif uppercase tracking-tight leading-tight">
          Built Different.<br />Built to Last.
        </h2>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-900">
        {features.map((f, i) => (
          <FeatureCard key={f.label} {...f} index={i} />
        ))}
      </div>

      {/* Bottom stats bar */}
      <div className="mt-16 pt-8 border-t border-stone-900 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { stat: '720', unit: 'kg/m³', label: 'Core Density' },
          { stat: '≥6', unit: 'MPa', label: 'Load Bearing' },
          { stat: '0%', unit: '', label: 'Core Void' },
          { stat: '80×', unit: '', label: 'Max Reuse' },
        ].map(({ stat, unit, label }) => (
          <div key={label}>
            <p className="text-white font-serif text-3xl md:text-4xl tracking-tight">
              {stat}<span className="text-red-600 text-xl ml-1">{unit}</span>
            </p>
            <p className="text-stone-600 font-mono text-[10px] uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

    </section>
  );
}
