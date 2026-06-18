'use client';

import React, { useState, JSX } from 'react';
import { User } from '@/utils/user';
import { updateUserProfile, softDeleteUserProfile } from '@/lib/users/profile';
import { logout } from '@/auth/userauth';
import { Camera, MapPin, User as UserIcon, Phone, Mail, FileText, Target, Compass } from 'lucide-react';
import Image from 'next/image';

interface UserProfileSectionProps {
  user: User;
  onProfileUpdated?: () => void;
}

export default function UserProfileSection({
  user,
  onProfileUpdated,
}: UserProfileSectionProps): JSX.Element {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states mapping directly to the User interface
  const [formData, setFormData] = useState({
    name: user.name || '',
    photoURL: user.photoURL || '',
    about: user.about || '',
    number: {
      countrycode: user.number?.countrycode || '',
      mobilenumber: user.number?.mobilenumber || ''
    },
    intent: user.intent || '',
    exploreintent: user.exploreintent || [],
    Address: {
      AddressLine1: user.Address?.AddressLine1 || '',
      AddressLine2: user.Address?.AddressLine2 || '',
      City: user.Address?.City || '',
      State: user.Address?.State || '',
      PostalCode: user.Address?.PostalCode || '',
      Country: user.Address?.Country || ''
    }
  });

  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateInput, setDeactivateInput] = useState('');

  const handleUpdateField = (field: string, value: any, parent?: 'number' | 'Address') => {
    setFormData(prev => {
      if (parent) {
        return { ...prev, [parent]: { ...prev[parent], [field]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleToggleExploreIntent = (intent: string) => {
    setFormData(prev => {
      const current = prev.exploreintent || [];
      if (current.includes(intent)) {
        return { ...prev, exploreintent: current.filter(i => i !== intent) };
      }
      return { ...prev, exploreintent: [...current, intent] };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile(user.uid, formData);
      setSuccess('Profile updated successfully.');
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDeactivate = async () => {
    if (deactivateInput.toLowerCase() !== 'deactivate') {
      setError('Please type "DEACTIVATE" to confirm.');
      return;
    }
    setSaving(true);
    try {
      await softDeleteUserProfile(user.uid);
      await logout();
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate account.');
      setSaving(false);
    }
  };

  const avatarPlaceholder = formData.name ? formData.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

  const exploreIntentOptions = ["House", "Apartment", "Condo", "Townhouse", "Land", "Commercial"];

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      {/* Profile Header Summary */}
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FBBF24]/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative group">
          <div className="w-28 h-28 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-bold text-4xl text-[#FBBF24] overflow-hidden">
            {formData.photoURL ? (
              <Image src={formData.photoURL} alt="Profile" fill sizes="112px" className="object-cover" unoptimized />
            ) : (
              avatarPlaceholder
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-[#FBBF24] text-black p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
            <Camera size={16} />
          </button>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-2 mt-2">
          <h2 className="text-3xl font-bold text-white">{formData.name || 'New User'}</h2>
          <p className="text-zinc-400 flex items-center justify-center sm:justify-start gap-2">
            <Mail size={16} /> {user.email}
          </p>
          <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs font-semibold text-white uppercase tracking-wider">
              {user.role}
            </span>
            {formData.intent && (
              <span className="px-3 py-1 bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-full text-xs font-bold text-[#FBBF24] uppercase tracking-wider">
                {formData.intent}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-[#FBBF24]/10 border border-[#FBBF24]/50 text-[#FBBF24] rounded-xl text-sm font-medium">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Personal Details */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <UserIcon size={20} className="text-[#FBBF24]" /> Personal Details
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleUpdateField('name', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors"
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-zinc-400 uppercase tracking-wider">Mobile Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="+1"
                    value={formData.number.countrycode}
                    onChange={(e) => handleUpdateField('countrycode', e.target.value, 'number')}
                    className="w-1/3 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Mobile Number"
                    value={formData.number.mobilenumber}
                    onChange={(e) => handleUpdateField('mobilenumber', e.target.value, 'number')}
                    className="w-2/3 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-zinc-400 uppercase tracking-wider">About You</label>
                <textarea
                  value={formData.about}
                  onChange={(e) => handleUpdateField('about', e.target.value)}
                  placeholder="Tell us what you are looking for..."
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors min-h-[100px]"
                ></textarea>
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-zinc-400 uppercase tracking-wider">Profile Photo URL</label>
                <input
                  type="text"
                  value={formData.photoURL}
                  onChange={(e) => handleUpdateField('photoURL', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Preferences & Address */}
          <div className="space-y-6">
            
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Target size={20} className="text-[#FBBF24]" /> Real Estate Goals
              </h3>

              <div className="form-control">
                <label className="label text-xs font-semibold text-zinc-400 uppercase tracking-wider">Primary Intent</label>
                <select 
                  value={formData.intent}
                  onChange={(e) => handleUpdateField('intent', e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors appearance-none"
                >
                  <option value="" disabled>Select your goal</option>
                  <option value="buyer">I want to Buy</option>
                  <option value="seller">I want to Sell</option>
                  <option value="renter">I want to Rent</option>
                  <option value="researcher">Just Researching</option>
                  <option value="homeowner">I am a Homeowner</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Interested In</label>
                <div className="flex flex-wrap gap-2">
                  {exploreIntentOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleToggleExploreIntent(opt)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        formData.exploreintent.includes(opt) 
                          ? 'bg-[#FBBF24]/10 border-[#FBBF24]/50 text-[#FBBF24]' 
                          : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <MapPin size={20} className="text-[#FBBF24]" /> Location Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 form-control">
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={formData.Address.AddressLine1}
                    onChange={(e) => handleUpdateField('AddressLine1', e.target.value, 'Address')}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors"
                  />
                </div>
                <div className="col-span-2 form-control">
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={formData.Address.AddressLine2}
                    onChange={(e) => handleUpdateField('AddressLine2', e.target.value, 'Address')}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors"
                  />
                </div>
                <div className="form-control">
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.Address.City}
                    onChange={(e) => handleUpdateField('City', e.target.value, 'Address')}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors"
                  />
                </div>
                <div className="form-control">
                  <input
                    type="text"
                    placeholder="State/Province"
                    value={formData.Address.State}
                    onChange={(e) => handleUpdateField('State', e.target.value, 'Address')}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors"
                  />
                </div>
                <div className="form-control">
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={formData.Address.PostalCode}
                    onChange={(e) => handleUpdateField('PostalCode', e.target.value, 'Address')}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors"
                  />
                </div>
                <div className="form-control">
                  <input
                    type="text"
                    placeholder="Country"
                    value={formData.Address.Country}
                    onChange={(e) => handleUpdateField('Country', e.target.value, 'Address')}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-[#FBBF24] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-end pt-4 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="btn bg-[#FBBF24] hover:bg-[#d9a520] text-black border-none font-bold rounded-full px-12 py-3 shadow-lg transition-transform hover:scale-105"
          >
            {saving ? <span className="loading loading-spinner loading-sm"></span> : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="border border-red-900/30 bg-red-950/10 p-8 rounded-3xl mt-12">
        <h3 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h3>
        <p className="text-zinc-400 mb-6 max-w-xl">
          Deactivating your account will remove your public profile and sign you out immediately.
        </p>

        {!showDeactivateConfirm ? (
          <button
            onClick={() => setShowDeactivateConfirm(true)}
            className="px-6 py-3 border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-xl font-medium transition-colors"
          >
            Deactivate Account
          </button>
        ) : (
          <div className="bg-red-950/30 border border-red-900/50 p-6 rounded-2xl max-w-lg space-y-4">
            <p className="text-sm font-bold text-red-400">
              Are you sure? Type "DEACTIVATE" to confirm:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="DEACTIVATE"
                value={deactivateInput}
                onChange={(e) => setDeactivateInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-black/50 border border-red-900/50 rounded-xl text-white focus:outline-none focus:border-red-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  disabled={saving || deactivateInput !== 'DEACTIVATE'}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
