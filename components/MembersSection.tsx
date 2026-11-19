'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Briefcase, ArrowRight, User } from 'lucide-react';
import type { CommunityMember } from '@/app/api/members/route';

const FALLBACK_PREVIEW_MEMBERS: CommunityMember[] = [
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

export default function MembersSection() {
  const [members, setMembers] = useState<CommunityMember[]>(FALLBACK_PREVIEW_MEMBERS);

  useEffect(() => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.members) && data.members.length > 0) {
          setMembers(data.members);
        }
      })
      .catch(() => {});
  }, []);

  // Display up to 4 or 8 members on the homepage
  const previewMembers = members.slice(0, 8);

  return (
    <section id="members" className="py-20 bg-slate-50 border-t border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-2 block">
            Verified Directory
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-dark font-bold mb-4">
            Our Community Members
          </h2>
          <p className="text-brand-muted text-base md:text-lg">
            Meet our verified members and families of Chattada Sri Vaishnava Sangham across Telangana.
          </p>
        </div>

        {/* Members Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {previewMembers.map((member) => (
            <div
              key={member.id}
              className="relative bg-white rounded-2xl border border-brand-border/80 shadow-xs hover:shadow-lg transition-all duration-300 p-6 text-center flex flex-col justify-between group hover:-translate-y-1"
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
                {/* Member Avatar */}
                <MemberAvatar member={member} />

                {/* Member Name */}
                <h3 className="font-serif font-bold text-brand-dark text-lg mb-1 leading-snug">
                  {member.fullName}
                </h3>

                {/* District Badge */}
                <div className="mb-3">
                  <span className="inline-block text-[11px] font-semibold bg-brand-cream text-brand-red border border-brand-red/15 px-2.5 py-0.5 rounded-full">
                    {member.district}
                  </span>
                </div>

                {/* Occupation */}
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

        {/* View All Members CTA */}
        <div className="text-center">
          <Link
            href="/members"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-redhover text-white font-medium px-8 py-3 rounded-lg transition-colors shadow-sm text-sm"
          >
            <Users className="w-4 h-4" />
            <span>View All Members ({members.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
