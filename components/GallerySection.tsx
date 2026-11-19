'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Images } from 'lucide-react';
import { GalleryPhoto, DEFAULT_PHOTOS, getStoredPhotos } from '@/lib/contentStore';

export default function GallerySection() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_PHOTOS);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.groups) && data.groups.length > 0) {
          const flatPhotos: GalleryPhoto[] = [];
          data.groups.forEach((g: any) => {
            if (Array.isArray(g.photos)) {
              g.photos.forEach((p: any) => {
                flatPhotos.push({
                  id: flatPhotos.length + 1,
                  url: p.url,
                  order: flatPhotos.length + 1,
                });
              });
            }
          });
          if (flatPhotos.length > 0) {
            setPhotos(flatPhotos);
          }
        }
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      const loadPhotos = () => setPhotos(getStoredPhotos());
      window.addEventListener('csvs_photos_updated', loadPhotos);
      return () => window.removeEventListener('csvs_photos_updated', loadPhotos);
    }
  }, []);

  const p1 = photos[0] || DEFAULT_PHOTOS[0];
  const p2 = photos[1] || DEFAULT_PHOTOS[1];
  const p3 = photos[2] || DEFAULT_PHOTOS[2];

  return (
    <section id="gallery" className="py-20 bg-slate-50 border-t border-brand-border/60">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-2 block">
            Moments &amp; Memories
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-dark font-bold mb-4">
            Community Gallery
          </h2>
          <p className="text-brand-muted text-base md:text-lg">
            Special moments, celebrations, and gatherings from our Sangham.
          </p>
        </div>

        {/* Grid (clean images, no text overlay) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-10">
          {/* Left — large image */}
          <div className="relative overflow-hidden rounded-2xl h-72 md:h-full min-h-[300px] bg-brand-cream border border-brand-border/80 shadow-sm">
            <Image
              src={p1.url}
              alt="Community Photo 1"
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Right — two stacked images */}
          <div className="grid grid-rows-2 gap-5">
            {/* Top */}
            <div className="relative overflow-hidden rounded-2xl h-48 md:h-56 bg-brand-cream border border-brand-border/80 shadow-sm">
              <Image
                src={p2.url}
                alt="Community Photo 2"
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Bottom */}
            <div className="relative overflow-hidden rounded-2xl h-48 md:h-56 bg-brand-cream border border-brand-border/80 shadow-sm">
              <Image
                src={p3.url}
                alt="Community Photo 3"
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-redhover text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-sm text-sm"
          >
            <Images className="w-4 h-4" />
            <span>View Full Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
