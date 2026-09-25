'use client';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const contacts = [
  {
    role: 'CEO / Partner',
    name: 'Muhammed Gufran',
    phone: '+91 9741 414 006',
    email: 'ecolushply@gmail.com',
  },
  {
    role: 'Partner',
    name: 'Shafeeq Rahman',
    phone: '+91 8073 811 355',
    email: 'ecolushply@gmail.com',
  },
];

const officeDetails = {
  label: 'Registered Office',
  address: ['Rasheed Siddeeq Towers, Shop No. 1 & 2,', 'NH-275, Muttambalam, Kottayam,', 'Kerala — 686 004'],
  gst: '32BCMPM6516R1Z8',
  mapUrl: 'https://maps.google.com/?q=Muttambalam,Kottayam,Kerala',
};

const productLines = [
  { grade: 'MUF / MR Grade', origin: 'Kerala', brands: ['Raw Leaf', 'Crown Platinum', 'Total Line'] },
  { grade: 'Pure PF Grade', origin: 'Hariyana', brands: ['K.G.F Gold', 'Symbol', 'Sharf Honour'] },
  { grade: 'Silver Oak', origin: 'Chikmagaluru', brands: ['Grevillea Robusta Timber'] },
];

export default function ContactFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading
      gsap.fromTo(
        headRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: headRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
      // Contact cards
      gsap.fromTo(
        cardsRef.current?.children ?? [],
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
      // Address + map
      gsap.fromTo(
        detailsRef.current?.children ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: detailsRef.current, start: 'top 88%', toggleActions: 'play none none reverse' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-[#020202] border-t border-stone-900">

      {/* ─── CTA Banner ─── */}
      <div className="relative w-full px-6 md:px-16 lg:px-24 py-28 flex flex-col md:flex-row items-center justify-between gap-10 border-b border-stone-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_50%,_rgba(185,28,28,0.08)_0%,_transparent_70%)] pointer-events-none" />
        <div ref={headRef}>
          <p className="text-red-600 font-mono text-xs tracking-[0.35em] uppercase mb-3">
            Premium Construction Materials
          </p>
          <h2 className="text-white font-serif text-5xl md:text-7xl uppercase tracking-tighter leading-[0.85]">
            Built for what<br />
            <span className="text-stone-500">comes next.</span>
          </h2>
        </div>
        <a
          href="mailto:ecolushply@gmail.com"
          className="group relative inline-flex items-center gap-3 px-8 py-5 border border-red-800 overflow-hidden text-white font-mono text-sm uppercase tracking-widest pointer-events-auto shrink-0"
        >
          <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
            Get a Quote
          </span>
          <span className="relative z-10 text-red-500 transition-transform duration-300 group-hover:translate-x-1">→</span>
          <div className="absolute inset-0 bg-red-700 translate-y-full transition-transform duration-400 ease-out group-hover:translate-y-0" />
        </a>
      </div>

      {/* ─── Product Lines ─── */}
      <div className="px-6 md:px-16 lg:px-24 py-16 border-b border-stone-900">
        <p className="text-stone-600 font-mono text-[10px] uppercase tracking-[0.35em] mb-8">Our Product Series</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-stone-900">
          {productLines.map((pl) => (
            <div key={pl.grade} className="bg-[#020202] p-8">
              <p className="text-red-600 font-mono text-[10px] uppercase tracking-widest mb-1">{pl.origin}</p>
              <h4 className="text-white font-serif text-2xl uppercase tracking-tight mb-4">{pl.grade}</h4>
              <div className="flex flex-col gap-2">
                {pl.brands.map((b) => (
                  <span key={b} className="text-stone-400 font-mono text-xs flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-red-800 inline-block shrink-0" />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Contact Cards + Address ─── */}
      <div className="px-6 md:px-16 lg:px-24 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 border-b border-stone-900">

        {/* Contact persons */}
        <div>
          <p className="text-stone-600 font-mono text-[10px] uppercase tracking-[0.35em] mb-8">Contact</p>
          <div ref={cardsRef} className="flex flex-col gap-4">
            {contacts.map((c) => (
              <div
                key={c.name}
                className="group flex flex-col gap-3 p-6 border border-stone-900 hover:border-red-900/60 bg-[#050505] hover:bg-[#0d0505] transition-all duration-400"
              >
                <p className="text-red-600 font-mono text-[10px] uppercase tracking-widest">{c.role}</p>
                <h3 className="text-white font-serif text-2xl">{c.name}</h3>
                <div className="flex flex-col gap-1 mt-1">
                  <a
                    href={`tel:${c.phone.replace(/\s/g, '')}`}
                    className="text-stone-400 font-mono text-sm hover:text-white transition-colors pointer-events-auto flex items-center gap-2"
                  >
                    <span className="text-red-700">📞</span> {c.phone}
                  </a>
                  <a
                    href={`mailto:${c.email}`}
                    className="text-stone-400 font-mono text-sm hover:text-white transition-colors pointer-events-auto flex items-center gap-2"
                  >
                    <span className="text-red-700">✉</span> {c.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address + Map */}
        <div ref={detailsRef}>
          <p className="text-stone-600 font-mono text-[10px] uppercase tracking-[0.35em] mb-8">
            {officeDetails.label}
          </p>

          <div className="mb-6">
            {officeDetails.address.map((line) => (
              <p key={line} className="text-stone-300 font-serif text-lg leading-relaxed">{line}</p>
            ))}
          </div>

          <div className="mb-8 p-4 border border-stone-900 inline-block">
            <p className="text-stone-600 font-mono text-[9px] uppercase tracking-widest mb-1">GST No.</p>
            <p className="text-white font-mono text-sm tracking-wider">{officeDetails.gst}</p>
          </div>

          {/* Map embed */}
          <div className="relative w-full h-56 border border-stone-900 overflow-hidden rounded-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.3!2d76.5213!3d9.6015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b062ba16c3eef71%3A0x1f53d7b3e5c0ab2c!2sMuttambalam%2C%20Kottayam%2C%20Kerala%20686004!5e0!3m2!1sen!2sin!4v1716000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(85%)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={officeDetails.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-3 right-3 bg-black/80 text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-stone-700 hover:border-red-700 transition-colors pointer-events-auto"
            >
              Open Maps ↗
            </a>
          </div>
        </div>
      </div>

      {/* ─── Footer bar ─── */}
      <div className="px-6 md:px-16 lg:px-24 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-white font-serif text-xl tracking-widest uppercase">Ecolush Ply</p>
        <p className="text-stone-700 font-mono text-[10px] uppercase tracking-widest text-center">
          © {new Date().getFullYear()} Ecolush Ply. Kottayam, Kerala.
        </p>
        <p className="text-stone-700 font-mono text-[10px] uppercase tracking-widest">
          GST: {officeDetails.gst}
        </p>
      </div>

    </section>
  );
}
