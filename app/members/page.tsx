import type { Metadata } from 'next';
import Image from 'next/image';
import { User } from 'lucide-react';
import MembersSearch from '@/components/MembersSearch';

export const metadata: Metadata = {
  title: 'Members',
  description: 'Explore community members of Chattada Sri Vaishnava Sangham across Telangana.',
};

interface Member {
  name: string;
  photo: string | null;
  district: string;
  mandal: string;
  joined: number;
}

const stats = [
  { value: '5,000+', label: 'Members' },
  { value: '12', label: 'Districts' },
  { value: '50+', label: 'Mandals' },
  { value: '2010', label: 'Est. Year' },
];

const members: Member[] = [
  {
    name: 'Ramesh Kumar',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    district: 'Nizamabad',
    mandal: 'Nizamabad Central',
    joined: 2018,
  },
  {
    name: 'Srinivas V.',
    photo: null,
    district: 'Nizamabad',
    mandal: 'Nizamabad Rural',
    joined: 2020,
  },
  {
    name: 'Lakshmi Devi',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    district: 'Nizamabad',
    mandal: 'Nizamabad',
    joined: 2015,
  },
  {
    name: 'Venkatesh P.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    district: 'Armoor',
    mandal: 'Armoor Town',
    joined: 2019,
  },
  {
    name: 'Padmavathi S.',
    photo: null,
    district: 'Bodhan',
    mandal: 'Bodhan East',
    joined: 2021,
  },
  {
    name: 'Ravi Shankar',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    district: 'Nirmal',
    mandal: 'Nirmal Town',
    joined: 2017,
  },
  {
    name: 'Anitha Reddy',
    photo: null,
    district: 'Armoor',
    mandal: 'Armoor West',
    joined: 2022,
  },
  {
    name: 'Suresh Babu',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    district: 'Nizamabad',
    mandal: 'Nizamabad North',
    joined: 2016,
  },
];

export default function MembersPage() {
  return (
    <main className="min-h-screen bg-brand-cream/30">
      {/* 1. Hero banner */}
      <section className="bg-brand-red text-white py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center md:text-left">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
            Our Community Members
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl">
            Connect with members of our Sangham across different districts and mandals of Telangana.
          </p>
        </div>
      </section>

      {/* 2. Stats bar */}
      <section className="bg-brand-dark text-white py-6">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-3xl font-bold text-brand-gold">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Search/filter row */}
      <MembersSearch />

      {/* 4. Members grid */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className="bg-white rounded-xl border border-brand-border shadow-soft hover:shadow-card transition-shadow p-6 text-center flex flex-col justify-between"
            >
              <div>
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-brand-cream shadow-sm flex items-center justify-center">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={96}
                      height={96}
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-cream flex items-center justify-center">
                      <User className="text-brand-muted w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-bold text-brand-dark text-lg mb-0.5">
                  {member.name}
                </h3>

                {/* District badge */}
                <div>
                  <span className="inline-block text-xs bg-brand-red/10 text-brand-red font-semibold px-2 py-0.5 rounded-full mb-1">
                    {member.district}
                  </span>
                </div>

                {/* Mandal */}
                <p className="text-xs text-brand-muted mb-1">{member.mandal}</p>

                {/* Joined */}
                <p className="text-xs text-brand-muted">
                  Member since {member.joined}
                </p>
              </div>

              {/* View Profile button */}
              <button
                type="button"
                className="mt-3 w-full border border-brand-border text-brand-dark text-sm py-1.5 rounded-md hover:bg-brand-cream hover:border-brand-red hover:text-brand-red transition-colors"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>

        {/* 5. Pagination row */}
        <div className="container mx-auto py-8 text-center">
          <p className="text-brand-muted text-sm text-center mb-4">
            Showing 8 of 5,000+ members
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              className="w-9 h-9 rounded-md bg-brand-red text-white text-sm font-medium flex items-center justify-center shadow-sm"
              aria-current="page"
            >
              1
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-md bg-white border border-brand-border text-brand-dark hover:bg-brand-cream text-sm font-medium flex items-center justify-center transition-colors"
            >
              2
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-md bg-white border border-brand-border text-brand-dark hover:bg-brand-cream text-sm font-medium flex items-center justify-center transition-colors"
            >
              3
            </button>
            <span className="w-9 h-9 flex items-center justify-center text-brand-muted text-sm select-none">
              …
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
