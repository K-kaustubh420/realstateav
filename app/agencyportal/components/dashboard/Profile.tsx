import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { updateAgencyProfile } from "../../../../lib/agency/profile";
import { deleteAgency } from "../../../../lib/agency/agency";
import { Loader2, CheckCircle, Save, Edit3, Trash2 } from "lucide-react";

type Props = {
  agencyId: string;
  initialValues: {
    agencyName: string;
    about: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    website: string;
    gstNumber: string;
    logoUrl: string;
    bannerUrl: string;
    gpsLat: number;
    gpsLng: number;
  };
  onUpdate: () => Promise<void>;
  onError: (msg: string) => void;
  onFeedback: (msg: string) => void;
};

export default function Profile({ agencyId, initialValues, onUpdate, onError, onFeedback }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState(initialValues);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasChanges = JSON.stringify(values) !== JSON.stringify(initialValues);

  const handleDiscard = () => {
    setValues(initialValues);
    setIsEditing(false);
  };

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        gsap.utils.toArray('.gsap-section', containerRef.current),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateAgencyProfile(agencyId, values.agencyName, {
        about: values.about,
        phone: values.phone,
        email: values.email,
        Address: {
          addressLine1: values.address,
          city: values.city,
          state: values.state,
          postalCode: values.pincode,
          country: "India", // Default or extract
        },
        website: values.website,
        gstNumber: values.gstNumber,
        logoUrl: values.logoUrl,
        bannerUrl: values.bannerUrl,
        gpsLocation: { lat: values.gpsLat, lng: values.gpsLng },
      });
      await onUpdate();
      onFeedback("Agency profile updated successfully.");
      setIsEditing(false);
    } catch (err: any) {
      onError(err?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Delete this agency permanently? This cannot be undone.");
    if (!confirm) return;
    setLoading(true);
    try {
      await deleteAgency(agencyId);
      await onUpdate();
      onFeedback("Agency deleted. You can create a new agency now.");
    } catch (err: any) {
      onError(err?.message || "Unable to delete agency.");
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-8 relative">
      {/* GSAP Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl">
           <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
        </div>
      )}

      <div className="gsap-section flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Agency Profile</h2>
          <p className="mt-1 text-sm text-slate-400">Manage your agency's public information and contact details.</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              {!hasChanges && (
                <p className="text-sm text-slate-500 italic mr-2 hidden sm:block">No changes to save</p>
              )}
              <button
                onClick={handleDiscard}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !hasChanges}
                className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-[#D4AF37]/20 transition-all hover:bg-[#c4a133] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              <Edit3 className="h-4 w-4" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className={`gsap-section grid gap-8 ${!isEditing && 'opacity-90'}`}>
        {/* Basic Info Section */}
        <div className="space-y-6 bg-zinc-900/50 p-6 md:p-8 rounded-3xl border border-white/5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><CheckCircle className="h-5 w-5 text-[#D4AF37]" /> Basic Information</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Agency Name</label>
              <input 
                value={values.agencyName} 
                onChange={(e) => setValues({ ...values, agencyName: e.target.value })} 
                disabled={!isEditing}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white transition-colors focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-70" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Contact Email</label>
              <input 
                value={values.email} 
                readOnly
                disabled={true}
                title="Email cannot be changed"
                className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white opacity-60 cursor-not-allowed" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">About Agency</label>
            <textarea 
              value={values.about} 
              onChange={(e) => setValues({ ...values, about: e.target.value })} 
              disabled={!isEditing}
              className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white transition-colors focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-70 min-h-[120px] resize-y" 
            />
          </div>
        </div>

        {/* Contact & Location Section */}
        <div className="space-y-6 bg-zinc-900/50 p-6 md:p-8 rounded-3xl border border-white/5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><CheckCircle className="h-5 w-5 text-[#D4AF37]" /> Contact & Location</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Phone Number</label>
              <input 
                value={values.phone} 
                readOnly
                disabled={true}
                title="Phone number cannot be changed"
                className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white opacity-60 cursor-not-allowed" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Website</label>
              <input 
                value={values.website} 
                onChange={(e) => setValues({ ...values, website: e.target.value })} 
                disabled={!isEditing}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white transition-colors focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-70" 
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Address Line 1</label>
              <input 
                value={values.address} 
                onChange={(e) => setValues({ ...values, address: e.target.value })} 
                disabled={!isEditing}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white transition-colors focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-70" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">City</label>
              <input 
                value={values.city} 
                onChange={(e) => setValues({ ...values, city: e.target.value })} 
                disabled={!isEditing}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white transition-colors focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-70" 
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">State</label>
              <input 
                value={values.state} 
                onChange={(e) => setValues({ ...values, state: e.target.value })} 
                disabled={!isEditing}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white transition-colors focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-70" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Postal Code</label>
              <input 
                value={values.pincode} 
                onChange={(e) => setValues({ ...values, pincode: e.target.value })} 
                disabled={!isEditing}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white transition-colors focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-70" 
              />
            </div>
          </div>
        </div>

        {/* Media & Branding Section */}
        <div className="space-y-6 bg-zinc-900/50 p-6 md:p-8 rounded-3xl border border-white/5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><CheckCircle className="h-5 w-5 text-[#D4AF37]" /> Media & Branding</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Logo URL</label>
              <input 
                value={values.logoUrl} 
                onChange={(e) => setValues({ ...values, logoUrl: e.target.value })} 
                disabled={!isEditing}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white transition-colors focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-70" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Banner URL</label>
              <input 
                value={values.bannerUrl} 
                onChange={(e) => setValues({ ...values, bannerUrl: e.target.value })} 
                disabled={!isEditing}
                className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white transition-colors focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-70" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
             <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">GST Number</label>
             <input 
               value={values.gstNumber} 
               onChange={(e) => setValues({ ...values, gstNumber: e.target.value })} 
               disabled={!isEditing}
               className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3.5 text-sm text-white transition-colors focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-70" 
             />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-rose-400">Danger Zone</h3>
              <p className="mt-1 text-sm text-rose-400/80">Permanently delete this agency and remove all associated data. This action cannot be reversed.</p>
            </div>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-rose-500/10 border border-rose-500/20 px-6 py-3 text-sm font-semibold text-rose-400 transition-all hover:bg-rose-500 hover:text-white disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Delete Agency
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
