import type { Metadata } from 'next';
import Link from 'next/link';
import { User } from 'lucide-react';
import MembersSearch from '@/components/MembersSearch';

export const metadata: Metadata = {
  title: 'Members',
  description: 'Explore community members of Chattada Sri Vaishnava Sangham across Telangana.',
};

interface Member {
  name: string;
  district: string;
  mandal: string;
  joined: number;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const members: Member[] = [
  {
    name: 'Ramesh Kumar',
    district: 'Nizamabad',
    mandal: 'Nizamabad Central',
    joined: 2018,
  },
  {
    name: 'Srinivas V.',
    district: 'Nizamabad',
    mandal: 'Nizamabad Rural',
    joined: 2020,
  },
  {
    name: 'Lakshmi Devi',
    district: 'Nizamabad',
    mandal: 'Nizamabad',
    joined: 2015,
  },
  {
    name: 'Venkatesh P.',
    district: 'Armoor',
    mandal: 'Armoor Town',
    joined: 2019,
  },
  {
    name: 'Padmavathi S.',
    district: 'Bodhan',
    mandal: 'Bodhan East',
    joined: 2021,
  },
  {
    name: 'Ravi Shankar',
    district: 'Nirmal',
    mandal: 'Nirmal Town',
    joined: 2017,
  },
  {
    name: 'Anitha Reddy',
    district: 'Armoor',
    mandal: 'Armoor West',
    joined: 2022,
  },
  {
    name: 'Suresh Babu',
    district: 'Nizamabad',
    mandal: 'Nizamabad North',
    joined: 2016,
  },
];

export default function MembersPage() {
  return (
    <main className="min-h-screen bg-brand-cream/30">
      {/* 1. Hero banner */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
            Our Community Members
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl">
            Connect with members of our Sangham across different districts and mandals of Telangana.
          </p>
          <div className="text-sm text-gray-500 mt-4">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-400">Members</span>
          </div>
        </div>
      </section>

      {/* 2. Search/filter row */}
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
                {/* Avatar Initials */}
                <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-brand-red/20 bg-brand-red/10 flex items-center justify-center shadow-sm text-brand-red font-serif font-bold text-xl">
                  {getInitials(member.name) || <User className="text-brand-muted w-8 h-8" />}
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
            Showing active community members across Telangana
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
