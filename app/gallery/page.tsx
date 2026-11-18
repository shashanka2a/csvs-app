'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import { GalleryPhoto, DEFAULT_PHOTOS, getStoredPhotos } from '@/lib/contentStore';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_PHOTOS);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadPhotos = () => setPhotos(getStoredPhotos());
      loadPhotos();
      window.addEventListener('csvs_photos_updated', loadPhotos);
      return () => window.removeEventListener('csvs_photos_updated', loadPhotos);
    }
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Our Gallery</h1>
          <p className="text-gray-400">
            Cherished moments and photos from our community celebrations and gatherings.
          </p>
        </div>
      </section>

      {/* 2. Gallery grid */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {photos.map((item) => (
            <div
              key={item.id}
              className="relative group overflow-hidden rounded-2xl bg-brand-cream border border-brand-border/60 shadow-card break-inside-avoid"
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

              {/* Hover overlay with title */}
              <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <p className="text-white font-serif font-bold text-lg">{item.title}</p>
                <div className="flex items-center gap-1.5 text-brand-gold text-xs mt-1 font-medium">
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
