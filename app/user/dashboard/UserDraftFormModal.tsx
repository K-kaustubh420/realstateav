'use client';

import React, { useState, useEffect, JSX } from 'react';
import { Property } from '@/lib/properties/property.types';
import { createUserDraft, updateUserDraft } from '@/lib/users/properties';

interface UserDraftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  userEmail: string;
  userId: string;
  userName?: string;
  editProperty?: Property | null;
}

const AMENITIES_OPTIONS = [
  'Wi-Fi',
  'Parking',
  'Gym',
  'Swimming Pool',
  '24/7 Security',
  'Power Backup',
  'Elevator',
  'Clubhouse',
  'Children Play Area',
  'Garden',
];

const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Villa',
  'Condo',
  'Penthouse',
  'Studio',
  'Office Space',
  'Shop / Retail',
  'Plot / Land',
];

export default function UserDraftFormModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  userEmail,
  userId,
  userName,
  editProperty,
}: UserDraftFormModalProps): JSX.Element | null {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [propertyScene, setPropertyScene] = useState<'draft_for_sale' | 'draft_for_rental'>('draft_for_sale');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [bhk, setBhk] = useState('');
  const [carpetArea, setCarpetArea] = useState('');
  const [builtUpArea, setBuiltUpArea] = useState('');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState('');

  useEffect(() => {
    if (editProperty) {
      setPropertyScene(
        editProperty.property_scene === 'draft_for_rental' || editProperty.property_scene === 'on_rent'
          ? 'draft_for_rental'
          : 'draft_for_sale'
      );
      setPropertyType(editProperty.propertyType || 'Apartment');
      setTitle(editProperty.title || '');
      setLocation(editProperty.location || '');
      setAddressLine1(editProperty.addressLine1 || '');
      setAddressLine2(editProperty.addressLine2 || '');
      setCity(editProperty.city || '');
      setState(editProperty.state || '');
      setPincode(editProperty.pincode || '');
      setExpectedPrice(editProperty.expectedPrice?.toString() || '');
      setBedrooms(editProperty.bedrooms?.toString() || '');
      setBathrooms(editProperty.bathrooms?.toString() || '');
      setBhk(editProperty.bhk?.toString() || '');
      setCarpetArea(editProperty.carpetArea?.toString() || '');
      setBuiltUpArea(editProperty.builtUpArea?.toString() || '');
      setDescription(editProperty.description || '');
      setAmenities(editProperty.amenities || []);
      setImageUrls(editProperty.images?.join(', ') || '');
    } else {
      // Reset form
      setPropertyScene('draft_for_sale');
      setPropertyType('Apartment');
      setTitle('');
      setLocation('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPincode('');
      setExpectedPrice('');
      setBedrooms('');
      setBathrooms('');
      setBhk('');
      setCarpetArea('');
      setBuiltUpArea('');
      setDescription('');
      setAmenities([]);
      setImageUrls('');
    }
    setError(null);
  }, [editProperty, isOpen]);

  if (!isOpen) return null;

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setAmenities((prev) => [...prev, amenity]);
    } else {
      setAmenities((prev) => prev.filter((a) => a !== amenity));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simple validations
    if (!location || !addressLine1 || !city || !state || !pincode || !expectedPrice || !description) {
      setError('Please fill in all required fields (Location, Address, City, State, Pincode, Price, and Description).');
      setLoading(false);
      return;
    }

    const imagesArray = imageUrls
      ? imageUrls.split(',').map((url) => url.trim()).filter((url) => url.length > 0)
      : [];

    const parsedData = {
      title: title.trim() || undefined,
      propertyType,
      property_scene: propertyScene,
      location: location.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      expectedPrice: Number(expectedPrice) || 0,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      bhk: bhk ? Number(bhk) : undefined,
      carpetArea: carpetArea ? Number(carpetArea) : undefined,
      builtUpArea: builtUpArea ? Number(builtUpArea) : undefined,
      description: description.trim(),
      amenities,
      images: imagesArray,
      listedUnderAgency: false,
      listingType: 'individual' as const,
      coordinates: { lat: 0, lng: 0 },
    };

    try {
      if (editProperty) {
        // Edit own untouched draft
        await updateUserDraft(editProperty.id, parsedData, userEmail);
      } else {
        // Create new draft
        await createUserDraft(parsedData, userEmail, userId, userName);
      }
      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save property draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <h3 className="text-lg font-bold text-white">
            {editProperty ? 'Edit Property Draft' : 'List New Property (Create Draft)'}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-zinc-400 hover:text-white"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Core Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-zinc-300 font-medium">Listing For *</span>
              </label>
              <select
                value={propertyScene}
                onChange={(e) => setPropertyScene(e.target.value as any)}
                className="select select-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                required
              >
                <option value="draft_for_sale">Sale (Draft for Sale)</option>
                <option value="draft_for_rental">Rent (Draft for Rent)</option>
              </select>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-zinc-300 font-medium">Property Type *</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="select select-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                required
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Details */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-zinc-300 font-medium">Property Title (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Elegant 3 BHK Apartment with Skyline Views"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-zinc-300 font-medium">Location / Suburb *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Indiranagar, South Yarra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-zinc-300 font-medium">Expected Price ($ / ₹) *</span>
              </label>
              <input
                type="number"
                placeholder="Price"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Address Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-zinc-300 font-medium">Address Line 1 *</span>
                </label>
                <input
                  type="text"
                  placeholder="Street address, P.O. box"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-zinc-300 font-medium">Address Line 2 (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Apartment, suite, unit, building"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-zinc-300 font-medium">City *</span>
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-zinc-300 font-medium">State *</span>
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-zinc-300 font-medium">Pincode *</span>
                </label>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                  required
                />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Specifications (Optional)</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-zinc-300">BHK</span>
                </label>
                <input
                  type="number"
                  placeholder="BHK"
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-zinc-300">Bedrooms</span>
                </label>
                <input
                  type="number"
                  placeholder="Bedrooms"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-zinc-300">Bathrooms</span>
                </label>
                <input
                  type="number"
                  placeholder="Bathrooms"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-zinc-300">Carpet Area (sq ft)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1200"
                  value={carpetArea}
                  onChange={(e) => setCarpetArea(e.target.value)}
                  className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-zinc-300">Built-up Area (sq ft)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1400"
                  value={builtUpArea}
                  onChange={(e) => setBuiltUpArea(e.target.value)}
                  className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-zinc-300 font-medium">Description *</span>
            </label>
            <textarea
              placeholder="Describe the property layout, location advantages, pricing logic, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered bg-zinc-800 border-zinc-700 text-white w-full h-32"
              required
            ></textarea>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text text-zinc-300 font-medium">Amenities</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES_OPTIONS.map((amenity) => (
                <label key={amenity} className="label justify-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.includes(amenity)}
                    onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                    className="checkbox checkbox-sm checkbox-warning bg-zinc-800 border-zinc-700"
                  />
                  <span className="label-text text-zinc-300 text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-zinc-300 font-medium">Image URLs (comma-separated)</span>
            </label>
            <textarea
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              className="textarea textarea-bordered bg-zinc-800 border-zinc-700 text-white w-full h-20 text-xs"
            ></textarea>
            <label className="label">
              <span className="label-text-alt text-zinc-500">Provide direct image links separated by commas.</span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-950">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost text-zinc-400 hover:text-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn bg-[#FBBF24] hover:bg-[#d9a520] text-black border-none font-bold px-6"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : editProperty ? (
              'Save Changes'
            ) : (
              'Create Draft'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
