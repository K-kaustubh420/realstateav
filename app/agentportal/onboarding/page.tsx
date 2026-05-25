"use client";

import { Suspense } from "react";
import OnboardingWrapper from "../components/onboarding/OnboardingWrapper";

export default function AgentOnboardingPage() {
  return (
    <div className="min-h-screen h-screen w-screen bg-white dark:bg-black overflow-hidden flex font-sans text-black dark:text-white">
        <OnboardingWrapper />
     
    </div>
  );
}
