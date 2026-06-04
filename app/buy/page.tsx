// app/buy/page.tsx
'use client';

import React from 'react';
import MarketplaceCore from './components/MarketplaceCore';
import Navbar from '@/app/components/Navbar';

export default function BuyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-20 flex-1">
        <MarketplaceCore mode="buy" />
      </div>
    </div>
  );
}
