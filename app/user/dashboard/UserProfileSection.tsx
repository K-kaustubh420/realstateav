'use client';

import React, { useState, useEffect, JSX } from 'react';
import { UserProfile, updateUserProfile, softDeleteUserProfile } from '@/lib/users/profile';
import { logout } from '@/lib/users/userauth';
import Image from 'next/image';

interface UserProfileSectionProps {
  userEmail: string;
  onProfileUpdated?: () => void;
}

export default function UserProfileSection({
  userEmail,
  onProfileUpdated,
}: UserProfileSectionProps): JSX.Element {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  // New identity fields
  const [governmentIdType, setGovernmentIdType] = useState('');
  const [governmentIdNumber, setGovernmentIdNumber] = useState('');
  const [governmentIdImageUrl, setGovernmentIdImageUrl] = useState('');
  const [identityConsentAccepted, setIdentityConsentAccepted] = useState(false);

  // Deactivation confirmation state
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateInput, setDeactivateInput] = useState('');

  // Load profile
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      // We will load profile using the API
      const { fetchUserProfile } = await import('@/lib/users/profile');
      const data = await fetchUserProfile(userEmail);
      if (data) {
        setProfile(data);
        setFullName(data.fullName || '');
        setPhoneNumber(data.phoneNumber || '');
        setPhotoURL(data.photoURL || '');
        setPermanentAddress(data.permanentAddress || '');
        setGovernmentIdType(data.governmentIdType || '');
        setGovernmentIdNumber(data.governmentIdNumber || '');
        setGovernmentIdImageUrl(data.governmentIdImageUrl || '');
        setIdentityConsentAccepted(data.identityConsentAccepted ?? false);
      } else {
        setError('Failed to fetch user profile details.');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      loadProfile();
    }
  }, [userEmail]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile(userEmail, {
        fullName: fullName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        photoURL: photoURL.trim() || undefined,
        permanentAddress: permanentAddress.trim() || undefined,
        governmentIdType: governmentIdType.trim() || undefined,
        governmentIdNumber: governmentIdNumber.trim() || undefined,
        governmentIdImageUrl: governmentIdImageUrl.trim() || undefined,
        identityConsentAccepted: identityConsentAccepted,
      });
      setSuccess('Profile updated successfully.');
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (deactivateInput.toLowerCase() !== 'deactivate') {
      setError('Please type "DEACTIVATE" to confirm.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await softDeleteUserProfile(userEmail);
      await logout();
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate account.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-md text-warning"></span>
      </div>
    );
  }

  // Placeholder initial for avatar
  const avatarPlaceholder = fullName ? fullName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Info Summary Card */}
      <div className="card bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="avatar">
          <div className="w-20 h-20 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-3xl overflow-hidden relative">
            {photoURL ? (
              <Image
                src={photoURL}
                alt="User Profile Pic"
                fill
                sizes="80px"
                className="object-cover"
                unoptimized // In case of external URL formatting
              />
            ) : (
              avatarPlaceholder
            )}
          </div>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-1">
          <h2 className="text-xl font-bold text-white">{fullName || 'New User'}</h2>
          <p className="text-sm text-zinc-400">{userEmail}</p>
          <span className="badge badge-warning font-bold text-xs uppercase tracking-wider mt-1 px-3">
            Standard User
          </span>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="card bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6">Profile Settings</h3>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-900/30 border border-emerald-800 text-emerald-200 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-zinc-300">Full Name</span>
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-zinc-300">Phone Number</span>
              </label>
              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-zinc-300">Profile Photo URL</span>
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/... or direct image link"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full text-xs"
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-zinc-300">Permanent Address</span>
            </label>
            <textarea
              placeholder="Your home address"
              value={permanentAddress}
              onChange={(e) => setPermanentAddress(e.target.value)}
              className="textarea textarea-bordered bg-zinc-800 border-zinc-700 text-white w-full h-24"
            ></textarea>
          </div>

          {/* Government ID Type */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-zinc-300">Government ID Type</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Passport, Aadhar"
              value={governmentIdType}
              onChange={(e) => setGovernmentIdType(e.target.value)}
              className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
            />
          </div>
          {/* Government ID Number */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-zinc-300">Government ID Number</span>
            </label>
            <input
              type="text"
              placeholder="ID Number"
              value={governmentIdNumber}
              onChange={(e) => setGovernmentIdNumber(e.target.value)}
              className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
            />
          </div>
          {/* Government ID Image URL */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-zinc-300">Government ID Image URL</span>
            </label>
            <input
              type="text"
              placeholder="https://.../id.jpg"
              value={governmentIdImageUrl}
              onChange={(e) => setGovernmentIdImageUrl(e.target.value)}
              className="input input-bordered bg-zinc-800 border-zinc-700 text-white w-full"
            />
          </div>
          {/* Identity Consent */}
          <div className="form-control w-full flex items-center gap-2">
            <label className="label">
              <span className="label-text text-zinc-300">I confirm these identity details are valid and belong to me.</span>
            </label>
            <input
            aria-label='Identiy Consent Checkbox'
              type="checkbox"
              checked={identityConsentAccepted}
              onChange={(e) => setIdentityConsentAccepted(e.target.checked)}
              className="checkbox checkbox-primary"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="btn bg-[#FBBF24] hover:bg-[#d9a520] text-black border-none font-bold px-6"
              disabled={saving}
            >
              {saving ? <span className="loading loading-spinner loading-sm"></span> : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Soft Delete Account Card */}
      <div className="card bg-zinc-900 border border-red-900/30 p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-zinc-400 mb-6">
          Deactivating your account is soft-deletion only. Your profile documents will be flagged as deleted, and you will be signed out.
        </p>

        {!showDeactivateConfirm ? (
          <button
            onClick={() => setShowDeactivateConfirm(true)}
            className="btn btn-outline btn-error btn-sm capitalize"
          >
            Deactivate Account
          </button>
        ) : (
          <div className="space-y-4 p-4 border border-red-800/40 bg-red-950/20 rounded-xl">
            <p className="text-xs text-red-300 font-bold">
              Warning: Are you absolutely sure? To confirm, please type &quot;DEACTIVATE&quot; below:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Type DEACTIVATE"
                value={deactivateInput}
                onChange={(e) => setDeactivateInput(e.target.value)}
                className="input input-bordered input-sm bg-zinc-800 border-zinc-700 text-white flex-1"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="btn btn-sm btn-ghost text-zinc-400"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  className="btn btn-sm btn-error font-bold"
                  disabled={saving || deactivateInput.toLowerCase() !== 'deactivate'}
                >
                  Confirm Deactivate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
