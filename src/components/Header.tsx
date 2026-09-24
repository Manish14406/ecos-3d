'use client';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide header on scroll down, show on scroll up for a cinematic feel
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 px-6 py-6 transition-transform duration-500 flex justify-between items-center mix-blend-difference ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="text-white font-serif text-xl tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity">
        Ecolush
      </div>
      
      <button className="text-white font-mono text-xs uppercase tracking-[0.2em] hover:text-red-500 transition-colors">
        [ Menu ]
      </button>
    </header>
  );
}