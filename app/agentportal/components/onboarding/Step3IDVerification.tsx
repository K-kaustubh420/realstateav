"use client";

import { useEffect, useRef } from "react";
import { ShieldCheck, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";

export default function Step3IDVerification({ onboarding }: { onboarding: any }) {
  const { uid, nextStep, prevStep } = onboarding;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">ID Verification</h1>
        <p className="text-gray-500 dark:text-gray-400">Build trust with clients by verifying your identity. Verified agents get 3x more leads.</p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 dark:bg-[#151515] rounded-full flex items-center justify-center mb-4">
          <ShieldCheck size={48} className="text-black dark:text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-black dark:text-white">Ready to get verified?</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          You will need a valid government-issued ID (Passport, Driver's License, or National ID) and a device with a camera for a quick selfie.
        </p>

        <div className="flex flex-col gap-4 mt-8 w-full max-w-xs relative">
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('id_verify_choice', 'verify_now');
              }
              nextStep();
            }}
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-full hover:opacity-80 transition-opacity"
          >
            Verify ID Now
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">OR</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
          </div>
          
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('id_verify_choice', 'skip_for_now');
              }
              nextStep();
            }} 
            className="w-full py-3 flex items-center justify-center gap-2 border border-black text-black dark:border-white dark:text-white font-semibold rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <Clock size={16} />
            Skip for now
          </button>
        </div>
        
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-6">
          You can always complete verification later from your dashboard settings.
        </p>
      </div>

      <div className="pt-8 mt-auto flex justify-between">
        <button onClick={prevStep} className="px-6 py-3 font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors">
          Back
        </button>
        <button onClick={nextStep} className="px-6 py-3 font-semibold text-black dark:text-white hover:opacity-70 transition-opacity gap-2 flex items-center">
          Continue without verifying
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
