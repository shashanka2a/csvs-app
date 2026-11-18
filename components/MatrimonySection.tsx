import Image from "next/image";
import Link from "next/link";
import { CircleCheck } from "lucide-react";

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
              src="https://www.brides.com/thmb/SIRJavkmShzT9JiP-MxStQIdX_4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(532x0:534x2)/Main-Hindu-Wedding-Traditions-Stephanie-Velez-6cf14a902ea947c09dc0722d29a9224a.jpg"
              alt="Traditional Matrimony Kalyana Ceremony"
              width={800}
              height={400}
              className="rounded-xl shadow-card object-cover w-full h-[400px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
