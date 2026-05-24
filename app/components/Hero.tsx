// components/Hero.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoSearch } from 'react-icons/io5';
import { FiMapPin, FiHome, FiDollarSign, FiChevronDown } from 'react-icons/fi';
import { motion, easeInOut } from 'framer-motion';
import { Julius_Sans_One, Poppins } from 'next/font/google';

// Font for the main headline, matching the "MURBERRY" style
const juliusSans = Julius_Sans_One({
  subsets: ['latin'],
  weight: '400',
});

// Font for the search bar and its UI elements
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'], // Regular for placeholders, Semi-bold for tabs
});


// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeInOut },
  },
};

const Hero = () => {
  const [searchType, setSearchType] = useState('buy');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    const route = searchType === 'buy' ? '/buy' : '/rent';
    const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
    router.push(`${route}${query}`);
  };

  // Helper function to dynamically set tab classes
  const getTabClasses = (type: string) => {
    const baseClasses = 'px-6 py-3 text-sm font-semibold rounded-t-lg transition-colors duration-300 focus:outline-none';
    if (searchType === type) {
      // Active tab
      return `${baseClasses} backdrop-filter backdrop-blur-[5px] text-white`;
    } else {
      // Inactive tab
      return `${baseClasses} bg-transparent text-white hover:bg-white/10`;
    }
  };

  return (
    <div className="relative flex items-center justify-center h-[calc(100vh-88px)] min-h-175 bg-cover bg-center" style={{ backgroundImage: "url('/bgimage.png')" }}>
      {/* Background overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-12 text-center text-white px-4 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Headline */}
        <motion.h1
          className={`${juliusSans.className} text-5xl md:text-7xl lg:text-8xl drop-shadow-lg max-w-4xl`}
          variants={itemVariants}
        >
          Elevating Real Estate, Defining Luxury.
        </motion.h1>

        {/* ==================== ELEGANT SEARCH BAR START ==================== */}
        <motion.div
          className={`w-full max-w-4xl ${poppins.className}`}
          variants={itemVariants}
        >
          {/* Search Type Tabs */}
          <div className="flex ">
            <button onClick={() => setSearchType('buy')} className={getTabClasses('buy')}>Buy</button>
            <button onClick={() => setSearchType('rent')} className={getTabClasses('rent')}>Rent</button>
          </div>

          {/* Main Search Form Container */}
          <div className="flex items-center w-full p-2  backdrop-filter backdrop-blur-[5px] rounded-b-lg rounded-r-lg shadow-2xl">

            {/* Location Input */}
            <div className="flex items-center flex-grow pl-4 pr-2">
              <FiMapPin className="text-zinc-400 mr-3" size={20} />
              <input
                type="text"
                placeholder="City, Address, Zip Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full py-3 text-base text-black dark:text-white bg-transparent focus:outline-none placeholder:text-zinc-500"
              />
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 hidden md:block" />

            {/* Property Type Dropdown (Simulated) */}
            <div className="hidden md:flex items-center cursor-pointer px-4 py-3 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <FiHome className="text-zinc-400 mr-3" size={20} />
              <span>Property Type</span>
              <FiChevronDown className="ml-2" />
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 hidden md:block" />

            {/* Price Range Dropdown (Simulated) */}
            <div className="hidden md:flex items-center cursor-pointer px-4 py-3 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <FiDollarSign className="text-zinc-400 mr-3" size={20} />
              <span>Price Range</span>
              <FiChevronDown className="ml-2" />
            </div>

            {/* Search Button */}
            <button 
              onClick={handleSearch}
              className="btn btn-circle bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 border-none ml-2"
            >
              <IoSearch size={22} className="text-white dark:text-black" />
            </button>
          </div>
        </motion.div>
       
      </motion.div>
    </div>
  );
};

export default Hero;