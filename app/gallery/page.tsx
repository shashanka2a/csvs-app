'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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

      {/* 2. Gallery grid (7 photos in numerical row-wise order, no titles, no hover overlay) */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((item, index) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-2xl bg-brand-cream border border-brand-border/70 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden">
                <Image
                  src={item.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
