import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, User, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Read articles, announcements, and community stories from Chattada Sri Vaishnava Sangham.',
};

interface Article {
  id: number;
  tag: 'Announcement' | 'Community' | 'Events' | 'Matrimony' | 'Spiritual' | 'History';
  title: string;
  date: string;
  author: string;
  img: string;
  excerpt: string;
}

const tagBadgeColors: Record<string, string> = {
  Announcement: 'bg-brand-red/10 text-brand-red',
  Community: 'bg-blue-100 text-blue-700',
  Events: 'bg-orange-100 text-orange-700',
  Matrimony: 'bg-pink-100 text-pink-700',
  Spiritual: 'bg-purple-100 text-purple-700',
  History: 'bg-emerald-100 text-emerald-700',
};

const articles: Article[] = [
  {
    id: 1,
    tag: 'Community',
    title: 'Preserving Sri Vaishnava Traditions in Modern Times',
    date: 'Nov 10, 2026',
    author: 'Pandit Ramaswamy',
    img: 'https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?w=200&q=80',
    excerpt: 'An exploration of how our community upholds ancient traditions while adapting to modern life.',
  },
  {
    id: 2,
    tag: 'Events',
    title: 'Highlights from the Diwali 2025 Celebration in Nizamabad',
    date: 'Oct 30, 2025',
    author: 'CSVS Team',
    img: 'https://images.unsplash.com/photo-1508261301902-127bcfb92787?w=200&q=80',
    excerpt: 'A recap of the grand Diwali event held at Nizamabad, with over 500 families attending.',
  },
  {
    id: 3,
    tag: 'Matrimony',
    title: 'Success Story: How CSVS Helped Us Find Each Other',
    date: 'Sep 20, 2025',
    author: 'Priya & Arun',
    img: 'https://images.unsplash.com/photo-1552589578-8cfbc443ceb6?w=200&q=80',
    excerpt: 'A heartwarming story of how two families connected through the CSVS matrimony portal.',
  },
  {
    id: 4,
    tag: 'Spiritual',
    title: 'The Significance of Vaikunta Ekadasi in Our Community',
    date: 'Jan 5, 2026',
    author: 'Sri Venkateswara Temple',
    img: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=200&q=80',
    excerpt: 'Understanding the spiritual importance of Vaikunta Ekadasi and how to observe it properly.',
  },
  {
    id: 5,
    tag: 'History',
    title: 'The Origins and Heritage of the Chattada Community',
    date: 'Mar 15, 2025',
    author: 'CSVS Historian',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    excerpt: 'A deep dive into the rich history and traditions that define the Chattada Sri Vaishnava community.',
  },
];

const categories = [
  { name: 'Community', count: 12 },
  { name: 'Events', count: 8 },
  { name: 'Matrimony', count: 5 },
  { name: 'Spiritual', count: 10 },
  { name: 'History', count: 6 },
  { name: 'Announcements', count: 4 },
];

const recentArticles = [
  {
    title: 'Preserving Sri Vaishnava Traditions in Modern Times',
    date: 'Nov 10, 2026',
  },
  {
    title: 'Highlights from the Diwali 2025 Celebration in Nizamabad',
    date: 'Oct 30, 2025',
  },
  {
    title: 'The Significance of Vaikunta Ekadasi in Our Community',
    date: 'Jan 5, 2026',
  },
];

export default function ArticlesPage() {
  return (
    <div>
      {/* 1. Hero */}
      <section className="bg-brand-cream border-b border-brand-border py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mb-3">
            Articles &amp; Announcements
          </h1>
          <p className="text-brand-muted max-w-2xl text-base md:text-lg">
            Community news, spiritual insights, and announcements from our Sangham.
          </p>
        </div>
      </section>

      {/* 2. Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Col (Articles List) */}
          <div className="lg:col-span-2">
            {/* Featured Article */}
            <article className="bg-white rounded-xl shadow-card border border-brand-border overflow-hidden mb-8">
              <div className="relative h-56 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?w=800&q=80"
                  alt="Featured Article"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-6">
                <span className="bg-brand-red/10 text-brand-red text-xs font-bold uppercase px-2 py-0.5 rounded-full inline-block">
                  Announcement
                </span>
                <h2 className="font-serif text-2xl font-bold text-brand-dark mt-2 mb-3">
                  Annual Sangham Gathering 2026 — Save the Date
                </h2>
                <p className="text-brand-muted leading-relaxed mb-4">
                  Join us for our largest annual gathering celebrating our rich heritage, community
                  achievements, and future initiatives. Mark your calendars for an unforgettable day
                  of fellowship, spiritual discourse, and cultural programs.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-4 text-xs text-brand-muted">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" />
                      Nov 15, 2026
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      CSVS Committee
                    </span>
                  </div>
                  <Link
                    href="#"
                    className="text-brand-red font-semibold hover:underline text-sm inline-flex items-center"
                  >
                    Read More &rarr;
                  </Link>
                </div>
              </div>
            </article>

            {/* List of 5 Article Cards */}
            <div className="space-y-4">
              {articles.map((article) => {
                const badgeColor =
                  tagBadgeColors[article.tag] || 'bg-gray-100 text-gray-700';
                return (
                  <article
                    key={article.id}
                    className="flex gap-4 items-start bg-white rounded-xl border border-brand-border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={article.img}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full inline-block mb-1.5 ${badgeColor}`}
                      >
                        {article.tag}
                      </span>
                      <h3 className="font-bold text-brand-dark mb-1 hover:text-brand-red transition-colors cursor-pointer text-base leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-brand-muted text-sm line-clamp-2 mb-2">
                        {article.excerpt}
                      </p>
                      <div className="text-xs text-brand-muted flex gap-3 items-center">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {article.date}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {article.author}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right Col (Sidebar) */}
          <aside className="space-y-6">
            {/* a) Search Box */}
            <div className="bg-white rounded-xl border border-brand-border p-5">
              <h3 className="font-bold text-brand-dark mb-3 text-lg">Search</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="flex-1 px-3 py-2 border border-brand-border rounded-lg text-sm text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-red placeholder:text-brand-muted"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-brand-red text-white text-sm font-medium rounded-lg hover:bg-brand-redhover transition-colors flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>

            {/* b) Categories */}
            <div className="bg-white rounded-xl border border-brand-border p-5">
              <h3 className="font-bold text-brand-dark mb-3 text-lg">Categories</h3>
              <ul className="divide-y divide-brand-border/50">
                {categories.map((cat) => (
                  <li
                    key={cat.name}
                    className="flex justify-between py-2 border-b border-brand-border/50 last:border-0 text-sm text-brand-dark hover:text-brand-red cursor-pointer transition-colors"
                  >
                    <span>{cat.name}</span>
                    <span className="text-brand-muted text-xs bg-brand-cream px-2 py-0.5 rounded-full border border-brand-border">
                      {cat.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* c) Recent Articles */}
            <div className="bg-white rounded-xl border border-brand-border p-5">
              <h3 className="font-bold text-brand-dark mb-3 text-lg">Recent</h3>
              <div className="space-y-3">
                {recentArticles.map((recent, idx) => (
                  <div key={idx} className="group">
                    <p className="text-sm font-medium text-brand-dark hover:text-brand-red cursor-pointer transition-colors line-clamp-2">
                      {recent.title}
                    </p>
                    <span className="text-xs text-brand-muted block mt-1">
                      {recent.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* d) Newsletter CTA */}
            <div className="bg-brand-red text-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold mb-2 text-lg">Stay Updated</h3>
              <p className="text-white/80 text-sm mb-3">
                Subscribe to our newsletter for the latest community news, spiritual insights, and event updates.
              </p>
              <div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white rounded-md px-3 py-2 text-brand-dark text-sm w-full mb-2 placeholder:text-brand-muted focus:outline-none"
                />
                <button
                  type="button"
                  className="bg-brand-dark text-white w-full py-2 rounded-md text-sm font-medium hover:bg-brand-dark/90 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
