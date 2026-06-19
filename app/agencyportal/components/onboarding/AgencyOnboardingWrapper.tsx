"use client";

import { useAgencyOnboarding } from "@/hooks/useAgencyOnboarding";
import ProgressBar from "./ProgressBar";
import Step1Basics from "./Step1Basics";
import Step2Location from "./Step2Location";
import Step3Branding from "./Step3Branding";
import Step4Review from "./Step4Review";

type Props = {
  defaultValues?: any;
  onSubmit: (values: any) => Promise<void>;
};

export default function AgencyOnboardingWrapper({ defaultValues, onSubmit }: Props) {
  const onboarding = useAgencyOnboarding(onSubmit, defaultValues);

  const totalSteps = 4;
  const percentage = Math.round(((onboarding.currentStep - 1) / totalSteps) * 100);

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-white dark:bg-[#0a0a0a] min-h-[80vh] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg">
      
      {/* Sidebar / Progress Section */}
      <div className="w-full md:w-[320px] lg:w-[400px] bg-gray-50 dark:bg-[#111] p-5 md:p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 z-20">
        <div className="mb-4 md:mb-8">
          <div className="flex items-center justify-between md:mb-2">
            <h2 className="text-lg md:text-xl font-bold text-black dark:text-white">
              Create Agency
            </h2>
            <span className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400">{percentage}%</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 hidden md:block">
            Complete the steps below to set up your agency profile.
          </p>
        </div>

        <ProgressBar currentStep={onboarding.currentStep} />
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 md:p-8 lg:p-12 xl:p-16 relative flex flex-col overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full grow flex flex-col text-black dark:text-white">
          {onboarding.currentStep === 1 && <Step1Basics onboarding={onboarding} />}
          {onboarding.currentStep === 2 && <Step2Location onboarding={onboarding} />}
          {onboarding.currentStep === 3 && <Step3Branding onboarding={onboarding} />}
          {onboarding.currentStep === 4 && <Step4Review onboarding={onboarding} />}
        </div>
      </div>
    </div>
  );
}
