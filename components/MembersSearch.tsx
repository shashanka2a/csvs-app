'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export default function MembersSearch() {
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('All Districts');
  const [gender, setGender] = useState('All');

  return (
    <div className="bg-white border-b border-brand-border py-3.5 sticky top-16 z-40 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or mandal..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-brand-border rounded-md text-brand-dark placeholder-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red"
            />
          </div>

          {/* Select dropdowns */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              aria-label="Filter by district"
              className="border border-brand-border rounded-md pl-3.5 pr-10 py-2 min-w-[160px] text-sm bg-white text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red cursor-pointer shadow-sm"
            >
              <option value="All Districts">All Districts</option>
              <option value="Nizamabad">Nizamabad</option>
              <option value="Armoor">Armoor</option>
              <option value="Bodhan">Bodhan</option>
              <option value="Nirmal">Nirmal</option>
            </select>

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              aria-label="Filter by gender"
              className="border border-brand-border rounded-md pl-3.5 pr-8 py-2 min-w-[100px] text-sm bg-white text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red cursor-pointer shadow-sm"
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
