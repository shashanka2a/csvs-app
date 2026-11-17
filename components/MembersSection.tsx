'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, ArrowRight } from 'lucide-react';

type Area = 'nizamabad' | 'armoor' | 'bodhan' | 'nirmal';

const tabs: { id: Area; label: string }[] = [
  { id: 'nizamabad', label: 'Nizamabad' },
  { id: 'armoor', label: 'Armoor' },
  { id: 'bodhan', label: 'Bodhan' },
  { id: 'nirmal', label: 'Nirmal' },
];

interface Member {
  name: string;
  photo?: string;
  role: string;
  joined: string;
}

function MemberCard({ member }: { member: Member }) {
  return (
    <div className="bg-brand-cream rounded-xl p-6 text-center border border-brand-border hover:shadow-md transition-shadow">
      <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-sm">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            width={96}
            height={96}
            className="rounded-full object-cover border-4 border-white shadow-sm"
          />
        ) : (
          <div className="w-full h-full bg-brand-border flex items-center justify-center rounded-full">
            <User className="text-brand-muted w-10 h-10" />
          </div>
        )}
      </div>
      <p className="font-bold text-brand-dark text-lg">{member.name}</p>
      <p className="text-sm text-brand-red font-medium mb-1">{member.role}</p>
      <p className="text-xs text-brand-muted">{member.joined}</p>
    </div>
  );
}

function ViewMoreCard({ count, area }: { count: string; area: string }) {
  return (
    <Link
      href="/members"
      className="bg-white rounded-xl p-6 text-center border border-dashed border-brand-border flex flex-col items-center justify-center hover:bg-brand-cream cursor-pointer transition-colors"
    >
      <ArrowRight className="text-2xl text-brand-red mb-3 w-8 h-8" />
      <p className="font-bold text-brand-dark text-lg">{count}</p>
      <p className="text-sm text-brand-muted">{area}</p>
    </Link>
  );
}

const nizamabadMembers: Member[] = [
  {
    name: 'Ramesh Kumar',
    photo:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    role: 'Nizamabad Central',
    joined: 'Joined 2018',
  },
  {
    name: 'Srinivas V.',
    role: 'Nizamabad Rural',
    joined: 'Joined 2020',
  },
  {
    name: 'Lakshmi Devi',
    photo:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    role: 'Nizamabad',
    joined: 'Joined 2015',
  },
];

const armoorMembers: Member[] = [
  {
    name: 'Venkatesh P.',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    role: 'Armoor Town',
    joined: 'Joined 2019',
  },
];

export default function MembersSection() {
  const [activeArea, setActiveArea] = useState<Area>('nizamabad');

  return (
    <section id="members" className="py-20 bg-white">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 px-4">
        <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-2 block">
          Our Network
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-brand-dark font-bold mb-4">
          Community Members
        </h2>
        <p className="text-brand-muted">
          Connect with members of our Sangham across different districts and mandals.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-8 mb-12 border-b border-brand-border px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveArea(tab.id)}
            className={
              activeArea === tab.id
                ? 'border-b-[3px] border-brand-red text-brand-red font-semibold pb-4 text-base transition-colors'
                : 'text-brand-muted font-medium pb-4 text-base border-b-[3px] border-transparent hover:text-brand-dark transition-colors'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4">
        {activeArea === 'nizamabad' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {nizamabadMembers.map((member) => (
              <MemberCard key={member.name} member={member} />
            ))}
            <ViewMoreCard count="View All 150+" area="Members in Nizamabad" />
          </div>
        )}

        {activeArea === 'armoor' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            {armoorMembers.map((member) => (
              <MemberCard key={member.name} member={member} />
            ))}
            <ViewMoreCard count="View All 80+" area="Members in Armoor" />
          </div>
        )}

        {activeArea === 'bodhan' && (
          <div className="grid grid-cols-1 gap-6 animate-fade-in">
            <p className="col-span-full text-brand-muted text-center py-12">
              Community members from Bodhan will be listed here.
            </p>
          </div>
        )}

        {activeArea === 'nirmal' && (
          <div className="grid grid-cols-1 gap-6 animate-fade-in">
            <p className="col-span-full text-brand-muted text-center py-12">
              Community members from Nirmal will be listed here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
