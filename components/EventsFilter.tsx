'use client';

import { useState } from 'react';

const FILTER_OPTIONS = ['All', 'Upcoming', 'Cultural', 'Matrimony', 'Community'] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

export default function EventsFilter() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  return (
    <div className="overflow-x-auto flex gap-2 py-1">
      {FILTER_OPTIONS.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-brand-red text-white'
                : 'bg-gray-100 text-brand-dark hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
