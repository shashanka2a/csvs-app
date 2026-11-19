'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, Search, RefreshCw, Briefcase, CheckCircle2, ChevronDown } from 'lucide-react';
import type { CommunityMember } from '@/app/api/members/route';

const INITIAL_MEMBERS: CommunityMember[] = [
  {
    id: '1',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Ravi Chandar',
    fullName: 'Jagannatham Ravi Chandar',
    district: 'Nizamabad',
    occupation: 'Photographer',
  },
  {
    id: '2',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Bharathi',
    fullName: 'Jagannatham Bharathi',
    district: 'Nizamabad',
    occupation: 'Home Maker',
  },
  {
    id: '3',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Shashank',
    fullName: 'Jagannatham Shashank',
    district: 'Nizamabad',
    occupation: 'Software',
  },
  {
    id: '4',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Shivani',
    fullName: 'Jagannatham Shivani',
    district: 'Nizamabad',
    occupation: 'M.S In U.S',
  },
  {
    id: '5',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Raghu Chandar',
    fullName: 'Jagannatham Raghu Chandar',
    district: 'Nizamabad',
    occupation: 'Photographer',
  },
  {
    id: '6',
    membershipId: '27',
    surname: 'Jagannatham',
    name: 'Soubagya Laxmi',
    fullName: 'Jagannatham Soubagya Laxmi',
    district: 'Nizamabad',
    occupation: '',
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function MemberAvatar({ member }: { member: CommunityMember }) {
  const [imgError, setImgError] = useState(false);

  if (member.photo && !imgError) {
    return (
      <div className="relative w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-brand-red/30 bg-slate-100 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
        <Image
          src={member.photo}
          alt={member.fullName}
          fill
          unoptimized
          className="object-cover object-top"
          sizes="96px"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-brand-red/20 bg-brand-red/10 flex items-center justify-center shadow-xs text-brand-red font-serif font-bold text-2xl group-hover:scale-105 transition-transform">
      {getInitials(member.fullName) || <User className="text-brand-muted w-10 h-10" />}
    </div>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<CommunityMember[]>(INITIAL_MEMBERS);
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('All');
  const [loading, setLoading] = useState(false);

  // Dynamic fetch function
  const fetchMembers = async () => {
    setLoading(true);
    try {
      // Check if custom edited members exist in localStorage
      if (typeof window !== 'undefined') {
        const customRaw = localStorage.getItem('csvs_custom_members');
        if (customRaw) {
          try {
            const parsed = JSON.parse(customRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMembers(parsed);
              setLoading(false);
              return;
            }
          } catch {
            // fallback
          }
        }
      }

      const res = await fetch('/api/members', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.members) && data.members.length > 0) {
          setMembers(data.members);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch live members, using fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    window.addEventListener('csvs_members_custom_updated', fetchMembers);
    return () => window.removeEventListener('csvs_members_custom_updated', fetchMembers);
  }, []);

  // Filtered members list
  const filtered = members.filter((m) => {
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      m.fullName.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.surname.toLowerCase().includes(q) ||
      m.occupation.toLowerCase().includes(q) ||
      (m.membershipId && m.membershipId.toLowerCase().includes(q));

    const matchesDistrict = district === 'All' || m.district.toLowerCase() === district.toLowerCase();

    return matchesQuery && matchesDistrict;
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 1. Hero banner */}
      <section className="bg-brand-dark text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <span className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-2 block">
            Community Directory
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Our Community Members
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl leading-relaxed">
            Connect with verified members and families of Chattada Sri Vaishnava Sangham.
          </p>
        </div>
      </section>

      {/* 2. Live Search & Filter Bar */}
      <div className="bg-white border-b border-brand-border py-4 sticky top-16 z-40 shadow-xs">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search member name, surname, ID, or occupation..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-brand-border rounded-lg text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
              />
            </div>

            {/* District dropdown & Live Sync indicator */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="appearance-none border border-brand-border rounded-lg pl-3.5 pr-9 py-2 text-sm bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-red cursor-pointer shadow-2xs font-medium"
                >
                  <option value="All">All Districts</option>
                  <option value="Nizamabad">Nizamabad</option>
                  <option value="Armoor">Armoor</option>
                  <option value="Bodhan">Bodhan</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={fetchMembers}
                disabled={loading}
                title="Refresh from Google Sheet"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-dark hover:bg-slate-100 transition-colors shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-red ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Sync Sheet</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Members Grid */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs text-brand-muted font-medium">
            Showing <span className="font-bold text-brand-dark">{filtered.length}</span> verified members
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Connected</span>
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-brand-border p-8">
            <User className="w-12 h-12 text-brand-muted/40 mx-auto mb-3" />
            <p className="text-brand-dark font-serif font-bold text-lg mb-1">No members found</p>
            <p className="text-brand-muted text-sm">
              Try adjusting your search query or district filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((member) => (
              <div
                key={member.id}
                className="relative bg-white rounded-2xl border border-brand-border/80 shadow-xs hover:shadow-md transition-all duration-300 p-6 text-center flex flex-col justify-between group hover:-translate-y-1"
              >
                {/* Member ID Badge */}
                {(member.membershipId || member.id) && (
                  <div className="absolute top-3.5 right-3.5">
                    <span className="inline-flex items-center text-[10px] font-mono font-bold text-gray-500 bg-gray-100 border border-gray-200/90 px-2 py-0.5 rounded-md">
                      ID: #{member.membershipId || member.id}
                    </span>
                  </div>
                )}

                <div>
                  {/* Member DP / Photo or Initials Avatar */}
                  <MemberAvatar member={member} />

                  {/* Full Name: Surname + Name */}
                  <h3 className="font-serif font-bold text-brand-dark text-lg mb-1 leading-snug">
                    {member.fullName}
                  </h3>

                  {/* District badge */}
                  <div className="mb-3">
                    <span className="inline-block text-[11px] font-semibold bg-brand-cream text-brand-red border border-brand-red/15 px-2.5 py-0.5 rounded-full">
                      {member.district}
                    </span>
                  </div>

                  {/* Member details: Occupation only */}
                  {member.occupation && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="flex items-center justify-center gap-1.5 text-xs text-brand-dark font-medium">
                        <Briefcase className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>{member.occupation}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
