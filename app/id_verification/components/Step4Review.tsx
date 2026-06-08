"use client";

import { useState, useEffect } from "react";
import { Agent } from "@/utils/user";
import { Metadata, DocumentDetails } from "@/utils/id_verify";
import { submitAgentKYC } from "@/lib/id_verify/service";
import { generateViewUrl } from "@/lib/id_verify/image_upload/r2";
import { CheckCircle2, FileText, User, ShieldCheck, MapPin, Loader2, Image as ImageIcon, Server, Globe, Hash } from "lucide-react";
import { useRouter } from "next/navigation";

function SecureDocument({ objectKey, type }: { objectKey: string | undefined, type: 'contain' | 'cover' }) {
    const [url, setUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!objectKey) {
            setLoading(false);
            return;
        }
        
        if (objectKey.startsWith('http') || objectKey.startsWith('mock_') || objectKey.startsWith('blob:')) {
            setUrl(objectKey);
            setLoading(false);
            return;
        }

        generateViewUrl(objectKey).then(res => {
            if (res.success && res.url) {
                setUrl(res.url);
            }
            setLoading(false);
        });
    }, [objectKey]);

    if (loading) return <div className={`block relative w-full h-full bg-black flex items-center justify-center`}><Loader2 className="animate-spin text-zinc-500 w-4 h-4" /></div>;
    if (!url) return <div className={`block relative w-full h-full bg-black flex items-center justify-center`}><span className="text-[10px] text-zinc-500 break-all p-2">{objectKey}</span></div>;
    
    return (
        <a href={url} target="_blank" rel="noreferrer" className={`block relative w-full h-full bg-black hover:opacity-80 transition-opacity`}>
            <img src={url} className={`w-full h-full object-${type}`} alt="Secure Document" />
        </a>
    );
}

interface Step4ReviewProps {
  agent: Agent;
  metadata: Metadata;
  documentDetails: { idtype: string; idno: string; id_ImageURL: string; DOB: string; issuedBy: string; issuedDate: string; validTill: string; };
  selfieUrl: string;
  selfieIdUrl: string;
  onBack: () => void;
}

export default function Step4Review({ agent, metadata, documentDetails, selfieUrl, selfieIdUrl, onBack }: Step4ReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const fullDocumentDetails: DocumentDetails = {
        idtype: documentDetails.idtype,
        idno: documentDetails.idno,
        DOB: documentDetails.DOB,
        issuedBy: documentDetails.issuedBy,
        issuedDate: documentDetails.issuedDate,
        validTill: documentDetails.validTill,
        id_ImageURL: documentDetails.id_ImageURL,
        selfie_ImageURL: selfieUrl,
        selfie_with_id_ImageURL: selfieIdUrl,
        permanent_address: {
          addressLine1: agent.Address?.addressLine1 || "",
          addressLine2: agent.Address?.addressLine2 || "",
          city: agent.Address?.city || "",
          state: agent.Address?.state || "",
          country: agent.Address?.country || "",
          postalCode: agent.Address?.postalCode || "",
        },
        mailing_address: {
          addressLine1: agent.MailingAddress?.addressLine1 || agent.Address?.addressLine1 || "",
          addressLine2: agent.MailingAddress?.addressLine2 || agent.Address?.addressLine2 || "",
          city: agent.MailingAddress?.city || agent.Address?.city || "",
          state: agent.MailingAddress?.state || agent.Address?.state || "",
          country: agent.MailingAddress?.country || agent.Address?.country || "",
          postalCode: agent.MailingAddress?.postalCode || agent.Address?.postalCode || "",
        }
      };

      const payload = {
        role: agent.role || "agent",
        agent_id: agent.uid,
        fullName: agent.fullName || `${agent.name?.firstname || ''} ${agent.name?.lastname || ''}`.trim(),
        email: agent.email,
        documentDetails: fullDocumentDetails,
        metadata: metadata
      };

      const result = await submitAgentKYC(payload);

      if (result.success) {
        setSuccess(true);
      } else {
        throw new Error(result.message || "Failed to submit KYC.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-10 bg-zinc-900/50 border border-green-500/20 rounded-3xl backdrop-blur-sm animate-in fade-in zoom-in duration-500 flex flex-col items-center text-center space-y-6 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Verification Submitted!</h2>
          <p className="text-zinc-400">Your identity verification request has been securely cryptographically signed and transmitted to our admins. We will review it shortly.</p>
        </div>
        <button 
          onClick={() => router.push("/agentportal")}
          className="px-8 py-4 bg-[#D4AF37] hover:bg-[#c4a133] text-black font-bold rounded-xl transition shadow-[0_0_15px_rgba(212,175,55,0.2)] mt-4"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-zinc-900/50 border border-white/10 rounded-3xl backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldCheck className="text-[#D4AF37]" /> Review & Submit</h2>
          <p className="text-zinc-400 text-sm mt-1">Please ensure all collected details, documents, and device telemetry are correct. <br/><span className="text-[#D4AF37]">All of this data will be digitally signed into an immutable payload to guarantee authenticity.</span></p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-6">
            {/* Personal details */}
            <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-medium flex items-center gap-2 border-b border-white/10 pb-3"><User size={18} className="text-zinc-400"/> Personal Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                <span className="text-zinc-500 block mb-1">Full Name</span>
                <span className="text-white font-medium">{agent.fullName || `${agent.name?.firstname} ${agent.name?.lastname}`}</span>
                </div>
                <div>
                <span className="text-zinc-500 block mb-1">Email Address</span>
                <span className="text-white font-medium block">{agent.email}</span>
                </div>
            </div>
            <div className="mt-2 text-sm border-t border-white/5 pt-3">
                <span className="text-zinc-500 block mb-1 flex items-center gap-1"><MapPin size={14}/> Permanent Address</span>
                <span className="text-white font-medium block">
                {agent.Address?.addressLine1}{agent.Address?.addressLine2 ? `, ${agent.Address.addressLine2}` : ''}<br />
                {agent.Address?.city}, {agent.Address?.state} {agent.Address?.postalCode}<br />
                {agent.Address?.country}
                </span>
            </div>
            <div className="mt-2 text-sm border-t border-white/5 pt-3">
                <span className="text-zinc-500 block mb-1 flex items-center gap-1"><MapPin size={14}/> Mailing Address</span>
                <span className="text-white font-medium block">
                {agent.MailingAddress?.addressLine1 || agent.Address?.addressLine1}{(agent.MailingAddress?.addressLine2 || agent.Address?.addressLine2) ? `, ${agent.MailingAddress?.addressLine2 || agent.Address?.addressLine2}` : ''}<br />
                {agent.MailingAddress?.city || agent.Address?.city}, {agent.MailingAddress?.state || agent.Address?.state} {agent.MailingAddress?.postalCode || agent.Address?.postalCode}<br />
                {agent.MailingAddress?.country || agent.Address?.country}
                </span>
            </div>
            </div>

            {/* Document details */}
            <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-medium flex items-center gap-2 border-b border-white/10 pb-3"><FileText size={18} className="text-zinc-400"/> Document Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-zinc-500 block mb-1">ID Type</span><span className="text-white font-medium capitalize">{documentDetails.idtype}</span></div>
                <div><span className="text-zinc-500 block mb-1">ID Number</span><span className="text-white font-medium">{documentDetails.idno}</span></div>
                <div><span className="text-zinc-500 block mb-1">DOB</span><span className="text-white font-medium">{documentDetails.DOB || "N/A"}</span></div>
                <div><span className="text-zinc-500 block mb-1">Issued By</span><span className="text-white font-medium">{documentDetails.issuedBy || "N/A"}</span></div>
                <div><span className="text-zinc-500 block mb-1">Issued Date</span><span className="text-white font-medium">{documentDetails.issuedDate || "N/A"}</span></div>
                <div><span className="text-zinc-500 block mb-1">Valid Till</span><span className="text-white font-medium">{documentDetails.validTill || "N/A"}</span></div>
            </div>
            </div>
        </div>

        <div className="space-y-6">
            {/* Captured Media */}
            <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-white font-medium flex items-center gap-2 border-b border-white/10 pb-3"><ImageIcon size={18} className="text-zinc-400"/> Captured Images</h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold text-center">ID Card</span>
                        <div className="aspect-square bg-black border border-white/10 rounded-lg overflow-hidden w-full relative">
                            <SecureDocument objectKey={documentDetails.id_ImageURL} type="cover" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold text-center">Selfie</span>
                        <div className="aspect-square bg-black border border-white/10 rounded-lg overflow-hidden w-full relative">
                            <SecureDocument objectKey={selfieUrl} type="cover" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold text-center">Selfie + ID</span>
                        <div className="aspect-square bg-black border border-white/10 rounded-lg overflow-hidden w-full relative">
                            <SecureDocument objectKey={selfieIdUrl} type="cover" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Device Fingerprint Summary */}
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-5">
            <h3 className="text-[#D4AF37] text-sm font-semibold mb-3 flex items-center gap-2"><Server size={14}/> Immutable Device Telemetry</h3>
            
            <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-500">IP Address:</span><span className="text-zinc-300 font-mono">{metadata.ip_address}</span></div>
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-500 flex items-center gap-1"><Globe size={10}/> Location:</span><span className="text-zinc-300">{metadata.geolocation?.city}, {metadata.geolocation?.country}</span></div>
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-500">Device Model:</span><span className="text-zinc-300">{metadata.inferredDevice?.device_brand} {metadata.inferredDevice?.device_model}</span></div>
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-500">OS version:</span><span className="text-zinc-300">{metadata.inferredDevice?.os_name} {metadata.inferredDevice?.os_version}</span></div>
                <div className="pt-1">
                    <span className="text-zinc-500 block mb-1 flex items-center gap-1"><Hash size={10}/> Device Fingerprint Hash:</span>
                    <span className="block w-full bg-black p-2 rounded border border-white/5 text-zinc-400 font-mono break-all">{metadata.device_fingerprint_hash}</span>
                </div>
            </div>
            
            </div>
        </div>

      </div>

      <div className="flex items-center gap-3 mt-8">
        <button onClick={onBack} disabled={isSubmitting} className="px-6 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition disabled:opacity-50">
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#FFA500] hover:from-[#c4a133] hover:to-[#e69500] text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" /> : null}
          {isSubmitting ? "Cryptographically Signing & Submitting..." : "Sign & Submit Verification"}
        </button>
      </div>
    </div>
  );
}
