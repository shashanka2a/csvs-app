'use client';

import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  ArrowRight,
  Search,
  Building2,
  CheckCircle2,
} from 'lucide-react';

const memberFeatures = [
  {
    icon: MapPin,
    badge: 'Regional Network',
    title: 'District & Mandal Network',
    description:
      'Connect seamlessly with community members across Nizamabad, Armoor, and Bodhan. Discover families and professionals rooted in our shared heritage.',
    highlights: ['Active mandal coverage', 'Local community meetups', 'Seamless regional search'],
  },
  {
    icon: ShieldCheck,
    badge: 'Trust & Privacy',
    title: 'Verified Member Directory',
    description:
      'Every profile in our Sangham directory is authentic and verified by local coordinators to maintain privacy, trust, and a secure environment.',
    highlights: ['Community-verified members', 'Protected personal information', 'Zero spam or fake profiles'],
  },
  {
    icon: HeartHandshake,
    badge: 'Community Welfare',
    title: 'Mutual Aid & Solidarity',
    description:
      'Fostering solidarity through mutual assistance for family milestones, student education guidance, community welfare schemes, and emergency aid.',
    highlights: ['Educational guidance', 'Welfare & emergency aid', 'Family milestone support'],
  },
  {
    icon: Building2,
    badge: 'Grassroots Leadership',
    title: 'Mandal Conveners & Guidance',
    description:
      'Direct access to Sangham conveners, committee leaders, and respected elders who actively coordinate local initiatives and community welfare.',
    highlights: ['Dedicated mandal conveners', 'Transparent leadership', 'Grassroots event coordination'],
  },
];

const coverageAreas = [
  { name: 'Nizamabad Central', desc: 'District headquarters & committee hub' },
  { name: 'Armoor Town & Mandals', desc: 'Active cultural & youth chapters' },
  { name: 'Bodhan & Surroundings', desc: 'Vibrant family network & satsangs' },
];

export default function MembersSection() {
  return (
    <section id="members" className="py-20 bg-slate-50 border-t border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-2 block">
            Our Network &amp; Platform
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-dark font-bold mb-4">
            Community Members Directory
          </h2>
          <p className="text-brand-muted text-base md:text-lg leading-relaxed">
            Our Sangham connects thousands of Chattada Sri Vaishnava families across Telangana.
            Explore our verified directory, connect with local conveners, and strengthen our collective bond.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {memberFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white rounded-2xl p-7 border border-brand-border/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-cream text-brand-red border border-brand-red/10">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-xl text-brand-dark mb-2 group-hover:text-brand-red transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-brand-muted text-sm leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <ul className="space-y-2">
                    {feat.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-xs text-brand-dark font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Regional Coverage Bar */}
        <div className="bg-white rounded-2xl p-8 border border-brand-border/80 shadow-sm mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-1 block">
                Regional Hubs
              </span>
              <h3 className="font-serif text-2xl font-bold text-brand-dark">
                Covering Key Mandals &amp; Towns
              </h3>
              <p className="text-brand-muted text-sm mt-1">
                Active Sangham representation and member directories available for each region.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              {coverageAreas.map((area) => (
                <div
                  key={area.name}
                  className="bg-brand-cream/60 rounded-xl p-4 border border-brand-red/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-brand-red shrink-0" />
                    <span className="font-bold text-sm text-brand-dark">{area.name}</span>
                  </div>
                  <p className="text-xs text-brand-muted pl-6">{area.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="bg-gradient-to-r from-brand-dark to-[#1E2530] text-white rounded-2xl p-8 md:p-12 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">
                Access the Full Community Directory
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Search verified members by mandal or name, connect with local conveners, and participate in community initiatives.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
              <Link
                href="/members"
                className="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-redhover text-white font-medium px-7 py-3.5 rounded-lg transition-colors shadow-md text-sm"
              >
                <Search className="w-4 h-4" />
                <span>Search Members Directory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 rounded-lg transition-colors border border-white/20 text-sm"
              >
                <span>Contact Coordinator</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
