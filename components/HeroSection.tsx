import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="hero-bg h-[500px] flex items-center relative">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-3 block drop-shadow-md">
            Welcome to Chattada Sri Vaishnava Sangham
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-serif font-bold mb-4 leading-tight">
            All About{' '}
            <span className="italic">Our Community</span>
          </h1>
          <p className="text-white/90 text-lg mb-8 font-medium max-w-lg leading-relaxed">
            Bringing our community together across Telangana — connecting families, celebrating our heritage, and supporting one another.
          </p>
          <Link
            href="/members"
            className="inline-block bg-brand-red hover:bg-brand-redhover text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-lg border border-brand-red/50"
          >
            Explore Community
          </Link>
        </div>
      </div>
    </section>
  );
}
