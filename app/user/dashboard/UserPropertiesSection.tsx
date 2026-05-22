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
import Image from 'next/image';

interface UserPropertiesSectionProps {
  userEmail: string;
  userId: string;
  userName?: string;
  activeTab: 'buy-rent' | 'my-properties' | 'list-property';
  onNavigateTab: (tab: 'buy-rent' | 'my-properties' | 'list-property') => void;
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
    if (activeTab === 'buy-rent') {
      loadMarketplace(marketplaceFilter);
    } else if (activeTab === 'my-properties') {
      loadMyProperties();
    } else if (activeTab === 'list-property') {
      // List property acts as a trigger to open the modal and defaults to My Properties page
      setEditProperty(null);
      setIsDraftModalOpen(true);
      onNavigateTab('my-properties');
    }
  }, [activeTab, marketplaceFilter]);

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
      if (activeTab === 'buy-rent') {
        await loadMarketplace(marketplaceFilter);
      } else {
        await loadMyProperties();
      }
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 1. BUY / MOVE IN RENT - MARKETPLACE BROWSING */}
      {activeTab === 'buy-rent' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900 p-4 border border-zinc-800 rounded-xl">
            {/* Filter buttons */}
            <div className="flex gap-2">
              {(['all', 'sale', 'rental'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMarketplaceFilter(tab)}
                  className={`btn btn-sm rounded-full font-semibold px-4 capitalize ${
                    marketplaceFilter === tab
                      ? 'bg-warning text-black border-none'
                      : 'btn-ghost text-zinc-300 hover:text-white'
                  }`}
                >
                  {tab === 'all' ? 'All Active' : tab === 'sale' ? 'For Sale' : 'For Rent'}
                </button>
              ))}
            </div>

            {/* Suburb/City Search and Type Filters */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search city or location..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="input input-bordered input-sm bg-zinc-850 border-zinc-700 text-white w-full sm:w-48"
              />
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="select select-bordered select-sm bg-zinc-850 border-zinc-700 text-white w-full sm:w-36"
              >
                {propertyTypesForMarketplace.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-md text-warning"></span>
            </div>
          ) : filteredActiveProperties.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No active listings match your current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActiveProperties.map((property) => {
                const isUserInterested = (property as any).interestedUserIds?.includes(userId) || false;
                const firstImage = property.images && property.images.length > 0 ? property.images[0] : null;

                return (
                  <div
                    key={property.id}
                    className="card bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col h-full"
                  >
                    <div className="relative w-full h-48 bg-zinc-800 flex items-center justify-center text-zinc-600">
                      {firstImage ? (
                        <Image
                          src={firstImage}
                          alt={property.title || 'Property Image'}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl">🏢</span>
                          <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
                            No Photo Available
                          </span>
                        </div>
                      )}
                      <span
                        className={`absolute top-3 right-3 badge font-bold text-xs uppercase ${
                          property.property_scene === 'on_rent' || property.property_scene === 'sell_and_rent'
                            ? 'badge-info text-black'
                            : 'badge-success text-black'
                        }`}
                      >
                        {property.property_scene === 'on_rent' ? 'For Rent' : 'For Sale'}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-white text-base line-clamp-1">
                            {property.title}
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                          {property.propertyType} • {property.location}, {property.city}
                        </p>
                        <p className="text-lg font-black text-warning">
                          ${property.expectedPrice.toLocaleString()}
                          {property.property_scene === 'on_rent' && <span className="text-xs font-normal"> /mo</span>}
                        </p>
                      </div>

                      <div className="flex gap-4 text-xs text-zinc-400 border-t border-zinc-800/80 pt-3">
                        {property.bhk && <span>{property.bhk} BHK</span>}
                        {property.bedrooms && <span>{property.bedrooms} Beds</span>}
                        {property.bathrooms && <span>{property.bathrooms} Baths</span>}
                        {property.carpetArea && <span>{property.carpetArea} sqft</span>}
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 h-8">{property.description}</p>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        {property.agentName ? (
                          <div className="text-left">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Managing Agent</p>
                            <p className="text-xs font-semibold text-white">{property.agentName}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">No agent assigned</span>
                        )}

                        <button
                          onClick={() => handleToggleInterestClick(property.id, isUserInterested)}
                          className={`btn btn-xs rounded-full font-bold px-3 ${
                            isUserInterested
                              ? 'bg-rose-600 hover:bg-rose-700 text-white border-none'
                              : 'btn-outline border-zinc-700 text-zinc-300 hover:bg-warning hover:text-black hover:border-none'
                          }`}
                          disabled={actionLoading === property.id}
                        >
                          {actionLoading === property.id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : isUserInterested ? (
                            '❤️ Interested'
                          ) : (
                            '🤍 Mark Interested'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                      <div className="relative w-full sm:w-32 h-24 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-zinc-600">
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
                      <div className="relative w-full sm:w-32 h-24 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-zinc-600">
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
    </div>
  );
}
