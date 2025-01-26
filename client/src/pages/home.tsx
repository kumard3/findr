import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Pricing from '@/components/sections/Pricing';
import Blog from '@/components/sections/Blog';
import CTA from '@/components/sections/CTA';

const Index = () => {
  return (
    <div className="overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Blog />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;