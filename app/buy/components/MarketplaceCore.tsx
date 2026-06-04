// app/buy/components/MarketplaceCore.tsx
'use client';

import React, { useState, useEffect, JSX } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { fetchActiveProperties, toggleInterest } from '@/lib/users/properties';
import { Property } from '@/lib/properties/property.types';
import dynamic from 'next/dynamic';
import PropertyCard from '@/app/buy/components/PropertyCard';
import MapSearchBar from '@/app/buy/components/MapSearchBar';
import ChatWidget from '@/app/components/ChatWidget';

const MapWithMarkers = dynamic(() => import('@/app/buy/components/MapWithMarkers'), { ssr: false });

type Mode = 'buy' | 'rent';

interface MarketplaceCoreProps {
  mode: Mode;
}

export default function MarketplaceCore({ mode }: MarketplaceCoreProps): JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState('');
  const [chatSubtitle, setChatSubtitle] = useState('');
  const [chatImage, setChatImage] = useState<string | null>(null);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Load properties
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchActiveProperties(); // fetch all active
        const filtered = data.filter((p) => {
          const scene = p.property_scene;
          if (mode === 'buy') {
            return scene === 'on_sale' || scene === 'sell_and_rent';
          }
          // rent mode
          return scene === 'on_rent' || scene === 'sell_and_rent';
        });
        setProperties(filtered);
      } catch (e) {
        console.error('Failed to load properties', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mode]);

  // Filter by search city (simple substring match on city or location)
  const displayed = properties.filter((p) => {
    if (!searchCity) return true;
    const term = searchCity.toLowerCase();
    return (
      p.city?.toLowerCase().includes(term) ||
      p.location?.toLowerCase().includes(term)
    );
  });

  const handleToggleInterest = async (propertyId: string) => {
    if (!user) return;
    const currently = (properties.find((p) => p.id === propertyId) as any)?.interestedUserIds?.includes(user.uid);
    await toggleInterest(propertyId, user.uid, !currently);
    // Refresh list
    const data = await fetchActiveProperties();
    const filtered = data.filter((p) => {
      const scene = p.property_scene;
      if (mode === 'buy') {
        return scene === 'on_sale' || scene === 'sell_and_rent';
      }
      return scene === 'on_rent' || scene === 'sell_and_rent';
    });
    setProperties(filtered);
    setActionLoading(null);
  };

  const handleStartConversation = async (property: Property) => {
    if (!property.agentId) {
      alert("This property does not have an assigned agent yet.");
      return;
    }
    setActionLoading(`chat_${property.id}`);
    setError(null);
    try {
      const { createUserConversation } = await import('@/lib/users/chat');
      const convId = await createUserConversation({
        conversationContext: property.property_scene === 'on_rent' ? 'property_rental' : 'property_buying',
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: property.images?.[0] || null,
        agentId: property.agentId,
        agentName: property.agentName || 'Agent',
        agentEmail: property.agentId
      }, user?.email);

      setActiveChatId(convId);
      setChatTitle(property.title || '');
      setChatSubtitle(`with ${property.agentName || 'Agent'}`);
      setChatImage(property.images?.[0] || null);
      setIsChatOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start conversation.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] bg-white">
      {/* Listings Panel */}
      <div className="w-full md:w-[600px] lg:w-[700px] flex flex-col h-full max-h-[70vh] md:max-h-[calc(100vh-80px)]">
        <MapSearchBar value={searchCity} onChange={setSearchCity} />
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm mb-4 mx-4">
            {error}
          </div>
        )}
        <div className="overflow-y-auto px-2 flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-md text-warning" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No listings match your search.
            </div>
          ) : (
            displayed.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                userId={user?.uid}
                onToggleInterest={handleToggleInterest}
                onStartConversation={handleStartConversation}
                actionLoading={actionLoading}
              />
            ))
          )}
        </div>
      </div>
      {/* Map Panel */}
      <div className="flex-1 h-[400px] md:h-auto overflow-hidden border-l border-gray-200 bg-gray-50">
        <MapWithMarkers properties={displayed} />
      </div>

      {/* Realtime Chat Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setActiveChatId(null);
        }}
        conversationId={activeChatId}
        currentUserId={user?.uid}
        currentUserRole="user"
        title={chatTitle}
        subtitle={chatSubtitle}
        imageUrl={chatImage}
      />
    </div>
  );
}
