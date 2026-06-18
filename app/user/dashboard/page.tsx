'use client';

import React, { useState, useEffect, JSX } from 'react';
import Navbar from '@/app/components/Navbar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import UserPropertiesSection from './UserPropertiesSection';
import UserProfileSection from './UserProfileSection';
import UserChatsSection from './UserChatsSection';
import UserHomeView from './UserHomeView';
import { Playfair_Display } from 'next/font/google';
import { User } from '@/utils/user';
import { Home, FileText, BarChart2, Heart, Settings, HelpCircle, LogOut } from 'lucide-react';
import { logout } from '@/auth/userauth';
import { motion } from 'framer-motion';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-playfair',
});

type TabType = 'home' | 'favourites' | 'profile' | 'chats' | 'list-property';

export default function UserDashboardPage(): JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as User;
            if (!data.onboardingCompleted) {
              router.push(`/user/onboarding?details=${currentUser.uid}`);
              return;
            }
            setUserData(data);
          } else {
            router.push(`/user/onboarding?details=${currentUser.uid}`);
            return;
          }
        } catch (error) {
          console.error("Error checking onboarding status", error);
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleNavigateTab = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col justify-center items-center">
        <span className="loading loading-spinner loading-lg text-[#FBBF24]"></span>
        <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm">Verifying session...</p>
      </main>
    );
  }

  if (!user || !userData) {
    return (
      <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center p-6 text-center max-w-md mx-auto space-y-6">
          <div className="text-6xl text-[#FBBF24]"><LogOut size={64} /></div>
          <h2 className={`${playfair.className} text-3xl font-bold`}>Access Denied</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Please log in or sign up using the navigation bar above to access your personalized real estate dashboard.
          </p>
        </div>
      </main>
    );
  }

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'favourites', label: 'Favourites', icon: Heart },
    { id: 'profile', label: 'Profile settings', icon: Settings },
    { id: 'chats', label: 'Messages', icon: HelpCircle }, // Using HelpCircle just to not introduce another icon for now, ideally MessageSquare
  ];

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white flex flex-col">
      <Navbar />

      <div className="flex-1 pt-20 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] h-[calc(100vh-5rem)]">
          <nav className="flex-1 px-4 py-8 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateTab(item.id as TabType)}
                  className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                    isActive 
                      ? 'text-black dark:text-white' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-[#FBBF24]/20 to-transparent dark:from-[#FBBF24]/10 border-l-4 border-[#FBBF24] rounded-r-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={18} className={`relative z-10 transition-colors ${isActive ? 'text-[#FBBF24]' : ''}`} />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 mt-auto border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-black dark:hover:text-white transition-all font-medium text-sm">
              <HelpCircle size={18} />
              Help
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-medium text-sm">
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </aside>

        {/* Mobile Navigation (Bottom Bar or Drawer could be implemented here, simplified for now to a horizontal scroll bar) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0a0a0a] border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 flex justify-between overflow-x-auto gap-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigateTab(item.id as TabType)}
                className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive ? 'text-[#FBBF24]' : 'text-zinc-500 dark:text-zinc-400'}`}
              >
                <Icon size={20} />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-12">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
            {/* Top Bar inside main content removed as requested */}

            <div className="bg-transparent">
              {activeTab === 'home' && (
                <UserHomeView user={userData} />
              )}
              {(activeTab === 'favourites' || activeTab === 'list-property') && (
                <UserPropertiesSection
                  userEmail={user.email || ''}
                  userId={user.uid}
                  userName={user.displayName || undefined}
                  activeTab={activeTab === 'list-property' ? 'list-property' : 'my-properties'}
                  onNavigateTab={(tab) => handleNavigateTab(tab === 'my-properties' ? 'favourites' : tab as any)}
                />
              )}
              {activeTab === 'profile' && (
                <UserProfileSection user={userData} onProfileUpdated={() => {}} />
              )}
              {activeTab === 'chats' && (
                <UserChatsSection userEmail={user.email || ''} userId={user.uid} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
