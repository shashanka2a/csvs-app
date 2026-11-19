'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CalendarCheck,
  MapPin,
  CalendarDays,
  Clock,
  RefreshCw,
  CheckCircle2,
  Search,
  X,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import type { SanghamEvent } from '@/app/api/events/route';

const INITIAL_EVENTS: SanghamEvent[] = [];

function getCategoryColor(type: string): string {
  const t = (type || '').toLowerCase();
  if (t.includes('cultur')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (t.includes('matrimon')) return 'bg-pink-100 text-pink-800 border-pink-200';
  if (t.includes('spirit') || t.includes('pooja')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (t.includes('celeb') || t.includes('festival')) return 'bg-rose-100 text-rose-800 border-rose-200';
  if (t.includes('social') || t.includes('service')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  return 'bg-blue-100 text-blue-800 border-blue-200';
}

function EventCardImage({
  src,
  title,
  onClick,
}: {
  src?: string;
  title: string;
  onClick?: () => void;
}) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const handleImageError = () => {
    // If lh3 direct CDN fails, try Google Drive thumbnail endpoint
    if (imgSrc && imgSrc.includes('lh3.googleusercontent.com/d/')) {
      const id = imgSrc.split('/d/')[1];
      if (id) {
        setImgSrc(`https://drive.google.com/thumbnail?id=${id}&sz=w1200`);
        return;
      }
    }
    setError(true);
  };

  if (imgSrc && !error) {
    return (
      <div
        onClick={onClick}
        className={`relative h-52 w-full overflow-hidden bg-brand-cream ${
          onClick ? 'cursor-pointer group/img' : ''
        }`}
        title={onClick ? 'Click to open photo fully' : undefined}
      >
        <Image
          src={imgSrc}
          alt={title}
          fill
          unoptimized
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={handleImageError}
        />
        {onClick && (
          <div className="absolute top-3.5 right-3.5 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg opacity-0 sm:group-hover/img:opacity-100 transition-opacity backdrop-blur-xs pointer-events-none">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`h-52 w-full bg-gradient-to-br from-brand-cream to-amber-50/50 flex flex-col items-center justify-center border-b border-brand-border/60 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <CalendarCheck className="w-12 h-12 text-brand-red/40 mb-2" />
      <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Sangham Event</span>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<SanghamEvent[]>(INITIAL_EVENTS);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Modals state: Expanded event details and full photo view
  const [selectedEvent, setSelectedEvent] = useState<SanghamEvent | null>(null);
  const [fullScreenPhoto, setFullScreenPhoto] = useState<{ url: string; title: string } | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Check if custom edited events exist in localStorage
      if (typeof window !== 'undefined') {
        const customRaw = localStorage.getItem('csvs_custom_events');
        if (customRaw) {
          try {
            const parsed = JSON.parse(customRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setEvents(parsed);
              setLoading(false);
              return;
            }
          } catch {
            // fallback to fetch
          }
        }
      }

      const res = await fetch('/api/events', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.events)) {
          setEvents(data.events);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch events from Google Sheet:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    window.addEventListener('csvs_events_custom_updated', fetchEvents);
    return () => window.removeEventListener('csvs_events_custom_updated', fetchEvents);
  }, []);

  // Keyboard navigation to close modals on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullScreenPhoto) {
          setFullScreenPhoto(null);
        } else if (selectedEvent) {
          setSelectedEvent(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullScreenPhoto, selectedEvent]);

  // Dynamically extract unique event types from the sheet events
  const dynamicEventTypes = Array.from(
    new Set(
      events
        .map((ev) => ev.type?.trim())
        .filter((t): t is string => Boolean(t) && t.toLowerCase() !== 'all')
    )
  );

  const categoryTabs = ['All', ...dynamicEventTypes];

  const filtered = events.filter((ev) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ev.title.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q) ||
      ev.type.toLowerCase().includes(q);

    const matchesTab =
      activeTab === 'All' ||
      ev.type.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. Page hero banner */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <span className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-2 block">
            Sangham Gatherings & Celebrations
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Community Events</h1>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl leading-relaxed">
            Stay updated with the latest events, celebrations, and gatherings loaded live from our Sangham Sheet.
          </p>
        </div>
      </section>

      {/* 2. Search & Dynamic Event Types Filter bar */}
      <div className="bg-white border-b border-brand-border sticky top-16 z-40 shadow-xs py-3.5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, venue, or topics..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-brand-border rounded-lg text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
              />
            </div>

            {/* Dynamic Event Types Filter Tabs & Sync button */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {dynamicEventTypes.length > 0 &&
                categoryTabs.map((tab) => {
                  const isActive = activeTab.toLowerCase() === tab.toLowerCase();
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-brand-red text-white shadow-xs'
                          : 'bg-gray-100 text-brand-dark hover:bg-gray-200'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}

              <button
                type="button"
                onClick={fetchEvents}
                disabled={loading}
                title="Refresh from Google Sheet"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-border rounded-lg text-xs font-semibold text-brand-dark hover:bg-slate-100 transition-colors shrink-0 disabled:opacity-50 ml-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-red ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync Sheet</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Events Grid */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs text-brand-muted font-medium">
            Showing <span className="font-bold text-brand-dark">{filtered.length}</span> events
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Connected</span>
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-brand-border p-8 max-w-lg mx-auto">
            <CalendarCheck className="w-12 h-12 text-brand-muted/40 mx-auto mb-3" />
            <p className="text-brand-dark font-serif font-bold text-lg mb-1">
              {searchQuery ? 'No matching events found' : 'No events scheduled yet'}
            </p>
            <p className="text-brand-muted text-sm">
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'Any event details added to your Google Sheet will appear here live.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event) => (
              <article
                key={event.id}
                className="bg-white rounded-2xl border border-brand-border/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1"
              >
                {/* Media header - Click to open full photo */}
                <div className="relative">
                  <EventCardImage
                    src={event.image}
                    title={event.title}
                    onClick={
                      event.image
                        ? () => setFullScreenPhoto({ url: event.image!, title: event.title })
                        : () => setSelectedEvent(event)
                    }
                  />

                  {/* Category Pill */}
                  <div className="absolute top-3.5 left-3.5 pointer-events-none">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs ${getCategoryColor(
                        event.type
                      )}`}
                    >
                      {event.type}
                    </span>
                  </div>

                  {/* Date Badge */}
                  {(event.month || event.day) && (
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 shadow-md text-center min-w-[50px] border border-white/60 pointer-events-none">
                      <span className="block text-[10px] font-bold text-brand-red uppercase tracking-wider leading-none">
                        {event.month}
                      </span>
                      <span className="block text-lg font-serif font-bold text-brand-dark leading-tight">
                        {event.day}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    {/* Meta info: Location and Time */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-brand-muted mb-2.5">
                      {event.location && (
                        <span className="inline-flex items-center gap-1 font-medium text-brand-dark">
                          <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                          <span>{event.location}</span>
                        </span>
                      )}
                      {event.time && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                          <span>{event.time}</span>
                        </span>
                      )}
                    </div>

                    {/* Title - Click opens expanded details */}
                    <h3
                      onClick={() => setSelectedEvent(event)}
                      className="font-serif font-bold text-brand-dark text-lg mb-2 group-hover:text-brand-red transition-colors line-clamp-2 cursor-pointer"
                      title="Click to view full event details"
                    >
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-brand-muted text-xs leading-relaxed line-clamp-3 mb-4">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Card bottom bar: Date & Event Details button */}
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-brand-muted mt-auto">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-brand-red" />
                      <span>{event.date || 'TBD'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className="text-brand-red font-semibold hover:underline cursor-pointer inline-flex items-center gap-1 group/btn"
                    >
                      <span>Event Details</span>
                      <span className="group-hover/btn:translate-x-0.5 transition-transform">&rarr;</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 4. Expanded Event Details Modal */}
      {selectedEvent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-brand-border/80 my-auto transform transition-all relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header image if present (click to open full photo) */}
            {selectedEvent.image && (
              <div
                className="relative h-60 sm:h-72 w-full bg-brand-cream cursor-zoom-in group overflow-hidden shrink-0"
                onClick={() =>
                  setFullScreenPhoto({
                    url: selectedEvent.image!,
                    title: selectedEvent.title,
                  })
                }
                title="Click to view full photo"
              >
                <Image
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  fill
                  unoptimized
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Click to view full photo</span>
                </div>
              </div>
            )}

            {/* Close Button top-right */}
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-grow">
              {/* Category pill & date badge */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${getCategoryColor(
                    selectedEvent.type
                  )}`}
                >
                  {selectedEvent.type}
                </span>

                <span className="text-xs font-medium text-brand-muted flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-brand-red" />
                  <span>{selectedEvent.date || 'Date to be announced'}</span>
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-brand-dark leading-snug">
                {selectedEvent.title}
              </h2>

              {/* Meta Grid (Date, Time, Location) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-brand-border/60 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-gray-500 text-[11px] font-semibold uppercase">Event Date</span>
                    <span className="font-semibold text-brand-dark">{selectedEvent.date || 'TBD'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-brand-muted shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-gray-500 text-[11px] font-semibold uppercase">Event Time</span>
                    <span className="font-semibold text-brand-dark">{selectedEvent.time || 'Time TBD'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-gray-500 text-[11px] font-semibold uppercase">Venue / Location</span>
                    <span className="font-semibold text-brand-dark">{selectedEvent.location || 'Nizamabad'}</span>
                  </div>
                </div>
              </div>

              {/* Full Description with newlines and quotes preserved */}
              {selectedEvent.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Event Details &amp; Highlights
                  </h4>
                  <div className="p-4 bg-brand-cream/40 rounded-2xl border border-brand-border/60 text-sm leading-relaxed text-brand-dark whitespace-pre-line font-normal">
                    {selectedEvent.description}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between shrink-0">
              {selectedEvent.image ? (
                <button
                  type="button"
                  onClick={() =>
                    setFullScreenPhoto({
                      url: selectedEvent.image!,
                      title: selectedEvent.title,
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-red hover:underline cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Open Full Photo</span>
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 rounded-xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Fullscreen Photo Lightbox Modal (Opens photo fully) */}
      {fullScreenPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in"
          onClick={() => setFullScreenPhoto(null)}
        >
          {/* Top Bar */}
          <div
            className="p-4 sm:p-6 flex items-center justify-between text-white border-b border-white/10 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base sm:text-lg text-white truncate max-w-xs sm:max-w-md">
                {fullScreenPhoto.title}
              </span>
              <span className="text-xs text-gray-400">Full Resolution Image</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={fullScreenPhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Open full resolution in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={() => setFullScreenPhoto(null)}
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
                src={fullScreenPhoto.url}
                alt={fullScreenPhoto.title}
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
    </div>
  );
}
