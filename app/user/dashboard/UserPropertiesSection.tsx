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
        <div className="space-y-12">
          {/* A. Listed by User */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                📋 Properties Listed by You
              </h3>
              <button
                onClick={() => {
                  setEditProperty(null);
                  setIsDraftModalOpen(true);
                }}
                className="btn btn-warning btn-xs rounded-full font-bold px-4"
              >
                + Add Listing
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-6">
                <span className="loading loading-spinner loading-md text-warning"></span>
              </div>
            ) : listedProperties.length === 0 ? (
              <div className="text-zinc-500 py-6 text-sm">
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
                      className="card bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex flex-col sm:flex-row gap-4"
                    >
                      <div className="relative w-full sm:w-32 h-24 bg-zinc-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-zinc-600">
                        {firstImage ? (
                          <Image
                            src={firstImage}
                            alt={property.title || 'Listed property'}
                            fill
                            sizes="128px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span>🏢</span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-white text-sm line-clamp-1">{property.title}</h4>
                            <span
                              className={`badge badge-xs font-bold uppercase ${
                                property.status === 'active'
                                  ? 'badge-success text-black'
                                  : property.status === 'draft'
                                  ? 'badge-warning text-black'
                                  : 'badge-neutral text-white'
                              }`}
                            >
                              {property.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 uppercase tracking-wider">
                            {property.propertyType} • {property.location}, {property.city}
                          </p>
                          <p className="text-sm font-bold text-warning">${property.expectedPrice.toLocaleString()}</p>
                        </div>

                        {property.agentName ? (
                          <div className="p-2 bg-zinc-950 rounded-lg text-xs space-y-1">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Assigned Agent</span>
                            <p className="text-zinc-300 font-semibold">{property.agentName}</p>
                            {property.agentId && (
                              <p className="text-[10px] text-zinc-500 italic">Agent will contact you shortly</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500 italic">Draft awaiting agent claim</span>
                        )}

                        {/* Untouched Draft edit/delete controls */}
                        {isUntouchedDraft ? (
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              onClick={() => handleEditDraftClick(property)}
                              className="btn btn-outline btn-warning btn-xs rounded-full font-bold px-3"
                              disabled={actionLoading === property.id}
                            >
                              Edit Draft
                            </button>
                            <button
                              onClick={() => handleDeleteDraftClick(property.id)}
                              className="btn btn-outline btn-error btn-xs rounded-full font-bold px-3"
                              disabled={actionLoading === property.id}
                            >
                              {actionLoading === property.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-500 text-right italic font-semibold">
                            Locked (Claimed by Agent)
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
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              ❤️ Properties You Are Interested In
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-6">
                <span className="loading loading-spinner loading-md text-warning"></span>
              </div>
            ) : interestedProperties.length === 0 ? (
              <div className="text-zinc-500 py-6 text-sm">
                You haven&apos;t marked any properties as interested. Browse active listings to find ones you like!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {interestedProperties.map((property) => {
                  const firstImage = property.images && property.images.length > 0 ? property.images[0] : null;

                  return (
                    <div
                      key={property.id}
                      className="card bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex flex-col sm:flex-row gap-4"
                    >
                      <div className="relative w-full sm:w-32 h-24 bg-zinc-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-zinc-600">
                        {firstImage ? (
                          <Image
                            src={firstImage}
                            alt={property.title || 'Interested property'}
                            fill
                            sizes="128px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span>🏢</span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-white text-sm line-clamp-1">{property.title}</h4>
                            <span
                              className={`badge badge-xs font-bold uppercase ${
                                property.status === 'active'
                                  ? 'badge-success text-black'
                                  : property.status === 'sold'
                                  ? 'badge-error text-white'
                                  : 'badge-neutral text-white'
                              }`}
                            >
                              {property.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 uppercase tracking-wider">
                            {property.propertyType} • {property.location}, {property.city}
                          </p>
                          <p className="text-sm font-bold text-warning">${property.expectedPrice.toLocaleString()}</p>
                        </div>

                        {property.agentName ? (
                          <div className="p-2 bg-zinc-950 rounded-lg text-xs space-y-1">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Listing Agent</span>
                            <p className="text-zinc-300 font-semibold">{property.agentName}</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500 italic">No active agent yet</span>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleToggleInterestClick(property.id, true)}
                            className="btn btn-outline btn-error btn-xs rounded-full font-bold px-3"
                            disabled={actionLoading === property.id}
                          >
                            Remove
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
