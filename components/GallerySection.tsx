'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Images, Maximize2, X, ExternalLink } from 'lucide-react';
import { GalleryPhoto } from '@/lib/contentStore';

export default function GallerySection() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

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
                  title: p.eventName || g.eventName,
                });
              });
            }
          });
          if (flatPhotos.length > 0) {
            setPhotos(flatPhotos);
          }
        }
      })
      .catch(() => { });
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const p1 = photos[0];
  const p2 = photos[1] || photos[0];
  const p3 = photos[2] || photos[0];

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
            Special moments, celebrations, and gatherings from our Sangham. Click any photo to view full size.
          </p>
        </div>

        {/* Dynamic Sheet Photos Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-brand-border p-8 max-w-lg mx-auto mb-10">
            <Images className="w-12 h-12 text-brand-muted/40 mx-auto mb-3" />
            <p className="text-brand-dark font-serif font-bold text-lg mb-1">
              Photos Updating Live
            </p>
            <p className="text-brand-muted text-sm">
              Community celebration photos uploaded to the gallery sheet will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-10">
            {/* Left — large image */}
            <div
              onClick={() => setSelectedPhoto(p1)}
              className="group relative overflow-hidden rounded-2xl h-72 md:h-full min-h-[300px] bg-brand-cream border border-brand-border/80 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
              title={`${p1.title || 'Community Gathering'} - Click to view full photo`}
            >
              <Image
                src={p1.url}
                alt={p1.title || 'Community Photo 1'}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Hover overlay with Event Name */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <span className="text-white text-sm font-bold truncate">
                  {p1.title || 'Chattada Sri Vaishnava Sangham'}
                </span>
                <div className="flex items-center gap-1.5 text-gray-300 text-xs mt-1">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Click to view full photo</span>
                </div>
              </div>
            </div>

            {/* Right — two stacked images */}
            <div className="grid grid-rows-2 gap-5">
              {/* Top */}
              <div
                onClick={() => setSelectedPhoto(p2)}
                className="group relative overflow-hidden rounded-2xl h-48 md:h-56 bg-brand-cream border border-brand-border/80 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
                title={`${p2.title || 'Community Gathering'} - Click to view full photo`}
              >
                <Image
                  src={p2.url}
                  alt={p2.title || 'Community Photo 2'}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-white text-xs font-bold truncate">
                    {p2.title || 'Community Moment'}
                  </span>
                  <div className="flex items-center gap-1 text-gray-300 text-[11px] mt-0.5">
                    <Maximize2 className="w-3 h-3" />
                    <span>Click to view full photo</span>
                  </div>
                </div>
              </div>

              {/* Bottom */}
              <div
                onClick={() => setSelectedPhoto(p3)}
                className="group relative overflow-hidden rounded-2xl h-48 md:h-56 bg-brand-cream border border-brand-border/80 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
                title={`${p3.title || 'Community Gathering'} - Click to view full photo`}
              >
                <Image
                  src={p3.url}
                  alt={p3.title || 'Community Photo 3'}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <span className="text-white text-xs font-bold truncate">
                    {p3.title || 'Community Moment'}
                  </span>
                  <div className="flex items-center gap-1 text-gray-300 text-[11px] mt-0.5">
                    <Maximize2 className="w-3 h-3" />
                    <span>Click to view full photo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

      {/* Fullscreen Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Top Bar with Event Name */}
          <div
            className="p-4 sm:p-6 flex items-center justify-between text-white border-b border-white/10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="bg-brand-red text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-2xs">
                  Event
                </span>
                <span className="font-serif font-bold text-base sm:text-lg text-white">
                  {selectedPhoto.title || 'Chattada Sri Vaishnava Sangham'}
                </span>
              </div>
              <span className="text-xs text-gray-400 mt-0.5">Community Gallery Moment</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={selectedPhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Open full resolution in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Middle: Full Image */}
          <div className="relative flex-grow flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            <div className="relative max-w-full max-h-[75vh] sm:max-h-[82vh] w-full h-full flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title || 'Community Photo'}
                className="max-h-[75vh] sm:max-h-[82vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl mx-auto"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className="p-3 sm:p-4 text-center border-t border-white/10 bg-black/40 shrink-0 text-xs text-gray-400"
            onClick={(e) => e.stopPropagation()}
          >
            Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">Esc</kbd> or click anywhere to close
          </div>
        </div>
      )}
    </section>
  );
}
