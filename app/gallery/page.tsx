'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  RefreshCw,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  Images,
  AlertCircle,
} from 'lucide-react';
import type { GalleryGroup, GalleryItem } from '@/app/api/gallery/route';

export default function GalleryPage() {
  const [groups, setGroups] = useState<GalleryGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);
  const [totalPhotos, setTotalPhotos] = useState<number>(0);

  // Lightbox Modal state
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [activeGroupPhotos, setActiveGroupPhotos] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.groups) && data.groups.length > 0) {
          setGroups(data.groups);
          setTotalPhotos(data.total || 0);
          setIsUnauthorized(Boolean(data.isUnauthorized));
        }
      }
    } catch (e) {
      console.warn('Failed to fetch gallery photos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Open Lightbox
  const openLightbox = (photo: GalleryItem, groupPhotos: GalleryItem[]) => {
    const idx = groupPhotos.findIndex((p) => p.id === photo.id);
    setActiveGroupPhotos(groupPhotos);
    setCurrentIndex(idx >= 0 ? idx : 0);
    setActivePhoto(photo);
  };

  const closeLightbox = () => {
    setActivePhoto(null);
  };

  const showNext = useCallback(() => {
    if (activeGroupPhotos.length === 0) return;
    const nextIdx = (currentIndex + 1) % activeGroupPhotos.length;
    setCurrentIndex(nextIdx);
    setActivePhoto(activeGroupPhotos[nextIdx]);
  }, [currentIndex, activeGroupPhotos]);

  const showPrev = useCallback(() => {
    if (activeGroupPhotos.length === 0) return;
    const prevIdx = (currentIndex - 1 + activeGroupPhotos.length) % activeGroupPhotos.length;
    setCurrentIndex(prevIdx);
    setActivePhoto(activeGroupPhotos[prevIdx]);
  }, [currentIndex, activeGroupPhotos]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activePhoto) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto, showNext, showPrev]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. Hero banner */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-2 block">
                Moments & Memories
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Our Gallery</h1>
              <p className="text-gray-300 text-base md:text-lg max-w-2xl leading-relaxed">
                Cherished moments, celebrations, and gatherings of Chattada Sri Vaishnava Sangham.
              </p>
            </div>

            {/* Quick stats & sync */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full font-medium border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{totalPhotos} Photos</span>
              </span>
              <button
                type="button"
                onClick={fetchGallery}
                disabled={loading}
                title="Refresh from Google Sheet"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-gold ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Sheet</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Permissions hint alert if sheet is restricted */}
      {isUnauthorized && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4 text-xs text-amber-800">
          <div className="container mx-auto flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Note for Admin:</strong> Your Gallery Google Sheet is currently set to &ldquo;Restricted&rdquo;.
              In Google Sheets, click <strong>Share</strong> &rarr; change General Access to <strong>&ldquo;Anyone with the link can view&rdquo;</strong> to automatically load live batches. Showing default moments in the meantime.
            </span>
          </div>
        </div>
      )}

      {/* 2. Gallery Groups (Google Photos style date & event sections) */}
      <section className="container mx-auto px-4 lg:px-8 py-12 space-y-14">
        {groups.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-2xl border border-brand-border p-8 max-w-lg mx-auto">
            <Images className="w-12 h-12 text-brand-muted/40 mx-auto mb-3" />
            <p className="text-brand-dark font-serif font-bold text-lg mb-1">No photos loaded</p>
            <p className="text-brand-muted text-sm">
              Photos uploaded through your Google Form will appear here organized by date.
            </p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.groupKey} className="space-y-4">
            {/* Google Photos Style Header: Event Name + Date + Photo Count */}
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pb-3 border-b border-gray-200/80">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-brand-red shrink-0" />
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight">
                  {group.eventName}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-brand-muted pl-6 sm:pl-0">
                <span className="inline-flex items-center gap-1 font-semibold text-brand-dark bg-brand-cream/80 px-2.5 py-0.5 rounded-md border border-brand-border/60">
                  <Calendar className="w-3 h-3 text-brand-red" />
                  {group.displayDate}
                </span>
                <span>&bull;</span>
                <span>
                  {group.total} {group.total === 1 ? 'photo' : 'photos'}
                </span>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {group.photos.map((photo, pIdx) => (
                <div
                  key={photo.id}
                  onClick={() => openLightbox(photo, group.photos)}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-brand-cream border border-brand-border/80 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                >
                  <Image
                    src={photo.url}
                    alt={`${group.eventName} photo ${pIdx + 1}`}
                    fill
                    unoptimized
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 3. Fullscreen Lightbox Modal (Loads images fully upon clicking) */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in"
        >
          {/* Top Bar */}
          <div className="p-4 sm:p-6 flex items-center justify-between text-white border-b border-white/10 shrink-0">
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base sm:text-lg text-white truncate max-w-xs sm:max-w-md">
                {activePhoto.eventName}
              </span>
              <span className="text-xs text-gray-400">
                {activePhoto.date} &bull; Photo {currentIndex + 1} of {activeGroupPhotos.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={activePhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Open full resolution in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={closeLightbox}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Middle: Main Full-Size Image with Navigation */}
          <div className="relative flex-grow flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            {/* Previous Arrow */}
            {activeGroupPhotos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-3 sm:left-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95"
                title="Previous photo (Left arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* The Full Image */}
            <div className="relative max-w-full max-h-[75vh] sm:max-h-[82vh] w-full h-full flex items-center justify-center">
              <img
                src={activePhoto.url}
                alt={activePhoto.eventName}
                className="max-h-[75vh] sm:max-h-[82vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl mx-auto"
              />
            </div>

            {/* Next Arrow */}
            {activeGroupPhotos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-3 sm:right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95"
                title="Next photo (Right arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Bar: Thumbnail Strip & Caption */}
          <div className="p-3 sm:p-4 text-center border-t border-white/10 bg-black/40 shrink-0">
            <p className="text-xs text-gray-400">
              Use <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">&larr;</kbd> and{' '}
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">&rarr;</kbd> to navigate,{' '}
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">Esc</kbd> to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
