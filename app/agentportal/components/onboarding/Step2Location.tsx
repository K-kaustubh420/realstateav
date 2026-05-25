"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Home, Hash, Flag } from "lucide-react";
import gsap from "gsap";

export default function Step2Location({ onboarding }: { onboarding: any }) {
  const { formData, updateAddress, nextStep, prevStep, locateMe } = onboarding;
  const [errors, setErrors] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  const handleNext = () => {
    const newErrors = [];
    const addr = formData.Address;
    
    if (!addr.addressLine1.trim()) newErrors.push("Address Line 1 is required.");
    if (!addr.city.trim()) newErrors.push("City is required.");
    if (!addr.state.trim()) newErrors.push("State/Province is required.");
    if (!addr.country.trim()) newErrors.push("Country is required.");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors([]);
    nextStep();
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Location Details</h1>
          <p className="text-gray-500 dark:text-gray-400">Where are you based? This helps local clients find you faster.</p>
        </div>
        <button 
          onClick={locateMe}
          className="px-5 py-2.5 flex items-center gap-2 border border-black text-black dark:border-white dark:text-white rounded-full font-medium hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        >
          <Navigation size={18} />
          Locate Me
        </button>
      </div>

      <div className="flex-grow space-y-6 overflow-y-auto pb-6 pr-2">
        <div className="form-control w-full">
          <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Address Line 1 <span className="text-gray-400">*</span></span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <MapPin size={18} />
            </div>
            <input 
              type="text" 
              placeholder="123 Main Street"
              value={formData.Address.addressLine1} 
              onChange={(e) => updateAddress("addressLine1", e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-transparent text-black dark:text-white rounded-xl border ${errors.some(e => e.includes("Address Line 1")) ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-black dark:focus:border-white focus:outline-none transition-colors`} 
            />
          </div>
        </div>

        <div className="form-control w-full">
          <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Address Line 2 <span className="text-gray-400 font-normal">(Optional)</span></span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Home size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Suite, Apt, or Floor"
              value={formData.Address.addressLine2} 
              onChange={(e) => updateAddress("addressLine2", e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent text-black dark:text-white rounded-xl border border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:outline-none transition-colors" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">City <span className="text-gray-400">*</span></span></label>
            <input 
              type="text" 
              placeholder="e.g. Kathmandu"
              value={formData.Address.city} 
              onChange={(e) => updateAddress("city", e.target.value)}
              className={`w-full px-4 py-3 bg-transparent text-black dark:text-white rounded-xl border ${errors.some(e => e.includes("City")) ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-black dark:focus:border-white focus:outline-none transition-colors`} 
            />
          </div>

          <div className="form-control w-full">
            <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">State / Province <span className="text-gray-400">*</span></span></label>
            <input 
              type="text" 
              placeholder="e.g. Bagmati"
              value={formData.Address.state} 
              onChange={(e) => updateAddress("state", e.target.value)}
              className={`w-full px-4 py-3 bg-transparent text-black dark:text-white rounded-xl border ${errors.some(e => e.includes("State")) ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-black dark:focus:border-white focus:outline-none transition-colors`} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-control w-full">
            <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Postal Code</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Hash size={18} />
              </div>
              <input 
                type="text" 
                placeholder="44600"
                value={formData.Address.postalCode} 
                onChange={(e) => updateAddress("postalCode", e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent text-black dark:text-white rounded-xl border border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:outline-none transition-colors" 
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Country <span className="text-gray-400">*</span></span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Flag size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Nepal"
                value={formData.Address.country} 
                onChange={(e) => updateAddress("country", e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-transparent text-black dark:text-white rounded-xl border ${errors.some(e => e.includes("Country")) ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-black dark:focus:border-white focus:outline-none transition-colors`} 
              />
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-sm p-4 rounded-xl border border-red-200 dark:border-red-900/50 mt-4">
            <ul className="space-y-1">
              {errors.map((err, i) => <li key={i}>• {err}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-8 mt-auto flex justify-between">
        <button onClick={prevStep} className="px-6 py-3 font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors">
          Back
        </button>
        <button onClick={handleNext} className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-full hover:opacity-80 transition-opacity">
          Next Step
        </button>
      </div>
    </div>
  );
}
