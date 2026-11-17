import Image from "next/image";
import Link from "next/link";

export default function GallerySection() {
  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-brand-red font-bold mb-4">
            Insights
          </h2>
          <p className="text-brand-muted">
            Discover highlights from our gallery showcasing incredible moments.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto mb-10">
          {/* Left — large image */}
          <div className="relative group overflow-hidden rounded-xl h-64 md:h-full bg-brand-cream border border-brand-border">
            <Image
              src="https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Community Event"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <h4 className="text-white font-bold text-lg">
                Community Gatherings
              </h4>
            </div>
          </div>

          {/* Right — two stacked images */}
          <div className="grid grid-rows-2 gap-4">
            {/* Top */}
            <div className="relative group overflow-hidden rounded-xl h-48 md:h-64 bg-brand-cream border border-brand-border">
              <Image
                src="https://images.unsplash.com/photo-1508261301902-127bcfb92787?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Diwali"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <h4 className="text-white font-bold text-lg">
                  Diwali Celebrations
                </h4>
              </div>
            </div>

            {/* Bottom */}
            <div className="relative group overflow-hidden rounded-xl h-48 md:h-64 bg-brand-cream border border-brand-border">
              <Image
                src="https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Vinayaka Chavithi"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <h4 className="text-white font-bold text-lg">
                  Vinayaka Chavithi
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-block bg-brand-red hover:bg-brand-redhover text-white font-medium px-8 py-2.5 rounded-md transition-colors shadow-sm"
          >
            Explore Full Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}
