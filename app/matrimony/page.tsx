import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Users, HeartHandshake, Lock, Phone, MapPin, Mail, Sparkles, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Matrimony (Coming Soon)',
  description: 'CSVS Matrimony portal for the Chattada Sri Vaishnava Sangham community is launching soon.',
};

export default function MatrimonyPage() {
  return (
    <main className="min-h-screen bg-brand-cream/30">
      {/* 1. Hero Banner */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-brand-gold/15 text-brand-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-brand-gold/30">
            <Sparkles className="w-3.5 h-3.5" />
            Launching Soon
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
            CSVS Matrimony Portal
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl">
            A trusted, dedicated matchmaking platform exclusively for the Chattada Sri Vaishnava community.
          </p>
        </div>
      </section>

      {/* 2. Main Coming Soon Showcase */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center">
            {/* Image Side */}
            <div className="relative h-80 md:h-full min-h-[380px] bg-brand-dark">
              <Image
                src="https://www.brides.com/thmb/SIRJavkmShzT9JiP-MxStQIdX_4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(532x0:534x2)/Main-Hindu-Wedding-Traditions-Stephanie-Velez-6cf14a902ea947c09dc0722d29a9224a.jpg"
                alt="Hindu Wedding Traditions - Chattada Sri Vaishnava Kalyanam"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <span className="text-white text-xs font-medium tracking-wide bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                  Traditional Sri Vaishnava Kalyana Samskruthi
                </span>
              </div>
            </div>

            {/* Content Side */}
            <div className="p-8 md:p-10 flex flex-col justify-between">
              <div>
                <span className="text-brand-red font-bold text-xs uppercase tracking-wider mb-2 block">
                  Coming Soon
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-dark mb-4 leading-tight">
                  Bringing Families Together With Trust &amp; Tradition
                </h2>
                <p className="text-brand-muted text-sm leading-relaxed mb-6">
                  We are developing a secure, community-exclusive matrimony platform designed to help Chattada Sri Vaishnava families discover genuine, verified alliances rooted in shared heritage, cultural values, and mutual respect.
                </p>

                {/* Planned Highlights */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-brand-dark">100% Community-Verified</h4>
                      <p className="text-xs text-brand-muted">Authentic family profiles verified through local representatives.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-brand-dark">Privacy &amp; Safety First</h4>
                      <p className="text-xs text-brand-muted">Secure photo and contact sharing strictly with your consent.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HeartHandshake className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-brand-dark">Direct Family Connections</h4>
                      <p className="text-xs text-brand-muted">Connecting parents and elders directly without commercial third parties.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Inquiries CTA */}
              <div className="pt-6 border-t border-brand-border">
                <p className="text-xs text-brand-muted mb-3 font-medium">
                  Have an urgent alliance inquiry or want to register in advance?
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="tel:+919848765051"
                    className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-redhover text-white text-xs font-semibold px-4 py-2.5 rounded-md shadow-sm transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call +91 98487 65051
                  </a>
                  <Link
                    href="/members"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-dark hover:text-brand-red px-3 py-2 transition-colors"
                  >
                    Contact Sangham <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Contact & Office Information Card */}
          <div className="mt-12 bg-white rounded-xl border border-brand-border p-6 md:p-8 shadow-soft">
            <h3 className="font-serif text-lg font-bold text-brand-dark mb-4">
              Sangham Matrimony Helpdesk &amp; Office
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-brand-dark text-xs uppercase tracking-wider mb-1">Office Address</p>
                  <p className="text-brand-muted">Kanteshwar, Nizamabad, Telangana 503002</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-brand-dark text-xs uppercase tracking-wider mb-1">Phone Assistance</p>
                  <a href="tel:+919848765051" className="text-brand-dark font-medium hover:text-brand-red transition-colors">
                    +91 98487 65051
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-brand-dark text-xs uppercase tracking-wider mb-1">Email Inquiries</p>
                  <a href="mailto:csvsangham@gmail.com" className="text-brand-dark font-medium hover:text-brand-red transition-colors">
                    csvsangham@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
