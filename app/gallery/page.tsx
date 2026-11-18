'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import GalleryFilter from '@/components/GalleryFilter';
import { GalleryPhoto, DEFAULT_PHOTOS, getStoredPhotos } from '@/lib/contentStore';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_PHOTOS);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadPhotos = () => setPhotos(getStoredPhotos());
      loadPhotos();
      window.addEventListener('csvs_photos_updated', loadPhotos);
      return () => window.removeEventListener('csvs_photos_updated', loadPhotos);
    }
  }, []);

  const filteredPhotos =
    activeCategory === 'All'
      ? photos
      : photos.filter((p) => p.tag.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Our Gallery</h1>
          <p className="text-gray-400">
            Cherished moments from our community events, festivals, and celebrations.
          </p>
        </div>
      </section>

      {/* 2. Category filter tabs */}
      <div className="sticky top-16 z-40 bg-white border-b border-brand-border">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <GalleryFilter onSelectCategory={(cat) => setActiveCategory(cat)} />
        </div>
      </div>

      {/* 3. Gallery masonry grid */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredPhotos.map((item) => (
            <div
              key={item.id}
              className="relative group overflow-hidden rounded-xl bg-brand-cream border border-brand-border/60 shadow-card break-inside-avoid"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden">
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Tag pill top-right */}
              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-brand-dark text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                {item.tag}
              </span>

              {/* Hover overlay with title */}
              <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white font-serif font-semibold text-lg">{item.title}</p>
                <div className="flex items-center gap-1 text-brand-gold text-xs mt-1">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>View photo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
