'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarCheck,
  MapPin,
  CalendarDays,
  Clock,
  RefreshCw,
  CheckCircle2,
  Search,
} from 'lucide-react';
import type { SanghamEvent } from '@/app/api/events/route';

const INITIAL_EVENTS: SanghamEvent[] = [];

function getCategoryColor(type: string): string {
  const t = (type || '').toLowerCase();
  if (t.includes('cultur')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (t.includes('matrimon')) return 'bg-pink-100 text-pink-800 border-pink-200';
  if (t.includes('spirit')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (t.includes('celeb')) return 'bg-rose-100 text-rose-800 border-rose-200';
  return 'bg-blue-100 text-blue-800 border-blue-200';
}

function EventCardImage({ src, title }: { src?: string; title: string }) {
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
      <div className="relative h-52 w-full overflow-hidden bg-brand-cream">
        <Image
          src={imgSrc}
          alt={title}
          fill
          unoptimized
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={handleImageError}
        />
      </div>
    );
  }

  return (
    <div className="h-52 w-full bg-gradient-to-br from-brand-cream to-amber-50/50 flex flex-col items-center justify-center border-b border-brand-border/60">
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

  const fetchEvents = async () => {
    setLoading(true);
    try {
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
  }, []);

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
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Community Events</h1>
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
            <span>Connected to Events Sheet</span>
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
                {/* Media header */}
                <div className="relative">
                  <EventCardImage src={event.image} title={event.title} />

                  {/* Category Pill */}
                  <div className="absolute top-3.5 left-3.5">
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
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 shadow-md text-center min-w-[50px] border border-white/60">
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

                    <h3 className="font-serif font-bold text-brand-dark text-lg mb-2 group-hover:text-brand-red transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-brand-muted text-xs leading-relaxed line-clamp-3 mb-4">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-brand-muted mt-auto">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-brand-red" />
                      <span>{event.date || 'TBD'}</span>
                    </span>
                    <Link
                      href="/contact"
                      className="text-brand-red font-semibold hover:underline"
                    >
                      Sangham Details →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
