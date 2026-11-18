'use client';

import { useState, useEffect } from 'react';
import { User, Search, RefreshCw, Briefcase, Heart, CheckCircle2 } from 'lucide-react';
import type { CommunityMember } from '@/app/api/members/route';

const INITIAL_MEMBERS: CommunityMember[] = [
  {
    id: '1',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Ravi Chandar',
    fullName: 'Ravi Chandar Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: 'Photographer',
    phone: '9848765051',
    bloodGroup: 'B+',
  },
  {
    id: '2',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Bharathi',
    fullName: 'Bharathi Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: 'Home Maker',
    phone: '9848765051',
    bloodGroup: 'A+',
  },
  {
    id: '3',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Shashank',
    fullName: 'Shashank Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: 'Software',
    phone: '9848765051',
    bloodGroup: 'A+',
  },
  {
    id: '4',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Shivani',
    fullName: 'Shivani Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: 'M.S In U.S',
    phone: '9848765051',
    bloodGroup: 'AB+',
  },
  {
    id: '5',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Raghu Chandar',
    fullName: 'Raghu Chandar Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: 'Photographer',
    phone: '9848765051',
    bloodGroup: '',
  },
  {
    id: '6',
    membershipId: '27',
    gothram: 'Achyutha',
    surname: 'Jagannatham',
    name: 'Soubagya Laxmi',
    fullName: 'Soubagya Laxmi Jagannatham',
    address: '11-1-58, Kanteshwear, Telangana.',
    district: 'Nizamabad',
    pincode: '503002',
    occupation: '',
    phone: '9848765051',
    bloodGroup: '',
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

export default function MembersPage() {
  const [members, setMembers] = useState<CommunityMember[]>(INITIAL_MEMBERS);
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('All');
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string>('live');

  // Dynamic fetch function
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/members', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.members) && data.members.length > 0) {
          setMembers(data.members);
          setSource(data.source || 'live');
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
      m.gothram.toLowerCase().includes(q);

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
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
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
                placeholder="Search member name, surname, or occupation..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-brand-border rounded-lg text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white transition-all"
              />
            </div>

            {/* District dropdown & Live Sync indicator */}
            <div className="flex items-center gap-3">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="border border-brand-border rounded-lg px-3.5 py-2 text-sm bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-red cursor-pointer shadow-2xs font-medium"
              >
                <option value="All">All Districts</option>
                <option value="Nizamabad">Nizamabad</option>
                <option value="Armoor">Armoor</option>
                <option value="Bodhan">Bodhan</option>
              </select>

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
            <span>Connected to Sangham Sheet</span>
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
                className="bg-white rounded-2xl border border-brand-border/80 shadow-xs hover:shadow-md transition-all duration-300 p-6 text-center flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Avatar Initials */}
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-brand-red/20 bg-brand-red/10 flex items-center justify-center shadow-xs text-brand-red font-serif font-bold text-xl group-hover:scale-105 transition-transform">
                    {getInitials(member.fullName) || <User className="text-brand-muted w-8 h-8" />}
                  </div>

                  {/* Full Name */}
                  <h3 className="font-serif font-bold text-brand-dark text-lg mb-1 leading-snug">
                    {member.fullName}
                  </h3>

                  {/* District badge */}
                  <div className="mb-3">
                    <span className="inline-block text-[11px] font-semibold bg-brand-cream text-brand-red border border-brand-red/15 px-2.5 py-0.5 rounded-full">
                      {member.district}
                    </span>
                  </div>

                  {/* Member details: Occupation & Gothram */}
                  <div className="space-y-1 text-xs text-brand-muted pt-2 border-t border-gray-100">
                    {member.occupation && (
                      <p className="flex items-center justify-center gap-1.5 text-brand-dark font-medium">
                        <Briefcase className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>{member.occupation}</span>
                      </p>
                    )}
                    {member.gothram && (
                      <p className="text-[11px] text-brand-muted">
                        Gothram: <span className="font-semibold text-brand-dark">{member.gothram}</span>
                      </p>
                    )}
                    {member.bloodGroup && (
                      <p className="text-[11px] text-brand-muted flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        <span>Blood Group: <strong className="text-brand-dark">{member.bloodGroup}</strong></span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
