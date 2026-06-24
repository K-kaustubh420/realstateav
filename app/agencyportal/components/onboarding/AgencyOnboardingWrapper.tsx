"use client";

import { useAgencyOnboarding } from "@/hooks/useAgencyOnboarding";
import ProgressBar from "./ProgressBar";
import Step1Basics from "./Step1Basics";
import Step2Location from "./Step2Location";
import Step3Legal from "./Step3Legal";
import Step4Review from "./Step4Review";

type Props = {
  defaultValues?: any;
  onSubmit: (values: any) => Promise<void>;
};

export default function AgencyOnboardingWrapper({ defaultValues, onSubmit }: Props) {
  const onboarding = useAgencyOnboarding(onSubmit, defaultValues);

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#FAFAFA] dark:bg-[#0a0a0a]">
      
      {/* Sidebar / Progress Section */}
      <div className="w-full md:w-[380px] lg:w-[450px] relative flex flex-col shrink-0 z-20 overflow-hidden bg-zinc-950 text-white">
        {/* Abstract background blobs/gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-gradient-to-br from-[#D4AF37]/20 via-zinc-900/50 to-transparent blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 -right-[20%] w-64 h-64 bg-amber-600/10 rounded-full blur-[80px] pointer-events-none" />
        </div>
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col h-full">
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-[Playfair_Display] font-bold text-white mb-2 tracking-tight">
              Agency Setup
            </h2>
            <p className="text-sm md:text-base text-zinc-400 max-w-xs">
              Complete the steps below to establish your official agency profile.
            </p>
          </div>

          <ProgressBar currentStep={onboarding.currentStep} />

          <div className="mt-auto pt-8">
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                <span className="text-[#D4AF37] font-bold text-sm">✓</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Secure Registration</p>
                <p className="text-xs text-zinc-400">Your data is encrypted & safe.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 md:p-12 lg:p-16 relative flex flex-col overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto grow flex flex-col bg-white dark:bg-[#111] rounded-3xl shadow-xl dark:shadow-none border border-gray-100 dark:border-zinc-800 p-8 md:p-12 relative overflow-hidden">
          {onboarding.currentStep === 1 && <Step1Basics onboarding={onboarding} />}
          {onboarding.currentStep === 2 && <Step2Location onboarding={onboarding} />}
          {onboarding.currentStep === 3 && <Step3Legal onboarding={onboarding} />}
          {onboarding.currentStep === 4 && <Step4Review onboarding={onboarding} />}
        </div>
      </div>
    </div>
  );
}
