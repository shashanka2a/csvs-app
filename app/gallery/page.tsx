'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  Images,
  Search,
  Maximize2,
  Video,
  Play,
  Film,
} from 'lucide-react';
import type {
  GalleryGroup,
  GalleryItem,
  VideoGroup,
  VideoItem,
} from '@/app/api/gallery/route';

type MediaTab = 'all' | 'photos' | 'videos';

export default function GalleryPage() {
  const [groups, setGroups] = useState<GalleryGroup[]>([]);
  const [videoGroups, setVideoGroups] = useState<VideoGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPhotos, setTotalPhotos] = useState<number>(0);
  const [totalVideos, setTotalVideos] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<MediaTab>('all');

  // Photo Lightbox Modal state
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [activeGroupPhotos, setActiveGroupPhotos] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Video Player Modal state
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [activeGroupVideos, setActiveGroupVideos] = useState<VideoItem[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);

  // Touch swipe support for mobile photo lightbox
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.groups)) {
          setGroups(data.groups);
          setTotalPhotos(data.totalPhotos ?? data.total ?? 0);
        }
        if (Array.isArray(data.videoGroups)) {
          setVideoGroups(data.videoGroups);
          setTotalVideos(data.totalVideos ?? 0);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch gallery media:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // --- Photo Lightbox Handlers ---
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

  // --- Video Player Modal Handlers ---
  const openVideoModal = (video: VideoItem, gVideos: VideoItem[]) => {
    const idx = gVideos.findIndex((v) => v.id === video.id);
    setActiveGroupVideos(gVideos);
    setCurrentVideoIndex(idx >= 0 ? idx : 0);
    setActiveVideo(video);
  };

  const closeVideoModal = () => {
    setActiveVideo(null);
  };

  const showNextVideo = useCallback(() => {
    if (activeGroupVideos.length === 0) return;
    const nextIdx = (currentVideoIndex + 1) % activeGroupVideos.length;
    setCurrentVideoIndex(nextIdx);
    setActiveVideo(activeGroupVideos[nextIdx]);
  }, [currentVideoIndex, activeGroupVideos]);

  const showPrevVideo = useCallback(() => {
    if (activeGroupVideos.length === 0) return;
    const prevIdx = (currentVideoIndex - 1 + activeGroupVideos.length) % activeGroupVideos.length;
    setCurrentVideoIndex(prevIdx);
    setActiveVideo(activeGroupVideos[prevIdx]);
  }, [currentVideoIndex, activeGroupVideos]);

  // Swipe gesture handling for mobile photos
  const minSwipeDistance = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      showNext();
    } else if (distance < -minSwipeDistance) {
      showPrev();
    }
  };

  // Keyboard navigation for Lightbox and Video player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhoto) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
      } else if (activeVideo) {
        if (e.key === 'Escape') closeVideoModal();
        if (e.key === 'ArrowRight') showNextVideo();
        if (e.key === 'ArrowLeft') showPrevVideo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto, activeVideo, showNext, showPrev, showNextVideo, showPrevVideo]);

  // --- Filtering Logic ---
  const q = searchQuery.toLowerCase().trim();

  // Filter photo groups
  const filteredGroups = groups
    .map((group) => {
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

  // Filter video groups
  const filteredVideoGroups = videoGroups
    .map((group) => {
      if (!q) return group;
      const groupMatches =
        group.eventName.toLowerCase().includes(q) ||
        group.displayDate.toLowerCase().includes(q) ||
        group.date.toLowerCase().includes(q);

      if (groupMatches) return group;

      const matchingVideos = group.videos.filter(
        (v) =>
          v.eventName.toLowerCase().includes(q) ||
          v.date.toLowerCase().includes(q)
      );

      if (matchingVideos.length > 0) {
        return {
          ...group,
          videos: matchingVideos,
          total: matchingVideos.length,
        };
      }
      return null;
    })
    .filter((g): g is VideoGroup => g !== null);

  const displayedVideoCount = filteredVideoGroups.reduce((acc, g) => acc + g.total, 0);

  const showPhotos = activeTab === 'all' || activeTab === 'photos';
  const showVideos = activeTab === 'all' || activeTab === 'videos';

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
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Our Gallery</h1>
              <p className="text-gray-300 text-base md:text-lg max-w-2xl leading-relaxed">
                Cherished moments, photos, and video recordings of Chattada Sri Vaishnava Sangham, organized by event name and date.
              </p>
            </div>

            {/* Sync Sheet button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchGallery}
                disabled={loading}
                title="Refresh from Google Sheet"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-gold ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Sheet</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search & Filter Bar with Tabs */}
      <div className="bg-white border-b border-brand-border sticky top-16 z-30 shadow-xs py-3.5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event name or date..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-brand-border rounded-lg text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
              />
            </div>

            {/* Media Filter Tabs: All, Photos, Videos */}
            <div className="flex items-center justify-center gap-1 p-1 bg-slate-100 rounded-xl border border-brand-border/60 self-center md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-brand-dark shadow-xs'
                    : 'text-brand-muted hover:text-brand-dark'
                }`}
              >
                All Media
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'photos'
                    ? 'bg-brand-red text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-dark'
                }`}
              >
                <Images className="w-3.5 h-3.5" />
                <span>Photos</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === 'photos'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-brand-dark'
                  }`}
                >
                  {displayedPhotoCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'videos'
                    ? 'bg-brand-red text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-dark'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Videos</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === 'videos'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-brand-dark'
                  }`}
                >
                  {displayedVideoCount}
                </span>
              </button>
            </div>

            {/* Counts Counter */}
            <div className="flex items-center justify-between md:justify-end gap-2 text-xs text-brand-muted">
              {activeTab === 'photos' && (
                <span>
                  <strong className="text-brand-dark">{displayedPhotoCount}</strong> photos in{' '}
                  <strong className="text-brand-dark">{filteredGroups.length}</strong> albums
                </span>
              )}
              {activeTab === 'videos' && (
                <span>
                  <strong className="text-brand-dark">{displayedVideoCount}</strong> videos in{' '}
                  <strong className="text-brand-dark">{filteredVideoGroups.length}</strong> albums
                </span>
              )}
              {activeTab === 'all' && (
                <span>
                  <strong className="text-brand-dark">{displayedPhotoCount}</strong> photos &bull;{' '}
                  <strong className="text-brand-dark">{displayedVideoCount}</strong> videos
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
        {/* ========================================================
            3. PHOTOS SECTION
            ======================================================== */}
        {showPhotos && (
          <section id="photos-section" className="space-y-10">
            {activeTab === 'all' && (
              <div className="flex items-center justify-between pb-3 border-b-2 border-brand-red/20">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-brand-red/10 text-brand-red">
                    <Images className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-dark">
                      Photo Albums
                    </h2>
                    <p className="text-xs text-brand-muted">
                      Sangham gatherings and celebrations
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-muted bg-white px-3 py-1 rounded-full border border-brand-border shadow-2xs">
                  {displayedPhotoCount} {displayedPhotoCount === 1 ? 'photo' : 'photos'}
                </span>
              </div>
            )}

            {filteredGroups.length === 0 && !loading && (
              <div className="text-center py-16 bg-white rounded-2xl border border-brand-border p-8 max-w-lg mx-auto shadow-2xs">
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

            <div className="space-y-12">
              {filteredGroups.map((group) => (
                <div key={group.groupKey} className="space-y-4">
                  {/* Header: Title and Date inline in the same size */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xl sm:text-2xl font-serif">
                      <span className="bg-brand-red/10 text-brand-red text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded font-sans">
                        Event Album
                      </span>
                      <h3 className="font-bold text-brand-dark tracking-tight">
                        {group.eventName}
                      </h3>
                      <span className="text-gray-300 font-sans select-none">&bull;</span>
                      <span className="font-medium text-brand-red flex items-center gap-1.5 text-lg sm:text-xl">
                        <Calendar className="w-4 h-4 text-brand-red shrink-0" />
                        <span>{group.displayDate}</span>
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-brand-muted bg-slate-100 px-3 py-1 rounded-full border border-brand-border/60 shrink-0 w-fit">
                      {group.total} {group.total === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>

                  {/* Photo Grid with Hover Overlay */}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity p-2.5 sm:p-3 flex flex-col justify-end pointer-events-none">
                          <span className="text-white text-xs font-bold truncate leading-tight drop-shadow-xs">
                            {group.eventName}
                          </span>
                          <span className="text-gray-300 text-[10px] sm:text-[11px] leading-tight flex items-center gap-1 mt-0.5 drop-shadow-xs">
                            <Calendar className="w-3 h-3 text-brand-gold shrink-0" />
                            <span>{group.displayDate}</span>
                          </span>
                          <div className="hidden sm:block absolute top-2 right-2 bg-black/60 text-white p-1 rounded-md opacity-90">
                            <Maximize2 className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================
            4. VIDEOS SECTION (Google Sheet Connected)
            ======================================================== */}
        {showVideos && (
          <section id="videos-section" className="space-y-10 pt-4">
            {activeTab === 'all' && (
              <div className="flex items-center justify-between pb-3 border-b-2 border-brand-gold/30">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-amber-500/10 text-amber-700">
                    <Film className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-dark">
                      Videos &amp; Recordings
                    </h2>
                    <p className="text-xs text-brand-muted">
                      Speeches, rituals, and community videos
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-muted bg-white px-3 py-1 rounded-full border border-brand-border shadow-2xs">
                  {displayedVideoCount} {displayedVideoCount === 1 ? 'video' : 'videos'}
                </span>
              </div>
            )}

            {filteredVideoGroups.length === 0 && !loading && (
              <div className="text-center py-16 bg-white rounded-2xl border border-brand-border p-8 max-w-lg mx-auto shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center mx-auto mb-4 text-amber-700">
                  <Video className="w-7 h-7" />
                </div>
                <p className="text-brand-dark font-serif font-bold text-xl mb-1.5">
                  {searchQuery ? 'No matching videos found' : 'Videos Section Connected'}
                </p>
                <p className="text-brand-muted text-sm leading-relaxed mb-4">
                  {searchQuery
                    ? 'Try a different event name or date in the search bar.'
                    : 'Video links uploaded or pasted in your Google Sheet (YouTube, Google Drive, or video links) will automatically display here organized by event name and date.'}
                </p>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 border border-brand-border/70 rounded-lg text-xs text-brand-muted">
                  <RefreshCw className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Syncs automatically with your Videos Google Sheet</span>
                </div>
              </div>
            )}

            <div className="space-y-12">
              {filteredVideoGroups.map((group) => (
                <div key={group.groupKey} className="space-y-4">
                  {/* Header: Title and Date inline in the same size */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xl sm:text-2xl font-serif">
                      <span className="bg-amber-100 text-amber-800 text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded font-sans">
                        Video Album
                      </span>
                      <h3 className="font-bold text-brand-dark tracking-tight">
                        {group.eventName}
                      </h3>
                      <span className="text-gray-300 font-sans select-none">&bull;</span>
                      <span className="font-medium text-brand-red flex items-center gap-1.5 text-lg sm:text-xl">
                        <Calendar className="w-4 h-4 text-brand-red shrink-0" />
                        <span>{group.displayDate}</span>
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-brand-muted bg-slate-100 px-3 py-1 rounded-full border border-brand-border/60 shrink-0 w-fit">
                      {group.total} {group.total === 1 ? 'video' : 'videos'}
                    </span>
                  </div>

                  {/* Video Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {group.videos.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => openVideoModal(video, group.videos)}
                        className="group relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-brand-border shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col justify-between"
                        title={`${video.eventName} - Click to play video`}
                      >
                        {/* Video Thumbnail or Fallback Gradient */}
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.eventName}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-brand-dark to-slate-950 flex items-center justify-center">
                            <Video className="w-12 h-12 text-white/30" />
                          </div>
                        )}

                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 group-hover:via-black/20 transition-all" />

                        {/* Top Badges */}
                        <div className="relative z-10 p-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-black/60 text-white backdrop-blur-xs border border-white/10">
                            <Video className="w-3 h-3 text-brand-gold" />
                            <span>
                              {video.platform === 'youtube'
                                ? 'YouTube'
                                : video.platform === 'drive'
                                ? 'Google Drive'
                                : 'Video'}
                            </span>
                          </span>

                          <span className="text-white/80 text-[11px] bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                            {video.date}
                          </span>
                        </div>

                        {/* Center Play Button */}
                        <div className="relative z-10 self-center">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand-red/90 group-hover:bg-brand-red text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/25">
                            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
                          </div>
                        </div>

                        {/* Bottom Title & Event Info */}
                        <div className="relative z-10 p-3 sm:p-4 text-white">
                          <h4 className="text-sm sm:text-base font-serif font-bold text-white line-clamp-1 group-hover:text-brand-gold transition-colors">
                            {video.eventName}
                          </h4>
                          <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1">
                            <span>Click to play video</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ========================================================
          5. FULLSCREEN PHOTO LIGHTBOX MODAL
          ======================================================== */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Top Bar with Title & Date inline */}
          <div
            className="p-4 sm:p-6 flex items-center justify-between text-white border-b border-white/10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-base sm:text-lg font-serif">
                <span className="font-bold text-white truncate max-w-xs sm:max-w-xl">
                  {activePhoto.eventName}
                </span>
                <span className="text-gray-400 font-sans">&bull;</span>
                <span className="text-brand-gold font-medium">
                  {activePhoto.date}
                </span>
              </div>
              <span className="text-xs text-gray-400 mt-0.5">
                Photo {currentIndex + 1} of {activeGroupPhotos.length}
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
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Middle: Main Full-Size Image with Navigation */}
          <div className="relative flex-grow flex items-center justify-center p-2 sm:p-8 overflow-hidden">
            {/* Previous Arrow - Desktop / Tablet only so it never blocks image on mobile */}
            {activeGroupPhotos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="hidden sm:flex absolute left-3 sm:left-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95 cursor-pointer"
                title="Previous photo (Left arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* The Full Image with mobile touch swipe support */}
            <div
              className="relative max-w-full max-h-[75vh] sm:max-h-[82vh] w-full h-full flex items-center justify-center touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={activePhoto.url}
                alt={activePhoto.eventName}
                className="max-h-[75vh] sm:max-h-[82vh] max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl mx-auto"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Next Arrow - Desktop / Tablet only so it never blocks image on mobile */}
            {activeGroupPhotos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="hidden sm:flex absolute right-3 sm:right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95 cursor-pointer"
                title="Next photo (Right arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Bar: Navigation & Controls */}
          <div
            className="p-3 sm:p-4 border-t border-white/10 bg-black/60 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Navigation Controls: Positioned below image so photo is 100% unobstructed */}
            {activeGroupPhotos.length > 1 && (
              <div className="flex sm:hidden items-center justify-between gap-3 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={showPrev}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 active:bg-white/25 text-white text-xs font-medium border border-white/20 transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <span className="text-xs font-medium text-gray-300 tabular-nums">
                  {currentIndex + 1} of {activeGroupPhotos.length}
                </span>

                <button
                  type="button"
                  onClick={showNext}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 active:bg-white/25 text-white text-xs font-medium border border-white/20 transition-colors"
                  aria-label="Next photo"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Desktop Navigation Hint */}
            <p className="hidden sm:block text-xs text-gray-400 text-center">
              Use <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">&larr;</kbd> and{' '}
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">&rarr;</kbd> to navigate,{' '}
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">Esc</kbd> to close
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          6. FULLSCREEN VIDEO PLAYER MODAL
          ======================================================== */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in"
          onClick={closeVideoModal}
        >
          {/* Top Bar with Video Title & Date */}
          <div
            className="p-4 sm:p-6 flex items-center justify-between text-white border-b border-white/10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-base sm:text-lg font-serif">
                <span className="bg-brand-red text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded font-sans shadow-2xs">
                  {activeVideo.platform === 'youtube'
                    ? 'YouTube Video'
                    : activeVideo.platform === 'drive'
                    ? 'Google Drive Video'
                    : 'Video'}
                </span>
                <span className="font-bold text-white truncate max-w-xs sm:max-w-xl">
                  {activeVideo.eventName}
                </span>
                <span className="text-gray-400 font-sans">&bull;</span>
                <span className="text-brand-gold font-medium">
                  {activeVideo.date}
                </span>
              </div>
              <span className="text-xs text-gray-400 mt-0.5">
                Video {currentVideoIndex + 1} of {activeGroupVideos.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={activeVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Open original video link"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={closeVideoModal}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Middle: Video Embed Player */}
          <div
            className="relative flex-grow flex items-center justify-center p-2 sm:p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Desktop Prev Button */}
            {activeGroupVideos.length > 1 && (
              <button
                type="button"
                onClick={showPrevVideo}
                className="hidden sm:flex absolute left-4 sm:left-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95 cursor-pointer"
                title="Previous video"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Video Player Container (Responsive 16:9) */}
            <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black border border-white/10">
              {activeVideo.platform === 'direct' ? (
                <video
                  src={activeVideo.embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={activeVideo.embedUrl}
                  title={activeVideo.eventName}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              )}
            </div>

            {/* Desktop Next Button */}
            {activeGroupVideos.length > 1 && (
              <button
                type="button"
                onClick={showNextVideo}
                className="hidden sm:flex absolute right-4 sm:right-6 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 transition-transform active:scale-95 cursor-pointer"
                title="Next video"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Bar: Video Navigation & Controls */}
          <div
            className="p-3 sm:p-4 border-t border-white/10 bg-black/60 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {activeGroupVideos.length > 1 && (
              <div className="flex sm:hidden items-center justify-between gap-3 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={showPrevVideo}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 active:bg-white/25 text-white text-xs font-medium border border-white/20 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <span className="text-xs font-medium text-gray-300 tabular-nums">
                  {currentVideoIndex + 1} of {activeGroupVideos.length}
                </span>

                <button
                  type="button"
                  onClick={showNextVideo}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 active:bg-white/25 text-white text-xs font-medium border border-white/20 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="hidden sm:block text-xs text-gray-400 text-center">
              Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">Esc</kbd> or click outside to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
