'use client';

import React, { useState, useEffect, JSX } from 'react';
import { Property } from '@/lib/properties/property.types';
import {
  fetchUserDashboardProperties,
  fetchActiveProperties,
  deleteUserDraft,
  toggleInterest,
} from '@/lib/users/properties';
import UserDraftFormModal from './UserDraftFormModal';
import ChatWidget from '@/app/components/ChatWidget';
import Image from 'next/image';
import { ClipboardList, Heart, Building } from 'lucide-react';

interface UserPropertiesSectionProps {
  userEmail: string;
  userId: string;
  userName?: string;
  activeTab: 'my-properties' | 'list-property';
  onNavigateTab: (tab: 'my-properties' | 'list-property') => void;
}

export default function UserPropertiesSection({
  userEmail,
  userId,
  userName,
  activeTab,
  onNavigateTab,
}: UserPropertiesSectionProps): JSX.Element {
  // Properties lists
  const [activeProperties, setActiveProperties] = useState<Property[]>([]);
  const [listedProperties, setListedProperties] = useState<Property[]>([]);
  const [interestedProperties, setInterestedProperties] = useState<Property[]>([]);

  // Filtering / Loading states
  const [marketplaceFilter, setMarketplaceFilter] = useState<'all' | 'sale' | 'rental'>('all');
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);

  // Load marketplace active properties
  const loadMarketplace = async (filter: 'all' | 'sale' | 'rental') => {
    try {
      setLoading(true);
      setError(null);
      const sceneFilter = filter === 'all' ? undefined : filter;
      const data = await fetchActiveProperties(sceneFilter);
      setActiveProperties(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load marketplace properties.');
    } finally {
      setLoading(false);
    }
  };

  // Load user properties (My Properties)
  const loadMyProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const { listed, interested } = await fetchUserDashboardProperties(userEmail, userId);
      setListedProperties(listed);
      setInterestedProperties(interested);
    } catch (err: any) {
      setError(err.message || 'Failed to load your properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-properties') {
      loadMyProperties();
    } else if (activeTab === 'list-property') {
      // List property acts as a trigger to open the modal and defaults to My Properties page
      setEditProperty(null);
      setIsDraftModalOpen(true);
      onNavigateTab('my-properties');
    }
  }, [activeTab]);

  // Handle Edit Draft
  const handleEditDraftClick = (property: Property) => {
    setEditProperty(property);
    setIsDraftModalOpen(true);
  };

  // Handle Delete Draft
  const handleDeleteDraftClick = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this draft property?')) {
      return;
    }
    setActionLoading(propertyId);
    setError(null);
    try {
      await deleteUserDraft(propertyId, userEmail);
      await loadMyProperties();
    } catch (err: any) {
      setError(err.message || 'Failed to delete property draft.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Toggle Interest
  const handleToggleInterestClick = async (propertyId: string, currentlyInterested: boolean) => {
    setActionLoading(propertyId);
    setError(null);
    try {
      await toggleInterest(propertyId, userId, !currentlyInterested);
      // Refresh current active view
      await loadMyProperties();
    } catch (err: any) {
      setError(err.message || 'Failed to update interest status.');
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered Marketplace Properties
  const filteredActiveProperties = activeProperties.filter((property) => {
    const matchesCity = searchCity
      ? property.city.toLowerCase().includes(searchCity.toLowerCase()) ||
        property.location.toLowerCase().includes(searchCity.toLowerCase())
      : true;
    const matchesType = searchType !== 'All' ? property.propertyType === searchType : true;
    return matchesCity && matchesType;
  });

  // Unique property types for filter
  const propertyTypesForMarketplace = [
    'All',
    'Apartment',
    'House',
    'Villa',
    'Condo',
    'Penthouse',
    'Studio',
    'Plot / Land',
  ];

  // Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState('');
  const [chatSubtitle, setChatSubtitle] = useState('');
  const [chatImage, setChatImage] = useState<string | null>(null);

  const handleStartConversation = async (property: Property) => {
    if (!property.agentId) {
      alert("This property does not have an assigned agent yet.");
      return;
    }
    setActionLoading(`chat_${property.id}`);
    setError(null);
    try {
      // Create or get existing conversation
      const { createUserConversation } = await import('@/lib/users/chat');
      const convId = await createUserConversation({
        conversationContext: property.property_scene === 'on_rent' ? 'property_rental' : 'property_buying',
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: property.images?.[0] || null,
        agentId: property.agentId,
        agentName: property.agentName || 'Agent',
        agentEmail: property.agentId // Fallback if no email is attached to property, though agent details are limited here. We should probably fetch agent email if needed, or chat.ts can handle it.
      }, userEmail);

      setActiveChatId(convId);
      setChatTitle(property.title || '');
      setChatSubtitle(`with ${property.agentName || 'Agent'}`);
      setChatImage(property.images?.[0] || null);
      setIsChatOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start conversation. Ensure your identity profile is complete.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}


      {/* 2. MY PROPERTIES - LISTINGS AND INTERESTED */}
      {activeTab === 'my-properties' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          {/* A. Listed by User */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <ClipboardList className="text-[#FBBF24]" size={24} />
                Properties Listed by You
              </h3>
              <button
                onClick={() => {
                  setEditProperty(null);
                  setIsDraftModalOpen(true);
                }}
                className="btn bg-[#FBBF24] hover:bg-[#d9a520] text-black border-none font-bold rounded-full px-6 btn-sm shadow-lg transition-transform hover:scale-105"
              >
                + Add Listing
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg text-[#FBBF24]"></span>
              </div>
            ) : listedProperties.length === 0 ? (
              <div className="text-zinc-500 py-12 text-center text-sm bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-700">
                You haven&apos;t listed any properties yet. Create a draft to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listedProperties.map((property) => {
                  const firstImage = property.images && property.images.length > 0 ? property.images[0] : null;
                  const isUntouchedDraft = property.status === 'draft' && property.agentId === null;

                  return (
                    <div
                      key={property.id}
                      className="group bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col xl:flex-row gap-5 shadow-lg hover:border-zinc-700 hover:shadow-2xl transition-all"
                    >
                      <div className="relative w-full xl:w-40 h-32 bg-zinc-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-zinc-600">
                        {firstImage ? (
                          <Image
                            src={firstImage}
                            alt={property.title || 'Listed property'}
                            fill
                            sizes="160px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <Building size={32} className="opacity-30" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-white text-base line-clamp-1 flex-1 pr-2">{property.title}</h4>
                            <span
                              className={`px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${
                                property.status === 'active'
                                  ? 'bg-emerald-400/20 text-emerald-400'
                                  : property.status === 'draft'
                                  ? 'bg-[#FBBF24]/20 text-[#FBBF24]'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {property.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
                            {property.propertyType} • {property.location}, {property.city}
                          </p>
                          <p className="text-lg font-extrabold text-[#FBBF24]">${property.expectedPrice.toLocaleString()}</p>
                        </div>

                        {property.agentName ? (
                          <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl text-xs space-y-1">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Assigned Agent</span>
                            <p className="text-white font-semibold flex items-center gap-2">
                              {property.agentName}
                            </p>
                            {property.agentId && (
                              <p className="text-[10px] text-[#FBBF24]/70 italic mt-1">Agent will contact you shortly</p>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 bg-zinc-800/30 border border-zinc-800 border-dashed rounded-xl">
                            <span className="text-xs text-zinc-500 italic flex items-center gap-2">
                              Draft awaiting agent claim
                            </span>
                          </div>
                        )}

                        {/* Untouched Draft edit/delete controls */}
                        {isUntouchedDraft ? (
                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => handleEditDraftClick(property)}
                              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors"
                              disabled={actionLoading === property.id}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDraftClick(property.id)}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg transition-colors"
                              disabled={actionLoading === property.id}
                            >
                              {actionLoading === property.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-500 text-right italic font-medium pt-2">
                            Locked (Claimed)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* B. Properties Marked Interested In */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-4 flex items-center gap-3">
              <Heart className="text-red-500" fill="currentColor" size={24} />
              Properties You Are Interested In
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg text-[#FBBF24]"></span>
              </div>
            ) : interestedProperties.length === 0 ? (
              <div className="text-zinc-500 py-12 text-center text-sm bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-700">
                You haven&apos;t marked any properties as interested. Browse active listings to find ones you like!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {interestedProperties.map((property) => {
                  const firstImage = property.images && property.images.length > 0 ? property.images[0] : null;

                  return (
                    <div
                      key={property.id}
                      className="group bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col xl:flex-row gap-5 shadow-lg hover:border-zinc-700 hover:shadow-2xl transition-all"
                    >
                      <div className="relative w-full xl:w-40 h-32 bg-zinc-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-zinc-600">
                        {firstImage ? (
                          <Image
                            src={firstImage}
                            alt={property.title || 'Interested property'}
                            fill
                            sizes="160px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        ) : (
                          <Building size={32} className="opacity-30" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-white text-base line-clamp-1 flex-1 pr-2">{property.title}</h4>
                            <span
                              className={`px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${
                                property.status === 'active'
                                  ? 'bg-emerald-400/20 text-emerald-400'
                                  : property.status === 'sold'
                                  ? 'bg-red-500/20 text-red-500'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {property.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
                            {property.propertyType} • {property.location}, {property.city}
                          </p>
                          <p className="text-lg font-extrabold text-[#FBBF24]">${property.expectedPrice.toLocaleString()}</p>
                        </div>

                        {property.agentName ? (
                          <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl text-xs space-y-1">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Listing Agent</span>
                            <p className="text-white font-semibold">{property.agentName}</p>
                          </div>
                        ) : (
                          <div className="p-3 bg-zinc-800/30 border border-zinc-800 border-dashed rounded-xl">
                            <span className="text-xs text-zinc-500 italic">No active agent yet</span>
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleToggleInterestClick(property.id, true)}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                            disabled={actionLoading === property.id}
                          >
                            <Heart size={14} className="text-zinc-400" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Draft form modal for creates / edits */}
      <UserDraftFormModal
        isOpen={isDraftModalOpen}
        onClose={() => {
          setIsDraftModalOpen(false);
          setEditProperty(null);
        }}
        onSubmitSuccess={loadMyProperties}
        userEmail={userEmail}
        userId={userId}
        userName={userName}
        editProperty={editProperty}
      />

      {/* Realtime Chat Widget */}
      <ChatWidget
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setActiveChatId(null);
        }}
        conversationId={activeChatId}
        currentUserId={userId}
        currentUserRole="user"
        title={chatTitle}
        subtitle={chatSubtitle}
        imageUrl={chatImage}
      />
    </div>
  );
}
