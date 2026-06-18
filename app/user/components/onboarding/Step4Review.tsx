"use client";

import { useEffect, useRef } from "react";
import { User, MapPin, CheckCircle, Target } from "lucide-react";
import gsap from "gsap";

export default function Step4Review({ onboarding }: { onboarding: any }) {
  const { formData, prevStep, handleSubmit, submitting } = onboarding;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  const getAvatarLetter = () => {
    if (formData.name) return formData.name.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Review & Submit</h1>
        <p className="text-gray-500 dark:text-gray-400">Please review your information before completing your profile setup.</p>
      </div>

      <div className="flex-grow space-y-6 overflow-y-auto pb-6 pr-2">
        {/* Personal Info Summary */}
        <div className="bg-gray-50 dark:bg-[#151515] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <User size={18} className="text-gray-500" />
            <h3 className="font-bold text-black dark:text-white">Personal Info</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 bg-black dark:bg-white text-white dark:text-black text-2xl font-bold shrink-0">
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{getAvatarLetter()}</span>
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold text-black dark:text-white">{formData.name}</h4>
                <p className="text-sm text-gray-500">{formData.email}</p>
                {formData.mobileNumber && <p className="text-sm text-gray-500">{formData.countryCode} {formData.mobileNumber}</p>}
              </div>
            </div>
            {formData.about && (
              <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{formData.about}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Intent Summary */}
        <div className="bg-gray-50 dark:bg-[#151515] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Target size={18} className="text-gray-500" />
            <h3 className="font-bold text-black dark:text-white">Intent & Interests</h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <span className="text-sm text-gray-500 block mb-1">Primary Intent:</span>
              <span className="inline-block px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-full text-sm font-semibold capitalize">
                {formData.intent || "Not set"}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block mb-2">Interests:</span>
              <div className="flex flex-wrap gap-2">
                {formData.exploreintent.map((intent: string) => (
                  <span key={intent} className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                    {intent}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location Summary */}
        <div className="bg-gray-50 dark:bg-[#151515] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <MapPin size={18} className="text-gray-500" />
            <h3 className="font-bold text-black dark:text-white">Location</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
              {formData.Address.AddressLine1} {formData.Address.AddressLine2 && `, ${formData.Address.AddressLine2}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formData.Address.City}, {formData.Address.State} {formData.Address.PostalCode}
            </p>
            <p className="text-sm text-gray-500">
              {formData.Address.Country}
            </p>
          </div>
        </div>

      </div>

      <div className="pt-8 mt-auto flex justify-between">
        <button 
          onClick={prevStep} 
          disabled={submitting}
          className="px-8 py-3 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-semibold rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-full hover:opacity-80 transition-opacity flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
        >
          {submitting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Saving...
            </>
          ) : (
            <>
              Complete Setup <CheckCircle size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
