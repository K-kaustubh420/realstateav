"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAgent } from "@/hooks/useAgent";
import { Loader2 } from "lucide-react";

import ProgressBar from "../components/ProgressBar";
import Step1Personal from "../components/Step1Personal";
import Step2Document from "../components/Step2Document";
import Step3Selfie from "../components/Step3Selfie";
import Step4Review from "../components/Step4Review";

import { Agent } from "@/utils/user";
import { Metadata } from "@/utils/id_verify";

export default function IDVerificationPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const targetUid = searchParams.get("uid");
  const { user, loading, agentData, setAgentData } = useAgent();
  
  const [step, setStep] = useState(1);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [documentDetails, setDocumentDetails] = useState<{ idtype: string; idno: string; id_ImageURL: string; DOB: string; issuedBy: string; issuedDate: string; validTill: string; } | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [selfieIdUrl, setSelfieIdUrl] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!user || user.uid !== targetUid || !agentData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-center">
        <h1 className="text-2xl font-bold text-rose-500 mb-2">Unauthorized</h1>
        <p className="text-zinc-400">You must be logged in as the correct agent to view this page.</p>
      </div>
    );
  }

  const handleStep1Next = (collectedMetadata: Metadata, updatedAgent: Agent) => {
    setMetadata(collectedMetadata);
    if (setAgentData) setAgentData(updatedAgent);
    setStep(2);
  };

  const handleStep2Next = (docs: { idtype: string; idno: string; id_ImageURL: string; DOB: string; issuedBy: string; issuedDate: string; validTill: string; }) => {
    setDocumentDetails(docs);
    setStep(3);
  };

  const handleStep3Next = (selfieImgUrl: string, selfieIdImgUrl: string) => {
    setSelfieUrl(selfieImgUrl);
    setSelfieIdUrl(selfieIdImgUrl);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row pb-20 md:pb-0">
      
      {/* Sidebar: Progress Bar */}
      <div className="w-full md:w-80 lg:w-96 bg-[#111] border-b md:border-b-0 md:border-r border-white/10 p-8 flex flex-col md:sticky md:top-0 md:h-screen z-40">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FFA500]">
            Identity Verification
          </h1>
          <p className="text-zinc-400 text-sm mt-2">Complete the 4 steps to secure your agent profile.</p>
        </div>
        
        <ProgressBar currentStep={step} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 pt-10 px-4 md:px-12 lg:px-24 overflow-y-auto">
        <div className="max-w-3xl pb-20">
          {step === 1 && (
            <Step1Personal 
              agent={agentData} 
              onNext={handleStep1Next} 
            />
          )}

          {step === 2 && (
            <Step2Document 
              onNext={handleStep2Next} 
              onBack={() => setStep(1)} 
            />
          )}

          {step === 3 && (
            <Step3Selfie 
              onNext={handleStep3Next} 
              onBack={() => setStep(2)} 
            />
          )}

          {step === 4 && documentDetails && selfieUrl && selfieIdUrl && metadata && (
            <Step4Review 
              agent={agentData}
              metadata={metadata}
              documentDetails={documentDetails}
              selfieUrl={selfieUrl}
              selfieIdUrl={selfieIdUrl}
              onBack={() => setStep(3)}
            />
          )}
        </div>
      </div>

    </div>
  );
}
