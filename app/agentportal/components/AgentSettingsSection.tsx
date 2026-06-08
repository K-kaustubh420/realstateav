"use client";

import { useState } from "react";
import { Agent } from "@/utils/user";
import { User, ShieldCheck, ShieldAlert, Clock, Settings2, Save } from "lucide-react";
import dynamic from "next/dynamic";

const Preference = dynamic(() => import("./Preference"), {
  ssr: false,
  loading: () => <div className="animate-pulse h-96 bg-zinc-900/50 rounded-3xl" />
});
import ShareProfileButton from "./ShareProfileButton";
import { updateAgentProfile } from "@/lib/agents/dashboardService";

interface AgentSettingsSectionProps {
  agent: Agent & { id: string };
  setAgent: React.Dispatch<React.SetStateAction<(Agent & { id: string }) | null>>;
}

export default function AgentSettingsSection({ agent, setAgent }: AgentSettingsSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Basic Form State
  const [formData, setFormData] = useState({
    firstName: agent.name?.firstname || "",
    lastName: agent.name?.lastname || "",
    about: agent.about || "",
    addressLine1: agent.Address?.addressLine1 || "",
    city: agent.Address?.city || "",
    state: agent.Address?.state || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const success = await updateAgentProfile(agent.uid, agent.email, {
        name: { firstname: formData.firstName, lastname: formData.lastName },
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        about: formData.about,
        Address: {
          addressLine1: formData.addressLine1,
          city: formData.city,
          state: formData.state,
          postalCode: agent.Address?.postalCode || "",
          country: agent.Address?.country || ""
        }
      });
      
      if (!success) throw new Error("Failed to update in database");
      
      // Update local state
      setAgent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          name: { ...prev.name, firstname: formData.firstName, lastname: formData.lastName },
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          about: formData.about,
          Address: { 
            ...prev.Address, 
            addressLine1: formData.addressLine1, 
            city: formData.city, 
            state: formData.state,
            postalCode: prev.Address?.postalCode || "",
            country: prev.Address?.country || ""
          }
        };
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Determine Verification Icon
  let VerificationBadge = null;
  if (agent.id_verify === "verified") {
    VerificationBadge = (
      <div className="absolute -bottom-2 -right-2 bg-zinc-950 rounded-full p-1 border border-emerald-500/30">
        <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-full" title="Verified Agent">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>
    );
  } else if (agent.id_verify === "pending") {
    VerificationBadge = (
      <div className="absolute -bottom-2 -right-2 bg-zinc-950 rounded-full p-1 border border-amber-500/30">
        <div className="bg-amber-500/20 text-amber-400 p-1.5 rounded-full" title="Verification Pending">
          <Clock className="w-5 h-5" />
        </div>
      </div>
    );
  } else {
    VerificationBadge = (
      <div className="absolute -bottom-2 -right-2 bg-zinc-950 rounded-full p-1 border border-rose-500/30">
        <div className="bg-rose-500/20 text-rose-400 p-1.5 rounded-full" title="Unverified">
          <ShieldAlert className="w-5 h-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-[#D4AF37]" /> Profile Settings
          </h2>
          <p className="text-sm text-zinc-400">Manage your public profile and preferences.</p>
        </div>
        <ShareProfileButton agentId={agent.uid} />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Col: Avatar & KYC Warning */}
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
            <div className="relative w-32 h-32 rounded-full border-2 border-[#D4AF37] bg-black flex items-center justify-center mb-4 overflow-hidden">
              {agent.photoURL ? (
                <img src={agent.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-zinc-500" />
              )}
              {VerificationBadge}
            </div>
            <h3 className="font-bold text-lg text-white">{agent.fullName || "Agent Name"}</h3>
            <p className="text-sm text-zinc-400">{agent.email}</p>
          </div>

          <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-2">KYC Details Locked</p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Your government ID details, selfie, and verified name cannot be changed from this page for security reasons. 
              Contact support if you need to re-verify.
            </p>
          </div>
        </div>

        {/* Right Col: Basic Info Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-3xl p-8 shadow-lg space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">Basic Information</h3>
            
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">About (Bio)</label>
              <textarea 
                name="about"
                rows={3}
                value={formData.about}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-colors resize-none"
                placeholder="Tell clients about your expertise..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                Contact Number <span className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">Verified</span>
              </label>
              <input 
                type="text" 
                value={agent.number?.countrycode ? `${agent.number.countrycode} ${agent.number.mobilenumber}` : agent.number?.mobilenumber || "No number provided"}
                readOnly
                disabled
                title="Phone number cannot be changed once verified. Please contact support."
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl p-3 text-sm text-zinc-500 cursor-not-allowed outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Address Line 1</label>
                <input 
                  type="text" 
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">City</label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">State</label>
                <input 
                  type="text" 
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#D4AF37] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c4a133] text-black font-bold px-6 py-3 rounded-xl transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50"
              >
                {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 mt-8">
        <Preference agent={agent} setAgent={setAgent} />
      </div>

    </div>
  );
}
