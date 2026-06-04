// app/rent/page.tsx
'use client';

import React from 'react';
import MarketplaceCore from '@/app/buy/components/MarketplaceCore';
import Navbar from '@/app/components/Navbar';

export default function RentPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="pt-20 flex-1">
        <MarketplaceCore mode="rent" />
      </div>
    </div>
  );
}
