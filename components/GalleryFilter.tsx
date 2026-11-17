'use client';

import { useState } from 'react';

const CATEGORIES = ['All', 'Festivals', 'Weddings', 'Community', 'Cultural'] as const;
type Category = (typeof CATEGORIES)[number];

interface GalleryFilterProps {
  onSelectCategory?: (category: Category) => void;
  defaultCategory?: Category;
}

export default function GalleryFilter({
  onSelectCategory,
  defaultCategory = 'All',
}: GalleryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<Category>(defaultCategory);

  const handleSelect = (category: Category) => {
    setActiveCategory(category);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (
    <div className="overflow-x-auto flex gap-2 py-1">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => handleSelect(category)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-brand-red text-white'
                : 'bg-brand-cream text-brand-dark hover:bg-brand-border'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
