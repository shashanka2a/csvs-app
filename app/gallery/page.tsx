import type { Metadata } from 'next';
import Image from 'next/image';
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
    url: 'https://images.unsplash.com/photo-1791988913635-74ced97e6a95?w=600&q=80',
    width: 600,
    height: 400,
    title: 'Temple Bells & Floral Garlands',
    tag: 'Cultural',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1669394377141-490dc8776678?w=600&q=80',
    width: 600,
    height: 300,
    title: 'Karthika Deepotsavam',
    tag: 'Festivals',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80',
    width: 600,
    height: 350,
    title: 'Kalyana Mahotsavam Rituals',
    tag: 'Weddings',
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1508261301902-127bcfb92787?w=600&q=80',
    width: 600,
    height: 350,
    title: 'Traditional Lamps & Utsavam',
    tag: 'Festivals',
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1575989762363-c7ce0137427a?w=600&q=80',
    width: 600,
    height: 300,
    title: 'Deepavali Pooja Lights',
    tag: 'Festivals',
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?w=600&q=80',
    width: 600,
    height: 400,
    title: 'Pushpalankara Utsavam',
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
