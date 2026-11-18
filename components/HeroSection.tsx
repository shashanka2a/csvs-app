'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEFAULT_CONTENT, getStoredContent, SiteContent } from '@/lib/contentStore';

export default function HeroSection() {
  const [hero, setHero] = useState<SiteContent['hero']>(DEFAULT_CONTENT.hero);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadContent = () => setHero(getStoredContent().hero);
      loadContent();
      window.addEventListener('csvs_content_updated', loadContent);
      return () => window.removeEventListener('csvs_content_updated', loadContent);
    }
  }, []);

  return (
    <section className="hero-bg h-[500px] flex items-center relative">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-3 block drop-shadow-md">
            {hero.badge}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-serif font-bold mb-4 leading-tight">
            {hero.title}{' '}
            <span className="italic">{hero.titleHighlight}</span>
          </h1>
          <p className="text-white/90 text-lg mb-8 font-medium max-w-lg leading-relaxed">
            {hero.description}
          </p>
          <Link
            href={hero.ctaLink || '/members'}
            className="inline-block bg-brand-red hover:bg-brand-redhover text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-lg border border-brand-red/50"
          >
            {hero.ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
