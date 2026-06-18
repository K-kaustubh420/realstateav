"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Map } from "lucide-react";
import gsap from "gsap";

export default function Step3Location({ onboarding }: { onboarding: any }) {
  const { formData, updateAddress, locateMe, nextStep, prevStep } = onboarding;
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
    if (!formData.Address.AddressLine1.trim()) newErrors.push("Address Line 1 is required.");
    if (!formData.Address.City.trim()) newErrors.push("City is required.");
    if (!formData.Address.State.trim()) newErrors.push("State/Province is required.");
    if (!formData.Address.Country.trim()) newErrors.push("Country is required.");

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
          <p className="text-gray-500 dark:text-gray-400">Set your primary location. You can always change this later.</p>
        </div>
        <button 
          onClick={locateMe}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <Navigation size={16} />
          <span className="hidden sm:inline">Locate Me</span>
        </button>
      </div>

      <div className="flex-grow space-y-6 overflow-y-auto pb-6 pr-2">
        
        {/* GPS Location Indicator */}
        <div className="bg-gray-50 dark:bg-[#151515] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-black dark:text-white shrink-0">
            <Map size={24} />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-black dark:text-white text-sm">GPS Coordinates</h3>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              {formData.location.latitute && formData.location.longitute 
                ? `${parseFloat(formData.location.latitute).toFixed(6)}, ${parseFloat(formData.location.longitute).toFixed(6)}` 
                : "Not set. Click 'Locate Me' to detect automatically."}
            </p>
          </div>
          {formData.location.latitute && (
            <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full">
              Detected
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-black dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">Address</h3>
          
          <div className="form-control w-full">
            <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Address Line 1 <span className="text-gray-400">*</span></span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <MapPin size={18} />
              </div>
              <input 
                type="text" 
                placeholder="123 Main St, Apartment 4B"
                value={formData.Address.AddressLine1} 
                onChange={(e) => updateAddress("AddressLine1", e.target.value)}
                className={`w-full pl-12 pr-4 py-3 bg-transparent text-black dark:text-white rounded-xl border ${errors.some(e => e.includes("Address Line 1")) ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-black dark:focus:border-white focus:outline-none transition-colors`} 
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Address Line 2 <span className="text-gray-400 font-normal">(Optional)</span></span></label>
            <input 
              type="text" 
              placeholder="Building, Floor, etc."
              value={formData.Address.AddressLine2} 
              onChange={(e) => updateAddress("AddressLine2", e.target.value)}
              className="w-full px-4 py-3 bg-transparent text-black dark:text-white rounded-xl border border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:outline-none transition-colors" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">City <span className="text-gray-400">*</span></span></label>
              <input 
                type="text" 
                placeholder="New York"
                value={formData.Address.City} 
                onChange={(e) => updateAddress("City", e.target.value)}
                className={`w-full px-4 py-3 bg-transparent text-black dark:text-white rounded-xl border ${errors.some(e => e.includes("City")) ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-black dark:focus:border-white focus:outline-none transition-colors`} 
              />
            </div>
            
            <div className="form-control w-full">
              <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">State / Province <span className="text-gray-400">*</span></span></label>
              <input 
                type="text" 
                placeholder="NY"
                value={formData.Address.State} 
                onChange={(e) => updateAddress("State", e.target.value)}
                className={`w-full px-4 py-3 bg-transparent text-black dark:text-white rounded-xl border ${errors.some(e => e.includes("State")) ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-black dark:focus:border-white focus:outline-none transition-colors`} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Postal Code</span></label>
              <input 
                type="text" 
                placeholder="10001"
                value={formData.Address.PostalCode} 
                onChange={(e) => updateAddress("PostalCode", e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-black dark:text-white rounded-xl border border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white focus:outline-none transition-colors" 
              />
            </div>
            
            <div className="form-control w-full">
              <label className="label mb-1 block"><span className="text-sm font-semibold text-black dark:text-white">Country <span className="text-gray-400">*</span></span></label>
              <input 
                type="text" 
                placeholder="United States"
                value={formData.Address.Country} 
                onChange={(e) => updateAddress("Country", e.target.value)}
                className={`w-full px-4 py-3 bg-transparent text-black dark:text-white rounded-xl border ${errors.some(e => e.includes("Country")) ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:border-black dark:focus:border-white focus:outline-none transition-colors`} 
              />
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-sm p-4 rounded-xl border border-red-200 dark:border-red-900/50">
            <ul className="space-y-1">
              {errors.map((err, i) => <li key={i}>• {err}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-8 mt-auto flex justify-between">
        <button onClick={prevStep} className="px-8 py-3 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-semibold rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          Back
        </button>
        <button onClick={handleNext} className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-full hover:opacity-80 transition-opacity">
          Next Step
        </button>
      </div>
    </div>
  );
}
