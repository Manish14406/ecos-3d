'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('./Hero3D'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !headlineRef.current) return;

    // Split headline into chars for per-character animation
    const split = new SplitType(headlineRef.current, { types: 'chars,words' });
    const chars = split.chars ?? [];

    // Set initial states using transform (GPU-accelerated)
    gsap.set(chars, { y: '110%', opacity: 0 });
    gsap.set(taglineRef.current, { opacity: 0, y: 20 });
    gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
    gsap.set(pillsRef.current?.children ?? [], { opacity: 0, y: 16 });
    gsap.set(scrollRef.current, { opacity: 0 });

    // Master intro timeline — willChange & force3D for zero jank
    const intro = gsap.timeline({ delay: 0.1 });

    intro
      .to(taglineRef.current, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      })
      .to(chars, {
        y: '0%', opacity: 1,
        duration: 0.9,
        ease: 'power4.out',
        stagger: { amount: 0.5 },
        force3D: true,
      }, '-=0.3')
      .to(subtitleRef.current, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      }, '-=0.5')
      .to(pillsRef.current?.children ?? [], {
        opacity: 1, y: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.1,
      }, '-=0.4')
      .to(scrollRef.current, {
        opacity: 1, duration: 0.8, ease: 'power2.out',
      }, '-=0.2');

    // Animated floating orb
    gsap.to(orbRef.current, {
      y: -40,
      x: 20,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      force3D: true,
    });

    // Parallax + fade on scroll
    const scrollCtx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      });

      tl.to(bgRef.current, { y: 80, ease: 'none', force3D: true }, 0)
        .to(headlineRef.current, { y: -60, opacity: 0, ease: 'none', force3D: true }, 0)
        .to(taglineRef.current, { y: -40, opacity: 0, ease: 'none', force3D: true }, 0.05)
        .to(subtitleRef.current, { y: -30, opacity: 0, ease: 'none', force3D: true }, 0.1)
        .to(pillsRef.current, { y: -20, opacity: 0, ease: 'none', force3D: true }, 0.15)
        .to(scrollRef.current, { opacity: 0, ease: 'none' }, 0);
    }, containerRef);

    return () => {
      intro.kill();
      scrollCtx.revert();
      split.revert();
    };
  }, []);

  const values = ['Eco Friendly', 'Consistent Quality', 'Timely Delivery', 'Transparent Service'];

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen flex flex-col items-center justify-center z-20 pointer-events-none overflow-hidden"
      style={{ willChange: 'transform' }}
    >
      {/* Background gradient layer */}
      <div ref={bgRef} className="absolute inset-0 -inset-y-20 bg-[#030303]">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,_rgba(185,28,28,0.18)_0%,_transparent_70%)]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        {/* 3D floating plywood layers */}
        <Hero3D />
      </div>

      {/* Floating orb */}
      <div
        ref={orbRef}
        className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(185,28,28,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-6xl px-6">
        {/* Tagline */}
        <p
          ref={taglineRef}
          className="text-red-500 font-mono text-xs md:text-sm tracking-[0.45em] uppercase mb-7"
          style={{ willChange: 'transform, opacity' }}
        >
          Driven by Quality &amp; Customer Satisfaction
        </p>

        {/* Headline — chars split by SplitType */}
        <div className="overflow-hidden pb-2">
          <h1
            ref={headlineRef}
            className="text-white font-serif uppercase tracking-tighter leading-[0.85] text-[clamp(4rem,12vw,10rem)]"
            style={{ willChange: 'transform, opacity' }}
          >
            Ecolush <span className="text-red-600">Ply</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-stone-400 font-mono text-sm md:text-base uppercase tracking-[0.2em] max-w-2xl leading-relaxed mt-8 mb-10"
          style={{ willChange: 'transform, opacity' }}
        >
          High-Densified Shuttering Plywood{' '}
          <span className="text-stone-600">&amp; Phenolic Sheets</span>
        </p>

        {/* Value pills */}
        <div
          ref={pillsRef}
          className="flex flex-wrap justify-center gap-3 md:gap-5"
          style={{ willChange: 'transform, opacity' }}
        >
          {values.map((val) => (
            <span
              key={val}
              className="flex items-center gap-2 px-4 py-1.5 border border-stone-800 bg-white/[0.03] rounded-full text-stone-400 font-mono text-[10px] md:text-xs uppercase tracking-widest"
            >
              <span className="w-1 h-1 rounded-full bg-red-600 inline-block" />
              {val}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div
        ref={scrollRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        style={{ willChange: 'opacity' }}
      >
        <span className="text-[9px] text-stone-600 font-mono tracking-[0.35em] uppercase">
          Scroll
        </span>
        <div className="relative w-px h-14 overflow-hidden bg-stone-800">
          <div className="absolute top-0 left-0 w-full h-full bg-red-600 animate-[slide-down_1.6s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}
