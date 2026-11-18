import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Images } from 'lucide-react';

export default function GallerySection() {
  return (
    <section id="gallery" className="py-20 bg-slate-50 border-t border-brand-border/60">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-2 block">
            Moments &amp; Memories
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-dark font-bold mb-4">
            Community Gallery
          </h2>
          <p className="text-brand-muted text-base md:text-lg">
            Special moments, celebrations, and gatherings from our Sangham.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-10">
          {/* Left — large image */}
          <div className="relative group overflow-hidden rounded-2xl h-72 md:h-full min-h-[300px] bg-brand-cream border border-brand-border/80 shadow-sm">
            <Image
              src="/images/1.jpg"
              alt="Community Gathering"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-6">
              <h4 className="text-white font-bold text-lg">
                Community Gathering
              </h4>
            </div>
          </div>

          {/* Right — two stacked images */}
          <div className="grid grid-rows-2 gap-5">
            {/* Top */}
            <div className="relative group overflow-hidden rounded-2xl h-48 md:h-56 bg-brand-cream border border-brand-border/80 shadow-sm">
              <Image
                src="/images/2.jpg"
                alt="Festive Celebrations"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-6">
                <h4 className="text-white font-bold text-lg">
                  Festive Celebrations
                </h4>
              </div>
            </div>

            {/* Bottom */}
            <div className="relative group overflow-hidden rounded-2xl h-48 md:h-56 bg-brand-cream border border-brand-border/80 shadow-sm">
              <Image
                src="/images/3.jpg"
                alt="Cultural Events"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-6">
                <h4 className="text-white font-bold text-lg">
                  Cultural Events
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-redhover text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-sm text-sm"
          >
            <Images className="w-4 h-4" />
            <span>View Full Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
