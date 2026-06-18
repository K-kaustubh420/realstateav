'use client';

import React from 'react';
import { User } from '@/utils/user';
import { Playfair_Display } from 'next/font/google';
import { Search, MapPin, TrendingUp, DollarSign, Home, Building, Key } from 'lucide-react';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
});

interface UserHomeViewProps {
  user: User;
}

export default function UserHomeView({ user }: UserHomeViewProps) {
  const intent = user.intent || 'buyer';
  
  let bannerTitle = <></>;
  let bannerDesc = '';
  let bannerButton = '';
  let HeroIcon = Home;

  switch(intent) {
    case 'seller':
    case 'homeowner':
      bannerTitle = <>A property in your area just sold for <span className="text-[#FBBF24]">$840,000</span></>;
      bannerDesc = "The market is moving fast. Get an updated valuation for your property and see how much you could earn.";
      bannerButton = 'Get Property Valuation';
      HeroIcon = TrendingUp;
      break;
    case 'renter':
      bannerTitle = <>Discover premium <span className="text-[#FBBF24]">rental</span> properties</>;
      bannerDesc = "We've curated an exclusive list of high-end apartments and homes available for rent in your preferred locations.";
      bannerButton = 'Explore Rentals';
      HeroIcon = Key;
      break;
    case 'researcher':
      bannerTitle = <>Market <span className="text-[#FBBF24]">insights</span> at your fingertips</>;
      bannerDesc = "Analyze trends, neighborhood data, and historical prices to make an informed decision when you are ready.";
      bannerButton = 'View Market Reports';
      HeroIcon = Search;
      break;
    case 'buyer':
    default:
      bannerTitle = <>Discover new <span className="text-[#FBBF24]">luxury</span> properties in your area</>;
      bannerDesc = "We've analyzed the market and found exclusive new listings that match your sophisticated taste.";
      bannerButton = 'View Matches';
      HeroIcon = Building;
      break;
  }
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Intent-based Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 group transition-colors">
        {/* Subtle gold gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FBBF24]/5 to-transparent dark:from-[#FBBF24]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        
        <div className="relative z-10 flex-1 space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FBBF24]/10 dark:bg-[#FBBF24]/20 border border-[#FBBF24]/20 dark:border-[#FBBF24]/30 text-[#d9a520] dark:text-[#FBBF24] text-xs font-bold tracking-wider uppercase mb-2">
            {(intent === 'seller' || intent === 'homeowner') ? 'Market Update' : 'New Opportunities'}
          </div>
          
          <h2 className={`${playfair.className} text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black dark:text-white leading-tight`}>
            {bannerTitle}
          </h2>
          
          <p className="text-gray-600 dark:text-zinc-400 text-lg max-w-xl">
            {bannerDesc}
          </p>
          
          <div className="pt-4 flex flex-wrap gap-4">
            <button className="btn bg-[#FBBF24] hover:bg-[#d9a520] text-black border-none font-bold rounded-full px-8 capitalize shadow-lg transition-transform hover:scale-105">
              {bannerButton}
            </button>
          </div>
        </div>
        
        <div className="relative z-10 hidden md:block w-full max-w-sm">
           {/* Abstract illustration/iconography for luxury vibe */}
           <div className="w-full aspect-square rounded-2xl bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700 flex items-center justify-center p-8 relative overflow-hidden backdrop-blur-sm">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBBF24]/20 blur-3xl rounded-full"></div>
             <HeroIcon className="w-32 h-32 text-[#d9a520] dark:text-[#FBBF24] drop-shadow-2xl opacity-90" strokeWidth={1} />
           </div>
        </div>
      </div>

      {/* Mockups section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`${playfair.className} text-2xl font-bold text-black dark:text-white`}>
            {(intent === 'seller' || intent === 'homeowner' || intent === 'researcher') ? 'Market Trends' : 'Curated For You'}
          </h3>
          <button className="text-sm font-semibold text-[#d9a520] dark:text-[#FBBF24] hover:text-black dark:hover:text-white transition-colors">
            View All
          </button>
        </div>
        
        {(intent === 'seller' || intent === 'homeowner' || intent === 'researcher') ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Market Insights Mockup Cards */}
            {[
              { title: 'Avg. Sale Price', value: '$1.2M', trend: '+4.2%', icon: DollarSign },
              { title: 'Days on Market', value: '24 Days', trend: '-2 Days', icon: TrendingUp },
              { title: 'Local Demand', value: 'High', trend: 'Growing', icon: MapPin },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-[#d9a520] dark:text-[#FBBF24]">
                    <stat.icon size={24} />
                  </div>
                  <h4 className="text-gray-500 dark:text-zinc-400 font-medium">{stat.title}</h4>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-black dark:text-white">{stat.value}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-400/10 px-2 py-1 rounded-md">{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Properties Mockup Cards */}
            {[
              { title: 'Duplex in Mare de Déuodor', address: '08023 Barcelona, Spain', price: intent === 'renter' ? '3,200 € / mo' : '859,000 €', rating: '7.4' },
              { title: 'Stylish Studio – Poblenou', address: 'Rambla del Poblenou 102', price: intent === 'renter' ? '1,800 € / mo' : '540,000 €', rating: '9.2' },
              { title: 'Cozy Apartment Near Park', address: 'Avinguda Gaudi 56', price: intent === 'renter' ? '2,400 € / mo' : '769,000 €', rating: '4.8' },
            ].map((prop, i) => (
              <div key={i} className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-gray-300 dark:hover:border-zinc-700 transition-all cursor-pointer">
                <div className="w-full h-48 bg-gray-100 dark:bg-zinc-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  {/* Mockup image placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-zinc-600">
                    <Home size={48} className="opacity-20" />
                  </div>
                  <button className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                    <Search size={18} />
                  </button>
                </div>
                <div className="p-5 space-y-3 relative">
                  <div className="absolute top-0 right-5 -translate-y-1/2 z-20 w-12 h-12 bg-white dark:bg-zinc-950 border-4 border-gray-50 dark:border-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                    <span className={`text-sm font-bold ${Number(prop.rating) >= 7 ? 'text-emerald-500 dark:text-emerald-400' : 'text-[#d9a520] dark:text-[#FBBF24]'}`}>{prop.rating}</span>
                  </div>
                  <h4 className="font-bold text-black dark:text-white text-lg truncate pr-8">{prop.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 truncate">{prop.address}</p>
                  <p className="text-xl font-extrabold text-[#d9a520] dark:text-[#FBBF24] pt-2">{prop.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
