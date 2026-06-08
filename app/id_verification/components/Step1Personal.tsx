"use client";

import { useState } from "react";
import { User, MapPin, Mail } from "lucide-react";
import { Agent } from "@/utils/user";
import { updateAgentProfile } from "@/lib/agents/dashboardService";
import { collectMetadata } from "@/lib/id_verify/metadata";
import { Metadata } from "@/utils/id_verify";

interface Step1PersonalProps {
  agent: Agent;
  onNext: (metadata: Metadata, updatedAgent: Agent) => void;
}

export default function Step1Personal({ agent, onNext }: Step1PersonalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: agent?.name?.firstname || "",
    lastName: agent?.name?.lastname || "",
    addressLine1: agent?.Address?.addressLine1 || "",
    addressLine2: agent?.Address?.addressLine2 || "",
    city: agent?.Address?.city || "",
    state: agent?.Address?.state || "",
    postalCode: agent?.Address?.postalCode || "",
    country: agent?.Address?.country || "",
    
    sameAsPermanent: false,
    mailAddressLine1: agent?.MailingAddress?.addressLine1 || "",
    mailAddressLine2: agent?.MailingAddress?.addressLine2 || "",
    mailCity: agent?.MailingAddress?.city || "",
    mailState: agent?.MailingAddress?.state || "",
    mailPostalCode: agent?.MailingAddress?.postalCode || "",
    mailCountry: agent?.MailingAddress?.country || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleContinue = async () => {
    if (!formData.firstName || !formData.lastName || !formData.addressLine1 || !formData.city || !formData.state || !formData.country) {
      setErrorMsg("Please fill in all required fields (Name and Permanent Address).");
      return;
    }
    if (!formData.sameAsPermanent && (!formData.mailAddressLine1 || !formData.mailCity || !formData.mailState || !formData.mailCountry)) {
      setErrorMsg("Please fill in all required fields (Mailing Address).");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const permanentAddress = {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
      };

      const mailingAddress = formData.sameAsPermanent ? permanentAddress : {
          addressLine1: formData.mailAddressLine1,
          addressLine2: formData.mailAddressLine2,
          city: formData.mailCity,
          state: formData.mailState,
          postalCode: formData.mailPostalCode,
          country: formData.mailCountry
      };

      // 1. Update permanent and mailing address in agent profile
      const success = await updateAgentProfile(agent.uid, agent.email, {
        name: { firstname: formData.firstName, lastname: formData.lastName },
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        Address: permanentAddress,
        MailingAddress: mailingAddress
      });

      if (!success) throw new Error("Failed to update profile information.");

      // 2. Start metadata collection in background
      const metadata = await collectMetadata();

      // 3. Move to next step
      const updatedAgent = {
        ...agent,
        name: { firstname: formData.firstName, lastname: formData.lastName },
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        Address: permanentAddress,
        MailingAddress: mailingAddress
      };

      onNext(metadata, updatedAgent as Agent);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-900/50 border border-white/10 rounded-3xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full border-2 border-[#D4AF37] bg-black flex items-center justify-center overflow-hidden mb-4">
          {agent?.photoURL ? (
            <img src={agent.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-zinc-500" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-white">Personal Information</h2>
        <p className="text-zinc-400 text-sm mt-1 text-center">Verify your personal details. Email and phone number cannot be changed here.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm text-center">
          {errorMsg}
        </div>
      )}

      <div className="space-y-6">
        {/* Name section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">First Name</label>
            <input 
              type="text" name="firstName" value={formData.firstName} onChange={handleChange}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Name</label>
            <input 
              type="text" name="lastName" value={formData.lastName} onChange={handleChange}
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
        </div>

        {/* Read-only Contact section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full ml-1 text-zinc-500">Locked</span></label>
            <input 
              type="text" value={agent?.email || ""} readOnly disabled
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl p-3 text-zinc-500 cursor-not-allowed outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phone <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full ml-1 text-zinc-500">Locked</span></label>
            <input 
              type="text" value={agent?.number?.countrycode ? `${agent.number.countrycode} ${agent.number.mobilenumber}` : ""} readOnly disabled
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl p-3 text-zinc-500 cursor-not-allowed outline-none"
            />
          </div>
        </div>

        {/* Permanent Address */}
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2"><MapPin size={18} className="text-[#D4AF37]"/> Permanent Address</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Address Line 1</label>
              <input 
                type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Address Line 2 (Optional)</label>
              <input 
                type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">City</label>
                <input 
                  type="text" name="city" value={formData.city} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">State</label>
                <input 
                  type="text" name="state" value={formData.state} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Postal Code</label>
                <input 
                  type="text" name="postalCode" value={formData.postalCode} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Country</label>
              <input 
                type="text" name="country" value={formData.country} onChange={handleChange}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Mailing Address */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-white font-medium flex items-center gap-2"><Mail size={18} className="text-[#D4AF37]"/> Mailing Address</h3>
             <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer hover:text-white transition">
               <input 
                 type="checkbox" name="sameAsPermanent" 
                 checked={formData.sameAsPermanent} onChange={handleChange}
                 className="accent-[#D4AF37] w-4 h-4 rounded"
               />
               Same as permanent
             </label>
          </div>

          {!formData.sameAsPermanent && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Address Line 1</label>
                <input 
                  type="text" name="mailAddressLine1" value={formData.mailAddressLine1} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Address Line 2 (Optional)</label>
                <input 
                  type="text" name="mailAddressLine2" value={formData.mailAddressLine2} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">City</label>
                  <input 
                    type="text" name="mailCity" value={formData.mailCity} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">State</label>
                  <input 
                    type="text" name="mailState" value={formData.mailState} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Postal Code</label>
                  <input 
                    type="text" name="mailPostalCode" value={formData.mailPostalCode} onChange={handleChange}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Country</label>
                <input 
                  type="text" name="mailCountry" value={formData.mailCountry} onChange={handleChange}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={isSaving}
          className="w-full mt-6 bg-[#D4AF37] hover:bg-[#c4a133] text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
        >
          {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" /> : null}
          {isSaving ? "Saving & Analyzing Device..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
