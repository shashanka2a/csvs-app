import Image from "next/image";
import Link from "next/link";
import { CircleCheck, Gem } from "lucide-react";

export default function MatrimonySection() {
  return (
    <section
      id="matrimony"
      className="py-20 bg-brand-cream border-y border-brand-border/60"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-brand-dark font-bold mb-6 leading-tight">
              Your Journey{" "}
              <span className="text-brand-red">Begins Here</span>
            </h2>

            <p className="text-brand-dark/80 leading-relaxed mb-8">
              Finding the right life partner is one of life&apos;s most
              important journeys. Our matrimony services connect Sri Vaishnava
              families with verified, genuine profiles — making your search
              meaningful, safe, and successful.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "Verified Profiles for Genuine Matches",
                "Easy and Secure Registration",
                "Advanced Search to Find Your Perfect Match",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CircleCheck className="text-brand-red text-xl shrink-0 w-5 h-5" />
                  <span className="text-brand-dark/80">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/matrimony"
              className="inline-block text-center bg-brand-red hover:bg-brand-redhover text-white font-medium px-8 py-3 rounded-md transition-colors shadow-sm w-full md:w-auto"
            >
              Explore Matrimony
            </Link>
          </div>

          {/* Right column */}
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1552589578-8cfbc443ceb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Matrimony Ceremony"
              width={800}
              height={400}
              className="rounded-xl shadow-card object-cover w-full h-[400px]"
            />

            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-brand-border/50 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-cream rounded-full flex items-center justify-center text-brand-gold text-2xl">
                  <Gem className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark text-sm">
                    Trusted by 5000+
                  </h4>
                  <p className="text-xs text-brand-muted">Families worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
