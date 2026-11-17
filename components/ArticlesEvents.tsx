import Link from 'next/link';
import { Newspaper, ChevronRight, ArrowRight, CalendarCheck } from 'lucide-react';

const articles = [
  'Sample title',
  'From Kurnool',
  '1914 translation by H. Rackham',
  'Where can I get some energy?',
  'Where does it come from?',
];

const events = [
  'Apartment Warming',
  'Marriage',
  'Community Meetup',
  'Engagement',
  'Community Meeting',
];

export default function ArticlesEvents() {
  return (
    <section className="py-12 bg-brand-cream relative z-20 -mt-12 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Latest Articles */}
          <div className="bg-white rounded-xl shadow-card border border-brand-border/60 overflow-hidden">
            <div className="bg-brand-red text-white py-4 px-6 flex items-center gap-3">
              <Newspaper className="text-brand-gold" />
              <h3 className="font-bold text-lg font-serif">Latest Articles</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {articles.map((title) => (
                  <li
                    key={title}
                    className="flex items-center gap-3 hover:text-brand-red transition-colors cursor-pointer border-b border-brand-border/50 pb-3"
                  >
                    <ChevronRight className="text-xs text-brand-muted shrink-0" size={16} />
                    <span>{title}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-center">
                <Link
                  href="/articles"
                  className="text-brand-red font-semibold text-sm hover:underline flex items-center justify-center gap-2"
                >
                  View All Articles <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Latest Events */}
          <div className="bg-white rounded-xl shadow-card border border-brand-border/60 overflow-hidden">
            <div className="bg-brand-red text-white py-4 px-6 flex items-center gap-3">
              <CalendarCheck className="text-brand-gold" />
              <h3 className="font-bold text-lg font-serif">Latest Events</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {events.map((event) => (
                  <li
                    key={event}
                    className="flex items-center gap-3 hover:text-brand-red transition-colors cursor-pointer border-b border-brand-border/50 pb-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                    <span>{event}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-center">
                <Link
                  href="/events"
                  className="text-brand-red font-semibold text-sm hover:underline flex items-center justify-center gap-2"
                >
                  View All Events <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
