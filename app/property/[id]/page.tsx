// app/property/[id]/page.tsx
'use client';

import React, { useEffect, useState, JSX } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Property } from '@/lib/properties/property.types';
import { fetchPropertyById, toggleInterest } from '@/lib/users/properties';
import Navbar from '@/app/components/Navbar';
import ChatWidget from '@/app/components/ChatWidget';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function PropertyDetailsPage(): JSX.Element {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const data = await fetchPropertyById(id);
        setProperty(data);
      } catch (err) {
        console.error("Failed to load property:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [id]);

  const handleStartConversation = async () => {
    if (!property?.agentId || !user) {
      if (!user) alert("Please log in to contact the agent.");
      return;
    }
    setActionLoading(true);
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
      }, user.email);

      setActiveChatId(convId);
      setIsChatOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to start conversation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleInterest = async () => {
    if (!property || !user) return;
    const currentlyInterested = (property as any).interestedUserIds?.includes(user.uid);
    await toggleInterest(property.id, user.uid, !currentlyInterested);
    // Reload property
    const data = await fetchPropertyById(id);
    setProperty(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center pt-20">
          <span className="loading loading-spinner loading-lg text-amber-500"></span>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center pt-20">
          <h2 className="text-2xl text-gray-800">Property not found</h2>
        </div>
      </div>
    );
  }

  const isUserInterested = (property as any).interestedUserIds?.includes(user?.uid) || false;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="pt-20 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="text-amber-600 hover:text-amber-700 flex items-center gap-2 mb-6 font-medium"
        >
          ← Back to listings
        </button>

        {/* Title and Price Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <p className="text-gray-600 mt-2 text-lg">
              {property.addressLine1}, {property.city}, {property.location}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-gray-900">
              ${property.expectedPrice.toLocaleString()}
              {property.property_scene === 'on_rent' && <span className="text-xl font-normal text-gray-500"> /mo</span>}
            </h2>
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mt-1">
              {property.propertyType} {property.property_scene === 'on_rent' ? 'for Rent' : 'for Sale'}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b border-gray-200 mb-8">
          <div className="flex items-center gap-6 text-gray-700 font-medium">
            {property.bedrooms && <span className="flex items-center gap-2">🛏️ {property.bedrooms} Beds</span>}
            {property.bathrooms && <span className="flex items-center gap-2">🛁 {property.bathrooms} Baths</span>}
            {property.bhk && <span className="flex items-center gap-2">🚗 {property.bhk} Parking</span>}
            {property.carpetArea && <span className="flex items-center gap-2">📐 {property.carpetArea} sqft</span>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleToggleInterest}
              className={`btn px-6 rounded-full border ${
                isUserInterested 
                  ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 hover:border-rose-300' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isUserInterested ? '❤️ Saved' : '🤍 Save Property'}
            </button>
            {property.agentId && (
              <button
                onClick={handleStartConversation}
                disabled={actionLoading}
                className="btn bg-amber-500 hover:bg-amber-600 text-white rounded-full px-8 border-none"
              >
                {actionLoading ? 'Loading...' : 'Message Agent'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
              {property.images && property.images.length > 0 ? (
                <>
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100">
                    <Image
                      src={property.images[0]}
                      alt="Main view"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {property.images[1] && (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100 hidden md:block">
                      <Image
                        src={property.images[1]}
                        alt="Second view"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center h-full bg-gray-100 rounded-2xl text-gray-400">
                  <span className="text-6xl mb-4">🏢</span>
                  <p>No photos available</p>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Property Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {property.description || "No description provided."}
              </p>
            </div>

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="text-amber-500">✓</span> {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Agent Info & Contact */}
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Managing Agent</h3>
              {property.agentId ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl font-bold">
                      {property.agentName ? property.agentName.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{property.agentName || 'Real Estate Agent'}</p>
                      <p className="text-sm text-gray-500">Verified Agent</p>
                    </div>
                  </div>
                  <button
                    onClick={handleStartConversation}
                    disabled={actionLoading}
                    className="w-full btn bg-gray-900 hover:bg-gray-800 text-white rounded-xl border-none"
                  >
                    {actionLoading ? 'Loading...' : 'Contact Agent'}
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 italic">No agent is currently assigned to this property.</p>
              )}
            </div>
            
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <h3 className="text-lg font-bold text-amber-900 mb-2">Interested in this property?</h3>
              <p className="text-amber-700 text-sm mb-4">
                Save this property to your dashboard to receive updates or contact the agent directly to schedule a viewing.
              </p>
              <button
                onClick={handleToggleInterest}
                className="w-full btn bg-white hover:bg-gray-50 text-amber-700 border border-amber-200 rounded-xl"
              >
                {isUserInterested ? 'Unsave Property' : 'Save Property'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChatWidget
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setActiveChatId(null);
        }}
        conversationId={activeChatId}
        currentUserId={user?.uid}
        currentUserRole="user"
        title={property.title || 'Property Chat'}
        subtitle={`with ${property.agentName || 'Agent'}`}
        imageUrl={property.images?.[0] || null}
      />
    </div>
  );
}
