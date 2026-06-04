// app/buy/components/MapSearchBar.tsx
'use client';

import React, { JSX } from 'react';

interface MapSearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function MapSearchBar({ value, onChange }: MapSearchBarProps): JSX.Element {
  return (
    <div className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10 mb-4 shadow-sm flex items-center gap-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Search city or location (e.g. Chennai)..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-full pl-10 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
      </div>
    </div>
  );
}
