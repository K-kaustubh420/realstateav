"use client";

import { useUserOnboarding } from "@/lib/users/useUserOnboarding";
import Step1Personal from "./Step1Personal";
import Step2Intent from "./Step2Intent";
import Step3Location from "./Step3Location";
import Step4Review from "./Step4Review";
import ProgressBar from "./ProgressBar";

export default function OnboardingWrapper() {
  const onboarding = useUserOnboarding();

  if (onboarding.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#0a0a0a]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-gray-500">Loading your data...</p>
      </div>
    );
  }

  // Calculate percentage
  const totalSteps = 4;
  const percentage = Math.round(((onboarding.currentStep - 1) / totalSteps) * 100);

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-white dark:bg-[#0a0a0a]">
      
      {/* Sidebar / Progress Section */}
      <div className="w-full md:w-[320px] lg:w-[400px] bg-gray-50 dark:bg-[#111] p-5 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 z-20 overflow-y-auto">
        <div className="mb-4 md:mb-8">
          <div className="flex items-center justify-between md:mb-2">
            <h2 className="text-lg md:text-xl font-bold text-black dark:text-white">
              Getting Started
            </h2>
            <span className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400">{percentage}%</span>
          </div>
        </div>

        <ProgressBar currentStep={onboarding.currentStep} />
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 md:p-8 lg:p-12 xl:p-16 relative flex flex-col overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full flex-grow flex flex-col">
          {onboarding.currentStep === 1 && <Step1Personal onboarding={onboarding} />}
          {onboarding.currentStep === 2 && <Step2Intent onboarding={onboarding} />}
          {onboarding.currentStep === 3 && <Step3Location onboarding={onboarding} />}
          {onboarding.currentStep === 4 && <Step4Review onboarding={onboarding} />}
        </div>
      </div>
    </div>
  );
}
