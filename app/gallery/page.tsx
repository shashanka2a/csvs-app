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
  Search,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import type { GalleryGroup, GalleryItem } from '@/app/api/gallery/route';

export default function GalleryPage() {
  const [groups, setGroups] = useState<GalleryGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
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

  // Filter groups and photos based on search query
  const filteredGroups = groups
    .map((group) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return group;

      const groupMatches =
        group.eventName.toLowerCase().includes(q) ||
        group.displayDate.toLowerCase().includes(q) ||
        group.date.toLowerCase().includes(q);

      if (groupMatches) return group;

      const matchingPhotos = group.photos.filter(
        (p) =>
          p.eventName.toLowerCase().includes(q) ||
          p.date.toLowerCase().includes(q)
      );

      if (matchingPhotos.length > 0) {
        return {
          ...group,
          photos: matchingPhotos,
          total: matchingPhotos.length,
        };
      }

      return null;
    })
    .filter((g): g is GalleryGroup => g !== null);

  const displayedPhotoCount = filteredGroups.reduce((acc, g) => acc + g.total, 0);

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
                Cherished moments and gatherings of Chattada Sri Vaishnava Sangham, organized by event name and date.
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

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-brand-border sticky top-16 z-30 shadow-xs py-3.5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event name or date..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-brand-border rounded-lg text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-brand-muted">
              <span>
                Showing <strong className="text-brand-dark">{displayedPhotoCount}</strong> of {totalPhotos} photos
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span>
                <strong className="text-brand-dark">{filteredGroups.length}</strong> event albums
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Gallery Groups (Google Photos style date & event sections) */}
      <section className="container mx-auto px-4 lg:px-8 py-12 space-y-14">
        {filteredGroups.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-2xl border border-brand-border p-8 max-w-lg mx-auto">
            <Images className="w-12 h-12 text-brand-muted/40 mx-auto mb-3" />
            <p className="text-brand-dark font-serif font-bold text-lg mb-1">
              {searchQuery ? 'No matching photos found' : 'No photos loaded'}
            </p>
            <p className="text-brand-muted text-sm">
              {searchQuery
                ? 'Try a different event name or date in the search bar.'
                : 'Photos uploaded through your Google Form will appear here organized by date.'}
            </p>
          </div>
        )}

        {filteredGroups.map((group) => (
          <div key={group.groupKey} className="space-y-4">
            {/* Header: Event Name Badge + Title + Date from form + Photo Count */}
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 pb-3 border-b border-gray-200/80">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-brand-red shrink-0 mt-1 sm:mt-0" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-brand-red tracking-wider uppercase bg-brand-red/10 px-2 py-0.5 rounded-full inline-block">
                      Event Album
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight">
                    {group.eventName}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-brand-muted pl-6 sm:pl-0">
                <span className="inline-flex items-center gap-1 font-semibold text-brand-dark bg-brand-cream/80 px-2.5 py-1 rounded-md border border-brand-border/60">
                  <Calendar className="w-3.5 h-3.5 text-brand-red" />
                  {group.displayDate}
                </span>
                <span>&bull;</span>
                <span className="font-medium">
                  {group.total} {group.total === 1 ? 'photo' : 'photos'}
                </span>
              </div>
            </div>

            {/* Photo Grid with Event Name hover badge */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {group.photos.map((photo, pIdx) => (
                <div
                  key={photo.id}
                  onClick={() => openLightbox(photo, group.photos)}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-brand-cream border border-brand-border/80 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                  title={`${group.eventName} - Click to view full photo`}
                >
                  <Image
                    src={photo.url}
                    alt={`${group.eventName} photo ${pIdx + 1}`}
                    fill
                    unoptimized
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  {/* Hover Overlay with Event Name & Date */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 sm:p-3 flex flex-col justify-end">
                    <span className="text-white text-xs font-bold truncate leading-tight drop-shadow-xs">
                      {group.eventName}
                    </span>
                    <span className="text-gray-300 text-[10px] sm:text-[11px] leading-tight flex items-center gap-1 mt-0.5 drop-shadow-xs">
                      <Calendar className="w-3 h-3 text-brand-gold shrink-0" />
                      <span>{group.displayDate}</span>
                    </span>
                    <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-md opacity-90">
                      <Maximize2 className="w-3 h-3" />
                    </div>
                  </div>
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
          onClick={closeLightbox}
        >
          {/* Top Bar with Event Name Badge */}
          <div
            className="p-4 sm:p-6 flex items-center justify-between text-white border-b border-white/10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="bg-brand-red text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-2xs">
                  Event
                </span>
                <span className="font-serif font-bold text-base sm:text-xl text-white truncate max-w-xs sm:max-w-xl">
                  {activePhoto.eventName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span className="text-brand-gold font-medium">{activePhoto.date}</span>
                <span>&bull;</span>
                <span>
                  Photo {currentIndex + 1} of {activeGroupPhotos.length}
                </span>
              </div>
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
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
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
                className="absolute left-3 sm:left-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95 cursor-pointer"
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
                onClick={(e) => e.stopPropagation()}
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
                className="absolute right-3 sm:right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95 cursor-pointer"
                title="Next photo (Right arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Bar: Thumbnail Strip & Caption */}
          <div
            className="p-3 sm:p-4 text-center border-t border-white/10 bg-black/40 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
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
