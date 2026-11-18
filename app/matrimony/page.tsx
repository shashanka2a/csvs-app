import type { Metadata } from 'next';
import Image from 'next/image';
import { Users, ShieldCheck, Gift, User, UserPlus, Search, Heart } from 'lucide-react';
import MatrimonySearch from '@/components/MatrimonySearch';

export const metadata: Metadata = {
  title: 'Matrimony',
  description: 'Find your perfect life partner within the Chattada Sri Vaishnava Sangham community.',
};

interface Profile {
  name: string;
  age: string;
  education: string;
  occupation: string;
  district: string;
  height: string;
}

const PROFILES: Profile[] = [
  {
    name: 'Priya S.',
    age: '26 yrs',
    education: 'M.Tech',
    occupation: 'Software Engineer',
    district: 'Nizamabad',
    height: "5'4\"",
  },
  {
    name: 'Arun K.',
    age: '29 yrs',
    education: 'B.Com',
    occupation: 'Business Owner',
    district: 'Armoor',
    height: "5'9\"",
  },
  {
    name: 'Meera V.',
    age: '24 yrs',
    education: 'B.Sc Nursing',
    occupation: 'Nurse',
    district: 'Bodhan',
    height: "5'2\"",
  },
  {
    name: 'Kiran R.',
    age: '31 yrs',
    education: 'MBA',
    occupation: 'Manager',
    district: 'Hyderabad',
    height: "5'11\"",
  },
  {
    name: 'Divya P.',
    age: '27 yrs',
    education: 'B.Ed',
    occupation: 'Teacher',
    district: 'Nirmal',
    height: "5'3\"",
  },
  {
    name: 'Suresh M.',
    age: '33 yrs',
    education: 'B.Tech',
    occupation: 'Engineer',
    district: 'Nizamabad',
    height: "5'10\"",
  },
];

const STEPS = [
  {
    step: 1,
    icon: UserPlus,
    title: 'Register Free',
    description: 'Create your profile with personal and family details in minutes.',
  },
  {
    step: 2,
    icon: Search,
    title: 'Search & Connect',
    description: 'Browse verified profiles filtered by your preferences.',
  },
  {
    step: 3,
    icon: Heart,
    title: 'Find Your Match',
    description: 'Connect with families and begin your journey together.',
  },
];

export default function MatrimonyPage() {
  return (
    <main className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text & Badges */}
            <div>
              <span className="text-brand-gold text-sm font-bold uppercase tracking-widest mb-3 block">
                Trusted Matrimony
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Find Your Perfect Match
              </h1>
              <p className="text-white/80 mb-6 leading-relaxed">
                Verified profiles from the Chattada Sri Vaishnava Sangham community.
                Connect with families who share your values, traditions, and aspirations.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-gold shrink-0" />
                  <span className="text-sm font-medium text-white/90">Community Profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-gold shrink-0" />
                  <span className="text-sm font-medium text-white/90">Verified Families</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-brand-gold shrink-0" />
                  <span className="text-sm font-medium text-white/90">Free Registration</span>
                </div>
              </div>
            </div>

            {/* Right Column: Search Widget */}
            <div>
              <MatrimonySearch />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Traditional Kalyanam Showcase */}
      <section className="py-12 bg-white border-b border-brand-border/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-brand-cream rounded-2xl border border-brand-border overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center shadow-card">
            <div className="relative h-72 md:h-full min-h-[320px]">
              <Image
                src="/images/matrimony.jpg"
                alt="Hindu Wedding Traditions - Chattada Sri Vaishnava Kalyanam"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 md:p-12">
              <span className="text-brand-red font-semibold text-xs uppercase tracking-wider mb-2 block">
                Sacred Alliances
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-dark mb-4">
                Honoring Sri Vaishnava Wedding Traditions
              </h2>
              <p className="text-brand-muted text-sm leading-relaxed mb-6">
                Rooted in Vedic rituals, mutual respect, and family values, our matrimony platform helps Sri Vaishnava families connect with verified alliances across Telangana and beyond.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-brand-dark">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-brand-red" /> Verified Profiles</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-brand-red" /> Community Centric</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Profiles */}
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <h2 className="font-serif text-3xl font-bold text-brand-dark mb-2 text-center">
          Featured Profiles
        </h2>
        <p className="text-brand-muted text-center mb-10">
          Handpicked profiles from verified community members
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROFILES.map((profile) => (
            <div
              key={profile.name}
              className="bg-white rounded-xl border border-brand-border shadow-soft hover:shadow-card transition-shadow overflow-hidden flex flex-col justify-between"
            >
              {/* Top Colored Band */}
              <div className="h-3 bg-gradient-to-r from-brand-red to-brand-gold" />

              {/* Card Body */}
              <div className="p-6 text-center flex-1 flex flex-col justify-between">
                <div>
                  <div className="bg-brand-cream w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <User className="w-10 h-10 text-brand-muted" />
                  </div>
                  <h3 className="font-bold text-brand-dark text-lg">{profile.name}</h3>
                  <span className="text-xs bg-brand-cream text-brand-muted px-2 py-0.5 rounded-full inline-block mb-3">
                    {profile.age}
                  </span>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-y-1 text-xs text-brand-muted text-left border-t border-brand-border pt-3">
                    <div>
                      <span className="font-medium text-brand-dark">Education:</span> {profile.education}
                    </div>
                    <div>
                      <span className="font-medium text-brand-dark">Occupation:</span> {profile.occupation}
                    </div>
                    <div>
                      <span className="font-medium text-brand-dark">District:</span> {profile.district}
                    </div>
                    <div>
                      <span className="font-medium text-brand-dark">Height:</span> {profile.height}
                    </div>
                  </div>
                </div>

                {/* Divider & CTA */}
                <div>
                  <div className="border-t border-brand-border mt-4" />
                  <button className="w-full mt-4 bg-brand-red text-white py-2 rounded-md text-sm font-medium hover:bg-brand-redhover transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="bg-brand-cream py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center text-brand-dark mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  {/* Step Number Badge */}
                  <div className="w-7 h-7 rounded-full bg-brand-red text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">
                    {item.step}
                  </div>
                  {/* Icon Circle */}
                  <div className="w-16 h-16 rounded-full bg-brand-red/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-brand-red w-7 h-7" />
                  </div>
                  {/* Title & Description */}
                  <h3 className="font-bold text-brand-dark text-lg mb-2">{item.title}</h3>
                  <p className="text-brand-muted text-sm max-w-xs mx-auto">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
