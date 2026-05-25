"use client";

import { useEffect, useRef } from "react";
import { CheckCircle, MapPin, User, FileText } from "lucide-react";
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

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Review & Submit</h1>
        <p className="text-gray-500 dark:text-gray-400">Please review your details before completing your profile setup.</p>
      </div>

      <div className="flex-grow space-y-6 overflow-y-auto pb-6 pr-2">
        
        {/* Profile Summary Card */}
        <div className="bg-gray-50 dark:bg-[#151515] rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-black dark:border-white flex-shrink-0">
              <img src={formData.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-1">{formData.firstname} {formData.lastname}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{formData.email}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{formData.countryCode} {formData.mobileNumber}</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                <FileText size={14} /> Bio / About
              </h3>
              <p className="text-black dark:text-gray-300 text-sm leading-relaxed italic">
                "{formData.about}"
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest flex items-center gap-2 mb-3">
                <MapPin size={14} /> Location Address
              </h3>
              <div className="text-black dark:text-gray-300 text-sm space-y-1">
                <p>{formData.Address.addressLine1} {formData.Address.addressLine2}</p>
                <p>{formData.Address.city}, {formData.Address.state} {formData.Address.postalCode}</p>
                <p className="font-medium text-black dark:text-white mt-2">{formData.Address.country}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black dark:border-white rounded-xl p-5 flex items-start gap-4">
          <CheckCircle className="text-black dark:text-white mt-0.5 flex-shrink-0" size={20} />
          <p className="text-sm text-black dark:text-white">
            By clicking submit, you agree to our Terms of Service. You can update your profile details later from your dashboard.
          </p>
        </div>

      </div>

      <div className="pt-8 mt-auto flex justify-between">
        <button 
          onClick={prevStep} 
          className="px-6 py-3 font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          disabled={submitting}
        >
          Back
        </button>
        <button 
          onClick={handleSubmit} 
          className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-full hover:opacity-80 transition-opacity flex items-center justify-center min-w-[200px]"
          disabled={submitting}
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Submit Profile"
          )}
        </button>
      </div>
    </div>
  );
}
