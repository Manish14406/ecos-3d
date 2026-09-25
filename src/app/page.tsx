'use client';
import { Canvas } from '@react-three/fiber';
import SmoothScroll from '@/components/SmoothScroll';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductOverlay from '@/components/ProductOverlay';
import PlywoodBoard from '@/components/PlywoodBoard';
import Features from '@/components/Features';
import ManufacturingJourney from '@/components/factory/ManufacturingJourney';
import ContactFooter from '@/components/ContactFooter';

export default function Home() {
  return (
    <main className="bg-[#030303] text-white min-h-screen selection:bg-red-600 selection:text-white">
      <SmoothScroll>
        
        <Header />
        <Hero />
        
        {/* THE 3D PLYWOOD PRODUCT SHOWCASE */}
        <div className="relative w-full h-[300vh]">
          <div className="sticky top-0 h-screen w-full z-0 pointer-events-auto">
            <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
              <PlywoodBoard />
            </Canvas>
          </div>
          <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
            <ProductOverlay />
          </div>
        </div>

        {/* THE CINEMATIC MANUFACTURING JOURNEY */}
        <ManufacturingJourney />

        {/* THE BUSINESS VALUE & APPLICATIONS */}
        <Features />

        {/* CONTACT, ADDRESS & FOOTER */}
        <ContactFooter />

      </SmoothScroll>
    </main>
  );
}
