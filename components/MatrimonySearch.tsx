'use client';

import { useState } from 'react';

export default function MatrimonySearch() {
  const [lookingFor, setLookingFor] = useState('Bride');
  const [ageRange, setAgeRange] = useState('20-25');
  const [district, setDistrict] = useState('All Districts');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl text-brand-dark">
      <h3 className="font-serif font-bold text-xl mb-4">Quick Search</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="lookingFor" className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">
            Looking for
          </label>
          <select
            id="lookingFor"
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            className="w-full border border-brand-border rounded-md px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          >
            <option value="Bride">Bride</option>
            <option value="Groom">Groom</option>
          </select>
        </div>

        <div>
          <label htmlFor="ageRange" className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">
            Age Range
          </label>
          <select
            id="ageRange"
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className="w-full border border-brand-border rounded-md px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          >
            <option value="20-25">20-25</option>
            <option value="25-30">25-30</option>
            <option value="30-35">30-35</option>
            <option value="35+">35+</option>
          </select>
        </div>

        <div>
          <label htmlFor="district" className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">
            District
          </label>
          <select
            id="district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full border border-brand-border rounded-md px-3 py-2 text-sm text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          >
            <option value="All Districts">All Districts</option>
            <option value="Nizamabad">Nizamabad</option>
            <option value="Armoor">Armoor</option>
            <option value="Bodhan">Bodhan</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-brand-red text-white w-full py-2.5 rounded-md font-medium hover:bg-brand-redhover transition-colors mt-1"
        >
          Search Profiles
        </button>
      </form>
    </div>
  );
}
