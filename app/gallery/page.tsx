import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ZoomIn } from 'lucide-react';
import GalleryFilter from '@/components/GalleryFilter';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos and memories from CSVS community events, festivals, and gatherings.',
};

interface GalleryItem {
  id: number;
  url: string;
  width: number;
  height: number;
  title: string;
  tag: 'Festivals' | 'Weddings' | 'Community' | 'Cultural';
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1508261301902-127bcfb92787?w=600&q=80',
    width: 600,
    height: 300,
    title: 'Diwali 2025',
    tag: 'Festivals',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1552589578-8cfbc443ceb6?w=600&q=80',
    width: 600,
    height: 400,
    title: 'Wedding Ceremony',
    tag: 'Weddings',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=600&q=80',
    width: 600,
    height: 250,
    title: 'Community Meetup',
    tag: 'Community',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?w=600&q=80',
    width: 600,
    height: 350,
    title: 'Vinayaka Chavithi',
    tag: 'Cultural',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?w=600&q=80',
    width: 600,
    height: 300,
    title: 'Annual Gathering',
    tag: 'Community',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    width: 600,
    height: 400,
    title: 'Member Portrait',
    tag: 'Community',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    width: 600,
    height: 300,
    title: 'Community Leader',
    tag: 'Community',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    width: 600,
    height: 250,
    title: 'Member Profile',
    tag: 'Community',
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    width: 600,
    height: 350,
    title: 'Member Portrait',
    tag: 'Community',
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    width: 600,
    height: 300,
    title: 'Community Member',
    tag: 'Community',
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    width: 600,
    height: 400,
    title: 'Festival Celebration',
    tag: 'Festivals',
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=600&q=80',
    width: 600,
    height: 280,
    title: 'Group Photo',
    tag: 'Community',
  },
];

export default function GalleryPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Our Gallery</h1>
          <p className="text-gray-400">
            Cherished moments from our community events, festivals, and celebrations.
          </p>
          <div className="text-sm text-gray-500 mt-4">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-400">Gallery</span>
          </div>
        </div>
      </section>

      {/* 2. Category filter tabs */}
      <div className="sticky top-16 z-40 bg-white border-b border-brand-border">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <GalleryFilter />
        </div>
      </div>

      {/* 3. Gallery masonry grid */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid relative group overflow-hidden rounded-xl border border-brand-border cursor-pointer"
            >
              <Image
                src={item.url}
                alt={item.title}
                width={item.width}
                height={item.height}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white text-sm font-medium">
                {item.title}
              </div>
            </div>
          ))}
        </div>

        {/* 4. Load More button */}
        <div className="text-center py-8">
          <button
            type="button"
            className="bg-white border border-brand-border text-brand-dark hover:bg-brand-cream font-medium px-8 py-2.5 rounded-md transition-colors"
          >
            Load More
          </button>
        </div>
      </section>
    </div>
  );
}
