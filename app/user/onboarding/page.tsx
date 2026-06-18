"use client";

import { Suspense } from "react";
import OnboardingWrapper from "../components/onboarding/OnboardingWrapper";

export default function UserOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-primary loading-lg"></span></div>}>
      <OnboardingWrapper />
    </Suspense>
  );
}
