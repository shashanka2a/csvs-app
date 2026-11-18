import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarCheck, MapPin, CalendarDays } from 'lucide-react';
import EventsFilter from '@/components/EventsFilter';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming and past community events of Chattada Sri Vaishnava Sangham.',
};

interface EventItem {
  id: number;
  title: string;
  date: string;
  location: string;
  tag: 'Cultural' | 'Matrimony' | 'Community';
  description: string;
  image?: string;
}

const events: EventItem[] = [
  {
    id: 1,
    title: 'Diwali Mela 2026',
    date: 'Nov 25, 2026',
    location: 'Hyderabad',
    tag: 'Cultural',
    description: 'Grand Diwali celebration with lights, sweets, and cultural programs.',
    image:
      'https://images.unsplash.com/photo-1508261301902-127bcfb92787?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Annual Matrimony Meet',
    date: 'Dec 5, 2026',
    location: 'Nizamabad',
    tag: 'Matrimony',
    description: 'Annual gathering for eligible community members and families seeking alliances.',
    image:
      'https://images.unsplash.com/photo-1552589578-8cfbc443ceb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Community Meetup – Bodhan',
    date: 'Dec 12, 2026',
    location: 'Bodhan',
    tag: 'Community',
    description: 'Monthly community meetup for members in the Bodhan mandal area.',
    image:
      'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    title: 'Vinayaka Chavithi Pooja',
    date: 'Jan 8, 2027',
    location: 'Armoor',
    tag: 'Cultural',
    description: 'Traditional Vinayaka Chavithi pooja with prasadam distribution.',
    image:
      'https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    title: 'Community Gathering – Srinivaspur',
    date: 'Jan 15, 2027',
    location: 'Nizamabad',
    tag: 'Community',
    description: 'Community apartment warming ceremony for new residents.',
  },
  {
    id: 6,
    title: 'Engagement Ceremony',
    date: 'Feb 2, 2027',
    location: 'Hyderabad',
    tag: 'Matrimony',
    description: 'Engagement ceremony hosted by CSVS members in Hyderabad.',
  },
];

const tagStyleMap: Record<EventItem['tag'], string> = {
  Cultural: 'bg-orange-100 text-orange-700',
  Matrimony: 'bg-pink-100 text-pink-700',
  Community: 'bg-blue-100 text-blue-700',
};

export default function EventsPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Page hero banner */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Community Events</h1>
          <p className="text-gray-400">
            Stay updated with the latest events, festivals, and gatherings of our Sangham.
          </p>
        </div>
      </section>

      {/* 2. Filter bar */}
      <div className="bg-white border-b border-brand-border sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3">
          <EventsFilter />
        </div>
      </div>

      {/* 3. Events grid */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <article
              key={event.id}
              className="bg-white rounded-xl shadow-card border border-brand-border/60 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Media header */}
              {event.image ? (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="h-48 bg-brand-cream flex items-center justify-center">
                  <CalendarCheck className="w-16 h-16 text-brand-border" />
                </div>
              )}

              {/* Card body */}
              <div className="p-5">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${tagStyleMap[event.tag]}`}
                >
                  {event.tag}
                </span>

                <h3 className="font-serif font-bold text-brand-dark text-lg mt-2 mb-1">
                  {event.title}
                </h3>

                <p className="text-brand-muted text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-4 text-xs text-brand-muted">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                    {event.date}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href="#"
                  className="text-brand-red text-sm font-semibold hover:underline mt-3 block"
                >
                  Learn More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
