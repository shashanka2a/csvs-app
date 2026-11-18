import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, MapPin, Clock, ArrowRight } from 'lucide-react';

interface FeaturedEvent {
  id: number;
  title: string;
  month: string;
  day: string;
  year: string;
  time: string;
  location: string;
  category: 'Spiritual' | 'Community' | 'Cultural';
  description: string;
  image: string;
}

const featuredEvents: FeaturedEvent[] = [
  {
    id: 1,
    title: 'Sri Vaishnava Pravachanam & Satsang',
    month: 'DEC',
    day: '05',
    year: '2026',
    time: '10:00 AM – 1:00 PM',
    location: 'Nizamabad Central',
    category: 'Spiritual',
    description:
      'Sacred spiritual discourse on Sri Vaishnava traditions and philosophy, followed by traditional prasadam distribution.',
    image:
      'https://images.unsplash.com/photo-1669394377141-490dc8776678?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Community Sadas & Annual Sangham Meet',
    month: 'DEC',
    day: '15',
    year: '2026',
    time: '4:00 PM – 7:30 PM',
    location: 'Bodhan Mandal',
    category: 'Community',
    description:
      'Annual regional gathering of Sangham conveners, families, and youth to discuss welfare initiatives and upcoming programs.',
    image:
      'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    title: 'Karthika Deepotsavam & Bhajan Sandhya',
    month: 'JAN',
    day: '08',
    year: '2027',
    time: '6:00 PM – 9:00 PM',
    location: 'Armoor Town',
    category: 'Cultural',
    description:
      'Grand community celebration with sacred deepam lighting, devotional bhajans, and Sri Vishnu Sahasranama parayanam.',
    image:
      'https://images.unsplash.com/photo-1508261301902-127bcfb92787?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

const categoryColorMap: Record<FeaturedEvent['category'], string> = {
  Spiritual: 'bg-amber-100 text-amber-800 border-amber-200',
  Community: 'bg-blue-100 text-blue-800 border-blue-200',
  Cultural: 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function EventsSection() {
  return (
    <section id="events" className="py-20 bg-white border-t border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-2 block">
            Upcoming Gatherings &amp; Utsavam
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-dark font-bold mb-4">
            Sangham Events &amp; Festivities
          </h2>
          <p className="text-brand-muted text-base md:text-lg leading-relaxed">
            Participate in our vibrant community meetings, traditional festivals, and sacred discourses
            bringing families together across Nizamabad, Armoor, and Bodhan.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredEvents.map((event) => (
            <article
              key={event.id}
              className="bg-white rounded-2xl overflow-hidden border border-brand-border/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              {/* Media header */}
              <div className="relative h-52 overflow-hidden bg-brand-cream">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Category Pill */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${categoryColorMap[event.category]}`}
                  >
                    {event.category}
                  </span>
                </div>

                {/* Date Square */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 shadow-md text-center min-w-[56px] border border-white/40">
                  <span className="block text-[11px] font-bold text-brand-red uppercase tracking-wider leading-none">
                    {event.month}
                  </span>
                  <span className="block text-2xl font-serif font-bold text-brand-dark leading-tight">
                    {event.day}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-grow justify-between">
                <div>
                  {/* Meta details */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-brand-muted mb-3">
                    <span className="inline-flex items-center gap-1.5 font-medium text-brand-dark">
                      <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                      {event.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                      {event.time}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-xl text-brand-dark mb-2.5 group-hover:text-brand-red transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-brand-muted text-sm leading-relaxed mb-6 line-clamp-3">
                    {event.description}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-red hover:text-brand-redhover transition-colors group-hover:translate-x-1 duration-200"
                  >
                    <span>View Event Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-redhover text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-sm text-sm"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Explore All Events &amp; Utsavams</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
