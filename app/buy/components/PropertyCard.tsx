// app/buy/components/PropertyCard.tsx
'use client';

import React, { JSX } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Property } from '@/lib/properties/property.types';

interface PropertyCardProps {
  property: Property;
  userId?: string;
  onToggleInterest: (propertyId: string) => void;
  onStartConversation: (property: Property) => void;
  actionLoading: string | null;
}

export default function PropertyCard({
  property,
  userId,
  onToggleInterest,
  onStartConversation,
  actionLoading
}: PropertyCardProps): JSX.Element {
  const router = useRouter();
  const isUserInterested = (property as any).interestedUserIds?.includes(userId) || false;
  const firstImage = property.images && property.images.length > 0 ? property.images[0] : null;


  return (
    <div 
      onClick={() => router.push(`/property/${property.id}`)}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col sm:flex-row h-full sm:h-48 mb-4 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative w-full sm:w-64 h-48 sm:h-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={property.title || 'Property Image'}
            fill
            sizes="(max-width: 768px) 100vw, 256px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">🏢</span>
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">
              No Photo Available
            </span>
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-gray-900 text-lg line-clamp-1 flex items-center gap-2">
              {property.title}
              {property.agentName && (
                <span className="text-xs font-normal text-gray-500 border-l border-gray-300 pl-2">
                  {property.agentName}
                </span>
              )}
            </h4>
            
            {/* Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleInterest(property.id);
              }}
              disabled={actionLoading === property.id}
              className={`p-1 rounded-full transition-colors ${
                isUserInterested ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {actionLoading === property.id ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : isUserInterested ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {property.addressLine1 && `${property.addressLine1},`} {property.city}
          </p>
          
          {/* Price (Secondary display since prominent on map) */}
          <p className="text-sm font-bold text-gray-900 mt-1">
            ${property.expectedPrice.toLocaleString()}
            {property.property_scene === 'on_rent' && <span className="font-normal text-gray-500"> /mo</span>}
          </p>
        </div>

        <div className="mt-4">
          <div className="flex gap-4 text-sm text-gray-700 font-medium">
            {property.bedrooms && <span className="flex items-center gap-1">🛏️ {property.bedrooms}</span>}
            {property.bathrooms && <span className="flex items-center gap-1">🛁 {property.bathrooms}</span>}
            {property.bhk && <span className="flex items-center gap-1">🚗 {property.bhk}</span>}
            {property.carpetArea && <span className="flex items-center gap-1">📐 {property.carpetArea} sqft</span>}
          </div>
          
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>{property.propertyType} {property.property_scene === 'on_rent' ? 'for Rent' : 'for Sale'}</span>
            
            {/* Contact Agent Action */}
            {property.agentId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartConversation(property);
                }}
                disabled={actionLoading === `chat_${property.id}`}
                className="text-amber-600 hover:text-amber-700 font-bold uppercase tracking-wider text-[10px]"
              >
                {actionLoading === `chat_${property.id}` ? 'Loading...' : 'Message Agent'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
