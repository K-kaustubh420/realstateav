'use client';

import React, { useState, useEffect, JSX } from 'react';
import Navbar from '@/app/components/Navbar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import UserPropertiesSection from './UserPropertiesSection';
import UserProfileSection from './UserProfileSection';
import UserChatsSection from './UserChatsSection';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-playfair',
});

  // Updated TabType without marketplace
  type TabType = 'my-properties' | 'list-property' | 'profile' | 'chats';

export default function UserDashboardPage(): JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('my-properties');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Callback to handle tab switching from child components
  const handleNavigateTab = (tab: 'my-properties' | 'list-property' | 'chats') => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
        <span className="loading loading-spinner loading-lg text-warning"></span>
        <p className="mt-4 text-zinc-400 text-sm">Verifying session...</p>
      </main>
    );
  }

  // Not logged in UI
  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center p-6 text-center max-w-md mx-auto space-y-6">
          <div className="text-6xl">🔒</div>
          <h2 className={`${playfair.className} text-3xl font-bold`}>Access Denied</h2>
          <p className="text-zinc-400 text-sm">
            Please log in or sign up using the navigation bar above to access your personalized real estate dashboard.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header / Welcome Banner */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className={`${playfair.className} text-2xl sm:text-3xl font-extrabold text-white`}>
              Welcome, {user.displayName || user.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Browse listings, track interested properties, or draft your own real estate listings.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('list-property')}
            className="btn bg-[#FBBF24] hover:bg-[#d9a520] text-black border-none font-bold rounded-full px-6 btn-sm sm:btn-md capitalize shadow-lg transition-transform hover:scale-102"
          >
            + List a Property
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
            {(
              [
                { id: 'my-properties', label: '📁 My Listings & Favorites', val: 'my-properties' },
                { id: 'chats', label: '💬 Messages', val: 'chats' },
                { id: 'profile', label: '👤 Profile Settings', val: 'profile' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.val as TabType)}
                className={`py-3 px-4 sm:px-6 font-bold text-sm border-b-2 transition-all capitalize ${activeTab === tab.val
                  ? 'border-warning text-warning'
                  : 'border-transparent text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
        </div>

        {/* Dashboard Sections Content */}
        <div className="bg-transparent">
          {activeTab === 'profile' ? (
            <UserProfileSection userEmail={user.email || ''} />
          ) : activeTab === 'chats' ? (
            <UserChatsSection userEmail={user.email || ''} userId={user.uid} />
          ) : (
            <UserPropertiesSection
              userEmail={user.email || ''}
              userId={user.uid}
              userName={user.displayName || undefined}
              activeTab={activeTab === 'list-property' ? 'list-property' : activeTab as any}
              onNavigateTab={handleNavigateTab}
            />
          )}
        </div>
      </div>
    </main>
  );
}
